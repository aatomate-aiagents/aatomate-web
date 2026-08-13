import { createClient } from "@/lib/supabase/server";
import OutreachClient from "./client";

export default async function OutreachPage() {
  const supabase = await createClient();

  const { data: accounts, error: accountsError } = await supabase
    .from('outreach_email_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (accountsError) {
    console.error("Error fetching outreach_email_accounts:", accountsError);
  }

  const { data: imports, error: importsError } = await supabase
    .from('outreach_imports')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: campaigns, error: campaignsError } = await supabase
    .from('outreach_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (campaignsError) {
    console.error("Error fetching outreach_campaigns:", campaignsError);
  }

  return (
    <OutreachClient
      initialAccounts={accounts || []}
      initialImports={imports || []}
      initialCampaigns={campaigns || []}
    />
  );
}
