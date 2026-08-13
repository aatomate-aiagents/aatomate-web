-- =========================================================
-- STEP 4: ADD NAME AND COMPANY TO CONTACTS
-- =========================================================

ALTER TABLE public.outreach_contacts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.outreach_contacts ADD COLUMN IF NOT EXISTS company TEXT;
