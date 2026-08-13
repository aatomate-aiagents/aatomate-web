-- =========================================================
-- STEP 4: CREATE SECURE SETTINGS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.outreach_global_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.outreach_global_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and update settings
CREATE POLICY "Enable read for authenticated users" 
ON public.outreach_global_settings FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" 
ON public.outreach_global_settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" 
ON public.outreach_global_settings FOR UPDATE 
USING (auth.role() = 'authenticated');
