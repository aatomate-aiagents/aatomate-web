-- =========================================================
-- STEP 1: CREATE THE STORAGE BUCKET FOR FILE UPLOADS
-- =========================================================
-- This will create the 'outreach_imports' bucket where your PDFs and CSVs will live.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('outreach_imports', 'outreach_imports', false)
ON CONFLICT (id) DO NOTHING;

-- Set up basic access policies for the storage bucket (allows authenticated users to upload and read)
CREATE POLICY "Enable read access for all authenticated users" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'outreach_imports' AND auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for all authenticated users" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'outreach_imports' AND auth.role() = 'authenticated');

-- =========================================================
-- STEP 2: CREATE THE NEW OUTREACH CAMPAIGNS TABLES
-- =========================================================
-- Table: outreach_campaigns
CREATE TABLE IF NOT EXISTS public.outreach_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES public.outreach_email_accounts(id) ON DELETE CASCADE,
    import_id UUID NOT NULL REFERENCES public.outreach_imports(id) ON DELETE CASCADE,
    template_subject TEXT NOT NULL,
    template_body TEXT NOT NULL,
    daily_limit INTEGER DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'paused',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: outreach_contacts
CREATE TABLE IF NOT EXISTS public.outreach_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_id UUID NOT NULL REFERENCES public.outreach_imports(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- STEP 3: ENABLE RLS & POLICIES
-- =========================================================
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.outreach_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.outreach_contacts FOR ALL USING (auth.role() = 'authenticated');
