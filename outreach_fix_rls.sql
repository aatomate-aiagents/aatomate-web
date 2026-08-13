-- =========================================================
-- FIX ROW LEVEL SECURITY FOR LOCAL DEVELOPMENT
-- =========================================================
-- If you are not logged in with Supabase Authentication in your local app, 
-- the previous RLS policies blocked you from reading and writing data.
-- This script changes the policies to allow public (anon) access for testing.

-- 1. Email Accounts
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.outreach_email_accounts;
CREATE POLICY "Enable all for public access" ON public.outreach_email_accounts FOR ALL USING (true);

-- 2. Imports
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.outreach_imports;
CREATE POLICY "Enable all for public access" ON public.outreach_imports FOR ALL USING (true);

-- 3. Campaigns
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.outreach_campaigns;
CREATE POLICY "Enable all for public access" ON public.outreach_campaigns FOR ALL USING (true);

-- 4. Contacts
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.outreach_contacts;
CREATE POLICY "Enable all for public access" ON public.outreach_contacts FOR ALL USING (true);

-- 5. Global Settings
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.outreach_global_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.outreach_global_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.outreach_global_settings;

CREATE POLICY "Enable all for public access" ON public.outreach_global_settings FOR ALL USING (true);
