import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from supabase import create_client, Client
from app.core.config import settings
import httpx
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Try to initialize Supabase
try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Supabase for scheduler: {e}")
    supabase = None

def send_hostinger_email(api_token: str, mailbox_id: str, to_email: str, subject: str, body: str, attachments: list = None):
    """
    Real implementation using the Hostinger Agentic Mail API.
    Endpoint: POST /api/v1/mailboxes/{mailboxResourceId}/send
    Docs: https://api.mail.hostinger.com
    """
    url = f"https://api.mail.hostinger.com/api/v1/mailboxes/{mailbox_id}/send"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "to": [to_email],
        "subject": subject,
        "text": body
    }
    if attachments:
        payload["attachments"] = attachments
    
    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=15.0)
        if response.status_code == 204:
            logger.info(f"✅ Successfully sent email to {to_email} via Hostinger.")
            return True
        else:
            logger.error(f"❌ Hostinger returned {response.status_code} for {to_email}: {response.text}")
            return False
    except httpx.HTTPError as e:
        logger.error(f"❌ Failed to send email to {to_email}: {e}")
        return False

def process_campaign(campaign_id: str = None):
    """
    Processes campaigns and sends emails.
    If campaign_id is provided, processes only that campaign (for manual trigger).
    Otherwise, processes all active campaigns (for scheduler).
    """
    logger.info(f"[Scheduler] Processing campaigns... (specific: {campaign_id or 'all active'})")
    if not supabase:
        logger.error("[Scheduler] Supabase client not found, aborting.")
        return {"status": "error", "message": "Supabase not configured"}

    results = []

    try:
        # 1. Fetch campaigns
        if campaign_id:
            campaigns_res = supabase.table("outreach_campaigns").select("*").eq("id", campaign_id).execute()
        else:
            campaigns_res = supabase.table("outreach_campaigns").select("*").eq("status", "active").execute()
        
        campaigns = campaigns_res.data
        
        if not campaigns:
            msg = "[Scheduler] No campaigns found to process."
            logger.info(msg)
            return {"status": "ok", "message": msg, "results": []}

        for campaign in campaigns:
            campaign_result = {"campaign": campaign['name'], "emails_sent": 0, "errors": []}
            logger.info(f"[Scheduler] ▶ Processing campaign: {campaign['name']}")
            
            # 2. Get the associated email account
            account_res = supabase.table("outreach_email_accounts").select("*").eq("id", campaign['account_id']).execute()
            if not account_res.data:
                err = f"Email account not found for campaign {campaign['name']}"
                logger.warning(err)
                campaign_result["errors"].append(err)
                results.append(campaign_result)
                continue
                
            account = account_res.data[0]
            logger.info(f"[Scheduler]   Account: {account['email']} | Mailbox ID: {account.get('mailbox_id', 'MISSING')}")
            
            if account['status'] != 'Connected':
                err = f"Email account {account['email']} is not connected (status: {account['status']})"
                logger.warning(err)
                campaign_result["errors"].append(err)
                results.append(campaign_result)
                continue

            # Check for API token
            api_token = account.get('api_token', '')
            if not api_token:
                # Try to get it from global settings
                settings_res = supabase.table("outreach_global_settings").select("value").eq("key", "hostinger_api_key").execute()
                if settings_res.data:
                    api_token = settings_res.data[0]['value']
                    logger.info("[Scheduler]   Using API token from global settings.")
                else:
                    err = "No API token found in account or global settings."
                    logger.error(err)
                    campaign_result["errors"].append(err)
                    results.append(campaign_result)
                    continue

            mailbox_id = account.get('mailbox_id', '')
            if not mailbox_id:
                err = f"No mailbox_id (resourceId) found for account {account['email']}. Re-sync from Hostinger."
                logger.error(err)
                campaign_result["errors"].append(err)
                results.append(campaign_result)
                continue
                
            # Check daily limits
            sent_today = account.get('sent_today', 0) or 0
            remaining_limit = account.get('daily_limit', 500) - sent_today
            campaign_daily_limit = campaign.get('daily_limit', 50)
            
            send_allowance = min(remaining_limit, campaign_daily_limit)
            
            if send_allowance <= 0:
                err = f"Daily limit reached for account {account['email']}."
                logger.info(err)
                campaign_result["errors"].append(err)
                results.append(campaign_result)
                continue

            # 3. Fetch pending contacts for this campaign's import list
            contacts_res = supabase.table("outreach_contacts").select("*").eq("import_id", campaign['import_id']).eq("status", "pending").limit(send_allowance).execute()
            pending_contacts = contacts_res.data
            
            if not pending_contacts:
                err = f"No pending contacts left for campaign {campaign['name']}."
                logger.info(err)
                campaign_result["errors"].append(err)
                results.append(campaign_result)
                continue
            
            logger.info(f"[Scheduler]   Found {len(pending_contacts)} pending contacts. Sending up to {send_allowance}...")
            emails_sent = 0
            
            # Prepare attachment if exists
            attachments = None
            attachment_path = campaign.get('attachment_path')
            attachment_name = campaign.get('attachment_name') or "brochure.pdf"
            
            if attachment_path:
                import os
                import base64
                if os.path.exists(attachment_path):
                    try:
                        with open(attachment_path, "rb") as f:
                            file_content = f.read()
                            b64_content = base64.b64encode(file_content).decode('utf-8')
                            
                        # Infer content type simply from extension
                        ext = attachment_name.split('.')[-1].lower() if '.' in attachment_name else 'pdf'
                        content_type = "application/pdf"
                        if ext in ['png', 'jpg', 'jpeg']:
                            content_type = f"image/{ext if ext != 'jpg' else 'jpeg'}"
                            
                        attachments = [{
                            "filename": attachment_name,
                            "content": b64_content,
                            "contentType": content_type
                        }]
                        logger.info(f"[Scheduler]   Loaded attachment: {attachment_name}")
                    except Exception as e:
                        logger.error(f"[Scheduler]   Failed to load attachment: {e}")
                else:
                    logger.warning(f"[Scheduler]   Attachment path not found on disk: {attachment_path}")
            
            # 4. Send emails
            for contact in pending_contacts:
                to_email = contact['email']
                
                name = contact.get('name') or "there"
                company = contact.get('company') or ""
                
                # Replace template variables
                subject = campaign['template_subject'].replace("{email}", to_email).replace("{name}", name).replace("{company}", company)
                body = campaign['template_body'].replace("{email}", to_email).replace("{name}", name).replace("{company}", company)
                
                logger.info(f"[Scheduler]   Sending to: {to_email} ...")
                
                # Send the email
                success = send_hostinger_email(api_token, mailbox_id, to_email, subject, body, attachments=attachments)
                
                if success:
                    # Update contact status with real timestamp
                    now_iso = datetime.now(timezone.utc).isoformat()
                    supabase.table("outreach_contacts").update({
                        "status": "sent",
                        "sent_at": now_iso
                    }).eq("id", contact['id']).execute()
                    emails_sent += 1
                else:
                    supabase.table("outreach_contacts").update({
                        "status": "failed"
                    }).eq("id", contact['id']).execute()
            
            # 5. Update account sent_today counter
            if emails_sent > 0:
                new_sent_today = sent_today + emails_sent
                supabase.table("outreach_email_accounts").update({
                    "sent_today": new_sent_today
                }).eq("id", account['id']).execute()
                
                logger.info(f"[Scheduler] ✅ Sent {emails_sent} emails for campaign {campaign['name']}.")
            
            campaign_result["emails_sent"] = emails_sent
            results.append(campaign_result)

    except Exception as e:
        logger.error(f"[Scheduler] Error processing campaigns: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

    return {"status": "ok", "results": results}


# Backward-compatible alias
def process_active_campaigns():
    return process_campaign(campaign_id=None)


# Create the scheduler instance
scheduler = BackgroundScheduler()

def start_scheduler():
    """Starts the background scheduler"""
    if not scheduler.running:
        # Schedule the job to run every day at 9:00 AM
        trigger = CronTrigger(hour=9, minute=0)
        
        scheduler.add_job(process_active_campaigns, trigger=trigger, id="daily_campaign_processor", replace_existing=True)
        scheduler.start()
        logger.info("Campaign scheduler started.")

def shutdown_scheduler():
    """Shuts down the scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Campaign scheduler shut down.")
