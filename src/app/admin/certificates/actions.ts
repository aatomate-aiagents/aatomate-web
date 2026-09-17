"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function issueCertificate(formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('certificates')
    .insert([{
      student_name: formData.student_name,
      student_email: formData.student_email,
      bootcamp_name: formData.bootcamp_name,
      bootcamp_category: formData.bootcamp_category,
      internship_name: formData.internship_name,
      internship_category: formData.internship_category,
      type: formData.type,
      completion_date: formData.completion_date,
      issuing_authority: formData.issuing_authority || 'Aatomate',
      status: 'valid'
    }])
    .select()
    .single();

  if (error) {
    console.error("Error issuing certificate:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/certificates');
  return { success: true, data };
}

export async function revokeCertificate(id: string, reason: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('certificates')
    .update({ 
      status: 'revoked', 
      revocation_reason: reason,
      revoked_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error revoking certificate:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/certificates');
  return { success: true, data };
}

export async function deleteCertificate(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting certificate:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/certificates');
  return { success: true };
}
