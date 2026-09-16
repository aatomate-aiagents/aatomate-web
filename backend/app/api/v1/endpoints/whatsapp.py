from fastapi import APIRouter, Request, Response, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import logging
import time
from app.core.config import settings
from app.services.state_machine import BotStateMachine
from app.db.supabase import db

logger = logging.getLogger(__name__)
router = APIRouter()

# ── In-memory fallback for chat state when DB is unavailable ──────────────
_in_memory_chats: dict = {}  # keyed by phone_number -> {"state": ..., "lead_data": ...}

# ── Message deduplication (in-memory) ─────────────────────────────────────
_processed_message_ids: dict = {}
_DEDUP_TTL = 300

def _is_duplicate(mid: str) -> bool:
    now = time.time()
    expired = [k for k, v in _processed_message_ids.items() if now - v > _DEDUP_TTL]
    for k in expired:
        del _processed_message_ids[k]
    if mid in _processed_message_ids:
        return True
    _processed_message_ids[mid] = now
    return False


@router.get("/webhook/whatsapp")
def verify_whatsapp_webhook(request: Request):
    """
    Meta Webhook Verification Endpoint.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    logger.info(f"[verify] mode={mode} token={'***' if token else 'None'} challenge={challenge}")

    if mode and token:
        if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
            logger.info("WEBHOOK_VERIFIED successfully")
            return Response(content=challenge, status_code=200, media_type="text/plain")
        else:
            logger.warning(f"[verify] Token mismatch: got '{token}', expected '{settings.WHATSAPP_VERIFY_TOKEN}'")
            raise HTTPException(status_code=403, detail="Verification token mismatch")
    raise HTTPException(status_code=400, detail="Missing parameters")

@router.post("/webhook/whatsapp")
async def receive_whatsapp_message(request: Request, background_tasks: BackgroundTasks):
    """
    Meta Webhook POST Endpoint for incoming messages.
    """
    try:
        body = await request.json()
        logger.info(f"[webhook] POST received | object={body.get('object')} entries={len(body.get('entry', []))}")
        
        if body.get("object") != "whatsapp_business_account":
            logger.warning(f"[webhook] Rejected: not a whatsapp_business_account payload, got: {body.get('object')}")
            return JSONResponse(status_code=400, content={"status": "error", "message": "Not a WhatsApp payload"})

        for entry in body.get("entry", []):
            entry_id = entry.get("id", "unknown")
            for change in entry.get("changes", []):
                value = change.get("value", {})
                field = change.get("field", "unknown")
                logger.info(f"[webhook] Processing change: field={field} entry_id={entry_id}")
                
                # Handle status updates (delivery receipts etc.) — just log & skip
                if "statuses" in value:
                    for status in value["statuses"]:
                        logger.info(f"[webhook] Status update: {status.get('status')} for {status.get('recipient_id', '?')}")
                        if status.get("status") == "failed":
                            err = status.get("errors", [{}])[0]
                            logger.error(f"[webhook] DELIVERY FAILED to {status.get('recipient_id')} | Error: {err.get('message')} (code: {err.get('code')}) | Details: {err.get('error_data', {}).get('details')}")
                    if "messages" not in value:
                        continue  # Use continue, not return — process other entries
                
                if "messages" not in value:
                    logger.info(f"[webhook] No messages in this change (field={field}), skipping")
                    continue  # Use continue, not return — process other entries
                
                metadata = value.get("metadata", {})
                phone_number_id = metadata.get("phone_number_id")
                display_phone = metadata.get("display_phone_number", "?")
                logger.info(f"[webhook] Message metadata: phone_number_id={phone_number_id} display={display_phone}")
                
                # Warn if phone_number_id doesn't match, but still process
                # (the WABA-level webhook override ensures only our messages arrive here)
                if phone_number_id and phone_number_id != settings.WHATSAPP_PHONE_NUMBER_ID:
                    logger.warning(f"[webhook] phone_number_id mismatch: got={phone_number_id} expected={settings.WHATSAPP_PHONE_NUMBER_ID} — processing anyway (WABA override active)")
                
                for msg in value["messages"]:
                    phone_number = msg.get("from")
                    message_id = msg.get("id", "")
                    msg_type = msg.get("type", "unknown")
                    logger.info(f"[webhook] Message: from={phone_number} id={message_id} type={msg_type}")
                    
                    # Dedup — skip already-processed messages
                    if message_id and _is_duplicate(message_id):
                        logger.info(f"[webhook] Skipping duplicate message {message_id}")
                        continue
                    
                    if msg_type == "text":
                        text_body = msg.get("text", {}).get("body", "")
                        logger.info(f"[webhook] Text message from {phone_number}: '{text_body[:100]}'")
                        background_tasks.add_task(handle_incoming_message, phone_number, text_body, False, None)
                        
                    elif msg_type == "interactive" and "interactive" in msg:
                        interactive_id = None
                        interactive_title = ""
                        interactive = msg["interactive"]
                        
                        if interactive.get("type") == "button_reply" and "button_reply" in interactive:
                            interactive_id = interactive["button_reply"].get("id")
                            interactive_title = interactive["button_reply"].get("title")
                        elif interactive.get("type") == "list_reply" and "list_reply" in interactive:
                            interactive_id = interactive["list_reply"].get("id")
                            interactive_title = interactive["list_reply"].get("title")
                        elif interactive.get("type") == "nfm_reply" and "nfm_reply" in interactive:
                            interactive_id = "flow_submission"
                            interactive_title = "Flow Submitted"
                            logger.info(f"[webhook] Received Flow Submission data: {interactive['nfm_reply'].get('response_json')}")
                        
                        logger.info(f"[webhook] Interactive message from {phone_number}: id={interactive_id} title='{interactive_title}'")
                        background_tasks.add_task(handle_incoming_message, phone_number, interactive_title, True, interactive_id)
                    else:
                        # Handle unsupported types (e.g. reaction, sticker, location, contacts, etc.)
                        logger.info(f"[webhook] Unsupported message type '{msg_type}' from {phone_number} — treating as text greeting")
                        background_tasks.add_task(handle_incoming_message, phone_number, "hi", False, None)

        return Response(content="EVENT_RECEIVED", status_code=200)
    except Exception as e:
        logger.error(f"[webhook] Processing error: {e}", exc_info=True)
        return Response(content="EVENT_RECEIVED", status_code=200)


@router.post("/webhook/flow")
async def handle_flow_webhook(request: Request):
    """
    Stub endpoint for WhatsApp Flow data_exchange requests.
    Returns a valid close-screen response so Meta stops retrying with 404s.
    """
    logger.info("[flow stub] Received /webhook/flow request — returning close screen")
    return JSONResponse(content={
        "version": "3.0",
        "screen": "SUCCESS",
        "data": {
            "extension_message_response": {
                "params": {
                    "flow_token": "unused",
                    "status": "close"
                }
            }
        }
    })


async def handle_incoming_message(phone_number: str, user_input: str, is_interactive: bool, interactive_id: str):
    """
    Wrapper around the state machine for the background task.
    Works with DB when available, falls back to in-memory state when not.
    """
    logger.info(f"Message from {phone_number}: '{user_input}' (Interactive: {is_interactive}, ID: {interactive_id})")
    
    lead_id = None
    chat_id = None
    
    if db:
        try:
            # 1. Fetch or create Lead
            lead_response = db.table("leads").select("id").eq("phone", phone_number).execute()
            if lead_response.data:
                lead_id = lead_response.data[0]["id"]
            else:
                lead_insert = db.table("leads").insert({
                    "phone": phone_number,
                    "name": f"WhatsApp Lead {phone_number}",
                    "status": "new"
                }).execute()
                if lead_insert.data:
                    lead_id = lead_insert.data[0]["id"]

            # 2. Fetch or create WhatsApp Chat session
            chat_response = db.table("whatsapp_chats").select("id").eq("phone_number", phone_number).execute()
            if chat_response.data:
                chat_id = chat_response.data[0]["id"]
            else:
                chat_insert = db.table("whatsapp_chats").insert({
                    "phone_number": phone_number,
                    "lead_id": lead_id,
                    "bot_state": {"state": "MAIN_MENU", "lead_data": {}}
                }).execute()
                if chat_insert.data:
                    chat_id = chat_insert.data[0]["id"]
        except Exception as e:
            logger.error(f"Error fetching/creating lead or chat: {e}", exc_info=True)
    else:
        logger.warning("DB not available — using in-memory chat state")
        # In-memory fallback: use phone number as the key
        if phone_number not in _in_memory_chats:
            _in_memory_chats[phone_number] = {"state": "MAIN_MENU", "lead_data": {}}
        chat_id = f"mem_{phone_number}"

    await BotStateMachine.process_user_input(
        phone_number=phone_number, 
        chat_id=chat_id, 
        lead_id=lead_id, 
        user_input=user_input, 
        is_interactive=is_interactive, 
        interactive_id=interactive_id
    )
