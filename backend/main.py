from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import asyncio
import os

# Load environment variables first (if .env is used, though pydantic_settings handles it)
from dotenv import load_dotenv
load_dotenv()

from app.api.v1.endpoints import whatsapp
from app.services.webhook_sync import sync_webhook

from app.api import webhook_routes, file_routes
from app.services.campaign_scheduler import start_scheduler, shutdown_scheduler, process_campaign

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

import threading

def _background_webhook_sync():
    """
    Background thread: waits for the server to be fully live,
    then registers the webhook with Meta (with retries).
    This MUST run outside lifespan because lifespan blocks the server
    from accepting connections — Meta's verification probe would time out.
    """
    import time
    import requests as _requests

    # Wait for the server to be fully live and accepting connections
    logger.info("[webhook_sync_bg] Waiting for server to be ready...")
    for attempt in range(20):
        time.sleep(3)
        try:
            port = os.environ.get("PORT", "8000")
            resp = _requests.get(f"http://localhost:{port}/", timeout=2)
            if resp.status_code == 200:
                logger.info("[webhook_sync_bg] Server is live — starting webhook sync")
                break
        except Exception:
            pass
    else:
        logger.warning("[webhook_sync_bg] Server didn't become ready in time, attempting sync anyway")

    # Retry sync up to 3 times
    for attempt in range(1, 4):
        success = sync_webhook()
        if success:
            return
        logger.warning(f"[webhook_sync_bg] Sync attempt {attempt}/3 failed, retrying in 10s...")
        time.sleep(10)

    logger.error("[webhook_sync_bg] All 3 sync attempts failed. Use POST /admin/sync-webhook to retry manually.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan — runs on startup and shutdown.
    Webhook sync is launched as a background THREAD (not awaited)
    so the server can start accepting connections immediately.
    """
    # ── STARTUP ──
    logger.info("🚀 Aatomate API starting up...")

    # Fire-and-forget: sync runs AFTER the server is live
    t = threading.Thread(target=_background_webhook_sync, daemon=True)
    t.start()
    
    # Start Outreach Campaign Scheduler
    start_scheduler()

    yield  # Server is running and accepting connections

    # ── SHUTDOWN ──
    logger.info("👋 Aatomate API shutting down...")
    shutdown_scheduler()


app = FastAPI(title="Aatomate AI WhatsApp CRM", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(whatsapp.router, tags=["WhatsApp Webhook"])
app.include_router(webhook_routes.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(file_routes.router, prefix="/api/files", tags=["Files"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Aatomate API is running."}

# ── Manual webhook sync endpoint (for on-demand re-sync) ──
@app.post("/admin/sync-webhook")
async def manual_webhook_sync():
    """
    Manually trigger webhook URL sync with Meta.
    Useful after ngrok restarts without restarting the server.
    """
    loop = asyncio.get_event_loop()
    success = await loop.run_in_executor(None, sync_webhook)
    return {
        "status": "ok" if success else "error",
        "message": "Webhook synced successfully" if success else "Webhook sync failed — check server logs"
    }

# ── Manual campaign trigger endpoint ──
from pydantic import BaseModel
from typing import Optional

class CampaignSendRequest(BaseModel):
    campaign_id: Optional[str] = None

@app.post("/api/campaigns/send")
async def manual_campaign_send(payload: CampaignSendRequest = CampaignSendRequest()):
    """
    Manually trigger email sending for a specific campaign.
    Body: { "campaign_id": "uuid" }
    If no campaign_id provided, processes all active campaigns.
    """
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: process_campaign(payload.campaign_id))
    return result
