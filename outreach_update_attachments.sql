-- Add attachment columns to outreach_campaigns

ALTER TABLE public.outreach_campaigns 
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_path TEXT;
