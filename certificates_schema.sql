-- Table: certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    bootcamp_id TEXT,
    internship_id TEXT,
    bootcamp_name TEXT,
    bootcamp_category TEXT,
    internship_name TEXT,
    internship_category TEXT,
    type TEXT, -- 'bootcamp' or 'internship'
    completion_date TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    issuing_authority TEXT DEFAULT 'Aatomate',
    status TEXT NOT NULL DEFAULT 'valid',
    qr_code_data_url TEXT,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    cloudinary_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 1. Full access for authenticated users (Admin Panel)
CREATE POLICY "Enable all for authenticated users" ON public.certificates FOR ALL USING (auth.role() = 'authenticated');

-- 2. Public Read Access for website content (so users can verify)
CREATE POLICY "Enable select for anon users" ON public.certificates FOR SELECT USING (true);
