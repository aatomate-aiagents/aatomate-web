-- Outreach Tables
CREATE TABLE IF NOT EXISTS public.outreach_email_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Connected',
    mailbox_id TEXT,
    api_token TEXT NOT NULL,
    daily_limit INTEGER DEFAULT 500,
    sent_today INTEGER DEFAULT 0,
    bounce_rate TEXT DEFAULT '0%',
    reply_rate TEXT DEFAULT '0%',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.outreach_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploading',
    records INTEGER DEFAULT 0,
    emails_detected INTEGER DEFAULT 0,
    storage_path TEXT,
    storage_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.outreach_email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_imports ENABLE ROW LEVEL SECURITY;

-- Setup baseline policies
CREATE POLICY "Enable all for authenticated users" ON public.outreach_email_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.outreach_imports FOR ALL USING (auth.role() = 'authenticated');

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

ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.outreach_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.outreach_contacts FOR ALL USING (auth.role() = 'authenticated');
