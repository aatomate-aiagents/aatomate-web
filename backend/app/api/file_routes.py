from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import re
import pandas as pd
from pdfminer.high_level import extract_text
import tempfile
import os
from supabase import create_client, Client
from app.core.config import settings

router = APIRouter()

# Initialize Supabase Admin Client
try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    print(f"Supabase not configured correctly: {e}")
    supabase = None

EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

def extract_contacts_from_text(text: str) -> list:
    contacts = []
    seen_emails = set()
    
    matches = re.finditer(EMAIL_REGEX, text)
    for match in matches:
        email = match.group(0)
        if email in seen_emails:
            continue
        seen_emails.add(email)
        
        # Heuristic 1: Parse name from email prefix
        prefix = email.split('@')[0]
        # Remove numbers and special chars, replace dots/underscores with space
        name_clean = re.sub(r'[0-9]+', '', prefix)
        name_clean = name_clean.replace('.', ' ').replace('_', ' ').replace('-', ' ').strip()
        name = name_clean.title() if name_clean else ""
        
        # Heuristic 2: Company from domain
        domain = email.split('@')[1]
        domain_name = domain.split('.')[0]
        company = domain_name.title() if domain_name.lower() not in ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud'] else ""
        
        contacts.append({
            "email": email,
            "name": name,
            "company": company
        })
    return contacts

def parse_file_for_contacts(file_path: str) -> list:
    contacts = []
    ext = file_path.lower().split('.')[-1]
    
    try:
        if ext == 'pdf':
            text = extract_text(file_path)
            contacts = extract_contacts_from_text(text)
        elif ext in ['csv', 'xlsx', 'xls']:
            if ext == 'csv':
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
                
            email_col = next((c for c in df.columns if 'email' in str(c).lower()), None)
            name_col = next((c for c in df.columns if 'name' in str(c).lower() and 'company' not in str(c).lower()), None)
            company_col = next((c for c in df.columns if 'company' in str(c).lower() or 'business' in str(c).lower()), None)
            
            seen = set()
            if email_col:
                for _, row in df.iterrows():
                    email = str(row[email_col]).strip()
                    if '@' in email and email not in seen:
                        seen.add(email)
                        name = str(row[name_col]).strip() if name_col and pd.notna(row[name_col]) else ""
                        if not name or name == 'nan':
                            prefix = email.split('@')[0]
                            name_clean = re.sub(r'[0-9]+', '', prefix).replace('.', ' ').replace('_', ' ').replace('-', ' ').strip()
                            name = name_clean.title()
                        
                        company = str(row[company_col]).strip() if company_col and pd.notna(row[company_col]) else ""
                        if company == 'nan': company = ""
                        
                        contacts.append({"email": email, "name": name, "company": company})
            else:
                # Fallback to text parsing
                for col in df.select_dtypes(include=['object']):
                    text = " ".join(df[col].dropna().astype(str).tolist())
                    contacts.extend(extract_contacts_from_text(text))
                    
            # Deduplicate by email
            unique = {c['email']: c for c in contacts}
            contacts = list(unique.values())
            
    except Exception as e:
        print(f"Error parsing file {file_path}: {e}")
        
    return contacts

@router.post("/process")
async def process_file(file: UploadFile = File(...)):
    """
    Receives a file upload directly, parses it for emails, 
    creates an import record, and saves extracted contacts.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Save uploaded file to temp location
    ext = file.filename.split('.')[-1] if file.filename else 'csv'
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # 1. Create DB import record
        file_size = len(content)
        insert_res = supabase.table("outreach_imports").insert({
            "file_name": file.filename or "unknown",
            "file_type": ext,
            "size": file_size,
            "status": "processing"
        }).execute()
        
        import_record = insert_res.data[0]
        import_id = import_record['id']
        print(f"Created import record: {import_id}")

        # 2. Parse emails from the file
        contacts = parse_file_for_contacts(tmp_path)
        print(f"Extracted {len(contacts)} contacts from {file.filename}")

        # 3. Save contacts to outreach_contacts
        if contacts:
            contacts_data = [
                {"import_id": import_id, "email": c["email"], "name": c["name"], "company": c["company"]} for c in contacts
            ]
            supabase.table("outreach_contacts").insert(contacts_data).execute()

        # 4. Update import status
        supabase.table("outreach_imports").update({
            "status": "completed",
            "emails_detected": len(contacts),
            "records": len(contacts)
        }).eq("id", import_id).execute()

        return {
            "status": "success",
            "import_id": import_id,
            "emails_found": len(contacts),
            "emails": [c["email"] for c in contacts][:20]  # Preview first 20
        }

    except Exception as e:
        print(f"Failed to process file: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/upload-brochure")
async def upload_brochure(file: UploadFile = File(...)):
    """
    Uploads a brochure file (e.g. PDF) for use in email campaigns.
    Saves the file to the local uploads directory.
    """
    import uuid
    import shutil
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename to avoid overwrites
    file_ext = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'pdf'
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "status": "success",
            "filename": file.filename,
            "path": file_path
        }
    except Exception as e:
        print(f"Failed to upload brochure: {e}")
        raise HTTPException(status_code=500, detail=str(e))

