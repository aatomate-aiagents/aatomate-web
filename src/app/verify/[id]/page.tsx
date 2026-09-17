import { createClient } from "@/lib/supabase/server";
import { Award, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import CertificateTemplate from "@/components/CertificateTemplate";

export default async function VerifyCertificatePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: cert, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 border border-gray-200 dark:border-white/10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Invalid Certificate</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            We couldn't find a certificate with the provided ID. It may be invalid or the link might be incorrect.
          </p>
          <Link href="/" className="inline-flex justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const isValid = cert.status === 'valid';

  if (isValid) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-6">
        <div className="max-w-[1100px] mx-auto mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center gap-4 shadow-sm print:hidden">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Certificate Verified</h2>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm">This is a valid, authentic certificate issued by Aatomate.</p>
            </div>
        </div>
        <CertificateTemplate
          participantName={cert.student_name}
          bootcampName={cert.bootcamp_name}
          internshipName={cert.internship_name}
          category={cert.internship_category || cert.bootcamp_category}
          dateOfParticipation={new Date(cert.completion_date).toLocaleDateString()}
          certificateId={cert.id}
          type={cert.type}
          issuingAuthority={cert.issuing_authority}
        />
      </div>
    );
  }

  // Revoked state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
        <div className="p-8 text-center bg-red-600">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-white/30">
            <AlertTriangle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Certificate Revoked</h1>
          <p className="text-white/80 text-lg">
            This certificate was revoked on {new Date(cert.revoked_at).toLocaleDateString()}.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center pb-6 border-b border-gray-100 dark:border-white/5">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Awarded to</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">{cert.student_name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Program</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{cert.internship_name || cert.bootcamp_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg capitalize">{cert.internship_category || cert.bootcamp_category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completion Date</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{new Date(cert.completion_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Issuing Authority</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <Award size={20} className="text-blue-500" />
                {cert.issuing_authority}
              </p>
            </div>
          </div>

          {cert.revocation_reason && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Reason for Revocation</p>
              <p className="text-red-700 dark:text-red-300">{cert.revocation_reason}</p>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500 font-mono">
            ID: {cert.id}
          </div>
        </div>
      </div>
    </div>
  );
}
