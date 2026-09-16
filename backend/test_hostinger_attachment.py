import os
from supabase import create_client
import httpx
from app.core.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Get API key
res = supabase.table("outreach_global_settings").select("value").eq("key", "hostinger_api_key").execute()
if not res.data:
    print("No hostinger_api_key found")
    exit()
api_token = res.data[0]['value']

# Get Mailbox ID from outreach_email_accounts
acc_res = supabase.table("outreach_email_accounts").select("*").execute()
if not acc_res.data:
    print("No email accounts found")
    exit()
mailbox_id = acc_res.data[0]['mailbox_id']

import base64
sample_pdf = b"%PDF-1.4\n1 0 obj\n<<\n/Title (Test)\n>>\nendobj\n"
base64_pdf = base64.b64encode(sample_pdf).decode('utf-8')

url = f"https://api.mail.hostinger.com/api/v1/mailboxes/{mailbox_id}/send"
headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}
payload = {
    "to": ["vanshgehlot9090@gmail.com"],
    "subject": "Test Attachment",
    "text": "This is a test with attachment.",
    "attachments": [
        {
            "filename": "brochure.pdf",
            "content": base64_pdf,
            "contentType": "application/pdf"
        }
    ]
}

response = httpx.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
