import { createClient } from "@/lib/supabase/server";
import CertificatesClient from "./client";

export default async function CertificatesPage() {
  const supabase = await createClient();

  const { data: certificates, error } = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
  }

  return <CertificatesClient initialCertificates={certificates || []} />;
}
