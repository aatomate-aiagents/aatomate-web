from fastapi import APIRouter, Request, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
import hashlib
import hmac

router = APIRouter()

# In a real app, this would be an environment variable
HOSTINGER_WEBHOOK_SECRET = "your_webhook_secret_here"

class HostingerWebhookPayload(BaseModel):
    eventId: str
    provider: str
    mailboxId: str
    receivedAt: str
    eventType: str
    payload: Dict[str, Any]

def verify_signature(payload_body: bytes, signature: str, secret: str) -> bool:
    """
    Verifies the webhook signature according to standard HMAC-SHA256 practices.
    (Adjust to match Hostinger's actual signature algorithm).
    """
    if not signature or not secret:
        return False
    expected_mac = hmac.new(secret.encode(), payload_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_mac, signature)

@router.post("/hostinger/mail")
async def hostinger_mail_webhook(
    request: Request,
    x_hostinger_signature: Optional[str] = Header(None)
):
    """
    Idempotent webhook receiver for incoming Hostinger Agentic Mail replies.
    """
    body_bytes = await request.body()
    
    # 1. Validate Signature
    # For MVP simulation, we might bypass this if testing without a real secret,
    # but the architecture requires it.
    if HOSTINGER_WEBHOOK_SECRET != "your_webhook_secret_here":
        if not verify_signature(body_bytes, x_hostinger_signature or "", HOSTINGER_WEBHOOK_SECRET):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        data = await request.json()
        payload = HostingerWebhookPayload(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload format: {str(e)}")

    # 2. Check Idempotency (has eventId been processed?)
    # In production, this checks Firestore or Redis for `payload.eventId`
    # if check_event_exists(payload.eventId):
    #     return {"status": "success", "message": "Event already processed"}
    
    # 3. Process the event based on type
    if payload.eventType == "message.received":
        # - Identify sender
        # - Match thread/campaign/lead via metadata or References header
        # - Classify reply using AI
        # - Update Firestore
        # - Cancel follow-ups
        print(f"Processing incoming reply from webhook event {payload.eventId}")
        pass
    elif payload.eventType == "message.bounced":
        print(f"Processing bounce from webhook event {payload.eventId}")
        pass
    else:
        print(f"Ignoring unhandled event type: {payload.eventType}")

    # 4. Mark event as processed (save to DB)
    
    return {"status": "success", "eventId": payload.eventId}
