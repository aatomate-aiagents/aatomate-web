"use client";

import { useState } from "react";
import { Award, Plus, XCircle, QrCode, CheckCircle, Trash2, Search, Filter, X, ExternalLink, ShieldCheck, AlertOctagon, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { issueCertificate, revokeCertificate, deleteCertificate } from "./actions";

export default function CertificatesClient({ initialCertificates }: { initialCertificates: any[] }) {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [issueForm, setIssueForm] = useState({
    type: 'internship',
    student_name: '',
    student_email: '',
    internship_name: '',
    internship_category: '',
    completion_date: '',
    issuing_authority: 'Aatomate',
  });
  const [revokeReason, setRevokeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await issueCertificate(issueForm);
      if (result.success) {
        setCertificates([result.data, ...certificates]);
        setShowIssueModal(false);
        setIssueForm({ type: 'internship', student_name: '', student_email: '', internship_name: '', internship_category: '', completion_date: '', issuing_authority: 'Aatomate' });
      } else {
        alert(result.error || 'Failed to issue certificate');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to issue certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertificate) return;
    setSubmitting(true);

    try {
      const result = await revokeCertificate(selectedCertificate.id, revokeReason);
      if (result.success) {
        setCertificates(certificates.map(c => c.id === selectedCertificate.id ? result.data : c));
        setShowRevokeModal(false);
        setSelectedCertificate(null);
        setRevokeReason('');
      } else {
        alert(result.error || 'Failed to revoke certificate');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to revoke certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (cert: any) => {
    if (!confirm(`Delete certificate for ${cert.student_name}? This cannot be undone.`)) return;
    setSubmitting(true);
    try {
      const result = await deleteCertificate(cert.id);
      if (result.success) {
        setCertificates(certificates.filter(c => c.id !== cert.id));
      } else {
        alert(result.error || 'Failed to delete certificate');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      (cert.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.internship_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const verificationUrl = (certId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/verify/${certId}`;
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-white font-sans p-6 pb-20">
      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tighter text-blue-600 dark:text-white mb-2"
            >
              CERTIFICATES
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 flex items-center gap-2"
            >
              <Sparkles size={14} className="text-blue-500" />
              Manage Digital Credentials
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search certificates..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="all" className="bg-white dark:bg-[#0a0a0a]">All Status</option>
                <option value="valid" className="bg-white dark:bg-[#0a0a0a]">Valid Only</option>
                <option value="revoked" className="bg-white dark:bg-[#0a0a0a]">Revoked</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowIssueModal(true)}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl transition-all"
            >
              <Plus size={20} />
              Issue New
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Issued', value: certificates.length, color: 'blue', icon: Award },
            { label: 'Valid', value: certificates.filter(c => c.status === 'valid').length, color: 'emerald', icon: ShieldCheck },
            { label: 'Revoked', value: certificates.filter(c => c.status === 'revoked').length, color: 'red', icon: AlertOctagon },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className={`absolute -right-6 -top-6 w-20 h-20 bg-${stat.color}-500/10 rounded-full blur-xl`} />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</p>
                    <stat.icon size={16} className={`text-${stat.color}-500`} />
                  </div>
                  <p className="text-3xl font-black">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-full"
            >
              <div className={`h-full p-6 rounded-3xl border transition-all ${cert.status === 'revoked'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-500/20'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-500/30'
                }`}>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {cert.status === 'valid' ? (
                    <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-full ring-1 ring-emerald-500/50">
                      <CheckCircle size={14} />
                    </div>
                  ) : (
                    <div className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 p-1.5 rounded-full ring-1 ring-red-500/50">
                      <XCircle size={14} />
                    </div>
                  )}
                </div>

                {/* ID */}
                <div className="font-mono text-[10px] text-gray-500 mb-4 tracking-widest uppercase">
                  ID: {cert.id.substring(0, 8)}...
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">
                    {cert.student_name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">
                    {cert.internship_name || cert.bootcamp_name}
                  </p>

                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Issued:</span>
                      <span className="font-medium">{new Date(cert.issued_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="capitalize font-medium">
                        {cert.internship_category || cert.bootcamp_category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                  <a
                    href={verificationUrl(cert.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-gray-500 hover:text-blue-600 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    Verify <ExternalLink size={10} />
                  </a>

                  <div className="flex gap-2">
                    {cert.status === 'valid' && (
                      <button
                        onClick={() => { setSelectedCertificate(cert); setShowRevokeModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Revoke"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCertificate(cert)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
          
          {filteredCertificates.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
              <Award size={48} className="mx-auto mb-4 opacity-30" />
              <p>No certificates found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Issue Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowIssueModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Issue Certificate</h2>
                <button onClick={() => setShowIssueModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleIssueCertificate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Student Name</label>
                  <input
                    type="text"
                    required
                    value={issueForm.student_name}
                    onChange={(e) => setIssueForm({ ...issueForm, student_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Student Email</label>
                  <input
                    type="email"
                    required
                    value={issueForm.student_email}
                    onChange={(e) => setIssueForm({ ...issueForm, student_email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Internship Name</label>
                  <input
                    type="text"
                    required
                    value={issueForm.internship_name}
                    onChange={(e) => setIssueForm({ ...issueForm, internship_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Internship Category</label>
                  <input
                    type="text"
                    required
                    value={issueForm.internship_category}
                    onChange={(e) => setIssueForm({ ...issueForm, internship_category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Completion Date</label>
                  <input
                    type="date"
                    required
                    value={issueForm.completion_date}
                    onChange={(e) => setIssueForm({ ...issueForm, completion_date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                  >
                    {submitting ? 'Issuing...' : 'Issue Certificate'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revoke Modal */}
      <AnimatePresence>
        {showRevokeModal && selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowRevokeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <h2 className="text-2xl font-black mb-4">Revoke Certificate</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to revoke the certificate for <strong className="text-gray-900 dark:text-white">{selectedCertificate.student_name}</strong>? This action cannot be undone.
              </p>
              
              <form onSubmit={handleRevokeCertificate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Reason for Revocation</label>
                  <textarea
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500 h-24 resize-none"
                    placeholder="Provide a reason..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowRevokeModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                  >
                    {submitting ? 'Revoking...' : 'Revoke Certificate'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
