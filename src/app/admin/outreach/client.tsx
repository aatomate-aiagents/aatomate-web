"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import { Plus, Upload, Mail, Play, Pause, RefreshCw, CheckCircle2, AlertCircle, Trash2, Send, Loader2 } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

type HostingerMailbox = {
  resourceId: string;
  address: string;
};

type EmailAccount = {
  id: string;
  email: string;
  provider: string;
  status: string;
  mailbox_id: string;
  api_token: string;
  daily_limit: number;
  sent_today: number;
  bounce_rate: string;
  reply_rate: string;
  created_at: string;
};

type ImportJob = {
  id: string;
  file_name: string;
  file_type: string;
  size: number;
  status: string;
  records: number;
  emails_detected: number;
  storage_path: string;
  storage_url: string;
  created_at: string;
};

type Campaign = {
  id: string;
  name: string;
  account_id: string;
  import_id: string;
  template_subject: string;
  template_body: string;
  daily_limit: number;
  status: string;
  created_at: string;
  attachment_name?: string;
  attachment_path?: string;
};

export default function OutreachClient({
  initialAccounts,
  initialImports,
  initialCampaigns
}: {
  initialAccounts: EmailAccount[];
  initialImports: ImportJob[];
  initialCampaigns: Campaign[];
}) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'accounts' | 'imports' | 'campaigns'>('campaigns');
  
  // State
  const [accounts, setAccounts] = useState<EmailAccount[]>(initialAccounts);
  const [imports, setImports] = useState<ImportJob[]>(initialImports);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  
  // Hostinger sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  
  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Forms
  const [importFile, setImportFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [campaignForm, setCampaignForm] = useState({ name: '', account_id: '', import_id: '', template_subject: '', template_body: '', daily_limit: 50, attachment_name: '', attachment_path: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-sync mailboxes from Hostinger on page load
  const syncMailboxes = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    // 1. Get the Hostinger API token from global settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('outreach_global_settings')
      .select('value')
      .eq('key', 'hostinger_api_key')
      .single();

    if (settingsError || !settingsData?.value) {
      setIsSyncing(false);
      setSyncStatus('error');
      setSyncMessage('No Hostinger API key found. Go to Settings → Save your API Token first.');
      return;
    }

    const apiToken = settingsData.value;

    // 2. Call Hostinger GET /api/v1/me to discover mailboxes
    try {
      const res = await fetch('https://api.mail.hostinger.com/api/v1/me', {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });

      if (!res.ok) {
        throw new Error(`Hostinger API returned ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const mailboxes: HostingerMailbox[] = json.data?.mailboxes || [];

      if (mailboxes.length === 0) {
        setIsSyncing(false);
        setSyncStatus('error');
        setSyncMessage('No mailboxes found for this API token. Check your Hostinger dashboard.');
        return;
      }

      // 3. Upsert each mailbox into outreach_email_accounts
      let newCount = 0;
      for (const mb of mailboxes) {
        // Check if already exists
        const { data: existing } = await supabase
          .from('outreach_email_accounts')
          .select('id')
          .eq('mailbox_id', mb.resourceId)
          .single();

        if (!existing) {
          await supabase.from('outreach_email_accounts').insert([{
            email: mb.address,
            provider: 'Hostinger',
            status: 'Connected',
            mailbox_id: mb.resourceId,
            api_token: apiToken,
            daily_limit: 500
          }]);
          newCount++;
        }
      }

      // 4. Refresh accounts list
      const { data: refreshed } = await supabase
        .from('outreach_email_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (refreshed) setAccounts(refreshed);

      setIsSyncing(false);
      setSyncStatus('success');
      setSyncMessage(newCount > 0 
        ? `Synced! ${newCount} new mailbox(es) added from Hostinger.` 
        : `All ${mailboxes.length} mailbox(es) already synced.`
      );
    } catch (err: any) {
      setIsSyncing(false);
      setSyncStatus('error');
      setSyncMessage(`Failed to connect to Hostinger: ${err.message}`);
    }
  }, [supabase]);

  // Auto-sync on first load
  useEffect(() => {
    syncMailboxes();
  }, [syncMailboxes]);

  const handleUploadImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setIsSubmitting(true);
    
    try {
      // Upload file directly to Python backend — it handles everything
      const formData = new FormData();
      formData.append('file', importFile);

      const res = await fetch('http://127.0.0.1:8000/api/files/process', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error ${res.status}`);
      }

      const result = await res.json();

      // Refresh imports from DB
      const { data: refreshed } = await supabase
        .from('outreach_imports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (refreshed) setImports(refreshed);

      setShowImportModal(false);
      setImportFile(null);
      alert(`Successfully extracted ${result.emails_found} emails from ${importFile.name}!`);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImport = async (importId: string) => {
    if (!confirm("Are you sure you want to delete this import? This will also remove any contacts extracted from it.")) return;
    try {
      const { error } = await supabase.from('outreach_imports').delete().eq('id', importId);
      if (error) throw error;
      setImports(imports.filter(i => i.id !== importId));
    } catch (err: any) {
      alert("Failed to delete import: " + err.message);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let attachmentPath = '';
    let attachmentName = '';
    
    if (attachmentFile) {
      try {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        const res = await fetch('http://127.0.0.1:8000/api/files/upload-brochure', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        const json = await res.json();
        attachmentPath = json.path;
        attachmentName = json.filename;
      } catch (err: any) {
        alert("Failed to upload brochure: " + err.message);
        setIsSubmitting(false);
        return;
      }
    }
    
    const payload = { ...campaignForm };
    if (attachmentPath) {
      payload.attachment_name = attachmentName;
      payload.attachment_path = attachmentPath;
    }
    
    const { data, error } = await supabase.from('outreach_campaigns').insert([payload]).select();
    setIsSubmitting(false);
    if (!error && data) {
      setCampaigns([data[0], ...campaigns]);
      setShowCampaignModal(false);
      setCampaignForm({ name: '', account_id: '', import_id: '', template_subject: '', template_body: '', daily_limit: 50, attachment_name: '', attachment_path: '' });
      setAttachmentFile(null);
    } else {
      alert("Error creating campaign: " + error?.message);
    }
  };

  const toggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('outreach_campaigns').update({ status: newStatus }).eq('id', campaign.id);
    if (!error) {
      setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
    }
  };

  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);

  const handleSendCampaign = async (campaign: Campaign) => {
    if (!confirm(`Send emails NOW for campaign "${campaign.name}"? This will process all pending contacts.`)) return;
    setSendingCampaignId(campaign.id);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id })
      });
      const result = await res.json();
      if (result.status === 'ok' && result.results?.length > 0) {
        const r = result.results[0];
        if (r.emails_sent > 0) {
          alert(`✅ Successfully sent ${r.emails_sent} email(s) for "${campaign.name}"!`);
        } else {
          alert(`No emails were sent. ${r.errors?.join(' | ') || 'Check backend logs for details.'}`);
        }
      } else {
        alert(`Campaign processing issue: ${result.message || JSON.stringify(result)}`);
      }
    } catch (err: any) {
      alert('Failed to trigger campaign: ' + err.message);
    } finally {
      setSendingCampaignId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    const { error } = await supabase.from('outreach_campaigns').delete().eq('id', campaignId);
    if (!error) {
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    } else {
      alert('Failed to delete campaign: ' + error.message);
    }
  };

  const accountColumns: Column<EmailAccount>[] = [
    {
      header: "Account",
      accessorKey: "email",
      cell: (acc) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-canvas-ice)] dark:bg-[#1A1A1A] text-gray-900 dark:text-white flex items-center justify-center font-bold border border-gray-200 dark:border-[#2A2A2A]">
            <Mail className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{acc.email}</div>
            <div className="text-xs text-gray-500">{acc.provider} • {acc.mailbox_id || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (acc) => (
        <span className={clsx(
          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border",
          acc.status === "Connected" ? "bg-[var(--color-action-green)]/20 text-green-700 border-[var(--color-action-green)]/30 dark:text-green-400" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400"
        )}>
          {acc.status}
        </span>
      ),
    },
    {
      header: "Volume Today",
      accessorKey: "sent_today",
      cell: (acc) => (
        <div className="w-full max-w-[150px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{acc.sent_today} sent</span>
            <span className="text-gray-400">/ {acc.daily_limit}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
            <div className="bg-[var(--color-action-green)] h-1.5 rounded-full" style={{ width: `${Math.min(100, (acc.sent_today / acc.daily_limit) * 100)}%` }}></div>
          </div>
        </div>
      )
    }
  ];

  const importColumns: Column<ImportJob>[] = [
    {
      header: "File",
      accessorKey: "file_name",
      cell: (job) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{job.file_name}</div>
          <div className="text-xs text-gray-500">{(job.size / 1024).toFixed(1)} KB • {job.file_type}</div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (job) => (
        <span className={clsx(
          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider",
          job.status === "completed" ? "bg-[var(--color-action-green)]/20 text-green-700 border-[var(--color-action-green)]/30 dark:text-green-400" :
          job.status === "uploading" || job.status === "processing" ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
          "bg-gray-50 text-gray-700 border-gray-200"
        )}>
          {job.status}
        </span>
      )
    },
    {
      header: "Records",
      accessorKey: "records",
      cell: (job) => (
        <div>
          <div className="font-medium">{job.records} total</div>
          <div className="text-xs text-[var(--color-action-green)] font-medium">{job.emails_detected} emails parsed</div>
        </div>
      )
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (job) => new Date(job.created_at).toLocaleDateString()
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (job) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleDeleteImport(job.id); }}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete Import"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  const campaignColumns: Column<Campaign>[] = [
    {
      header: "Campaign Name",
      accessorKey: "name",
      cell: (camp) => (
        <div className="font-medium text-gray-900 dark:text-white">{camp.name}</div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (camp) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleCampaignStatus(camp); }}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors",
            camp.status === "active" ? "bg-[var(--color-action-green)]/20 text-green-700 border-[var(--color-action-green)]/30 hover:bg-green-100 dark:text-green-400" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          )}
        >
          {camp.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {camp.status.toUpperCase()}
        </button>
      )
    },
    {
      header: "Configuration",
      accessorKey: "account_id",
      cell: (camp) => {
        const acc = accounts.find(a => a.id === camp.account_id);
        const imp = imports.find(i => i.id === camp.import_id);
        return (
          <div className="text-xs text-gray-500 space-y-0.5">
            <div><span className="font-medium">From:</span> {acc?.email || 'Unknown'}</div>
            <div><span className="font-medium">List:</span> {imp?.file_name || 'Unknown'}</div>
            {camp.attachment_name && (
              <div className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1">
                📎 {camp.attachment_name}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: "Daily Limit",
      accessorKey: "daily_limit",
      cell: (camp) => <span className="font-medium text-gray-900 dark:text-white">{camp.daily_limit} / day</span>
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (camp) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleSendCampaign(camp); }}
            disabled={sendingCampaignId === camp.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-action-green)] text-black rounded-lg text-xs font-bold hover:bg-[#b0f5a6] transition-colors disabled:opacity-50"
            title="Send emails now"
          >
            {sendingCampaignId === camp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            {sendingCampaignId === camp.id ? 'Sending...' : 'Send Now'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(camp.id); }}
            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Campaign"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight uppercase">
            Outreach Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Powered by Hostinger Agentic Mail API. Mailboxes sync automatically from your API token.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'campaigns' && (
            <button onClick={() => setShowCampaignModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-action-green)] text-black hover:bg-[#b0f5a6] rounded-lg text-sm font-bold transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          )}
          {activeTab === 'accounts' && (
            <button onClick={syncMailboxes} disabled={isSyncing} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-midnight-ink)] hover:bg-[var(--color-deep-smoke)] text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
              <RefreshCw className={clsx("w-4 h-4", isSyncing && "animate-spin")} /> {isSyncing ? 'Syncing...' : 'Sync from Hostinger'}
            </button>
          )}
          {activeTab === 'imports' && (
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-midnight-ink)] hover:bg-[var(--color-deep-smoke)] text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Upload className="w-4 h-4" /> Upload Leads
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus !== 'idle' && (
        <div className={clsx(
          "flex items-center gap-3 p-3 rounded-lg text-sm border",
          syncStatus === 'success' ? "bg-[var(--color-action-green)]/10 border-[var(--color-action-green)]/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400"
        )}>
          {syncStatus === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {syncMessage}
        </div>
      )}

      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-800">
        {['campaigns', 'accounts', 'imports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={clsx(
              "px-4 py-2 text-sm font-bold border-b-2 transition-colors uppercase tracking-wider",
              activeTab === tab ? "border-[var(--color-action-green)] text-gray-900 dark:text-white" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'campaigns' && (
          <DataTable data={campaigns} columns={campaignColumns} searchPlaceholder="Search campaigns..." />
        )}
        {activeTab === 'accounts' && (
          <DataTable data={accounts} columns={accountColumns} searchPlaceholder="Search email accounts..." />
        )}
        {activeTab === 'imports' && (
          <DataTable data={imports} columns={importColumns} searchPlaceholder="Search imported files..." />
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#1F1F1F] rounded-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-1 dark:text-white">Upload Leads List</h2>
            <p className="text-xs text-gray-500 mb-4">Supported formats: .pdf, .csv, .xlsx. We will automatically extract valid email addresses from the content.</p>
            <form onSubmit={handleUploadImport} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={e => setImportFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-action-green)] file:text-black hover:file:bg-[#b0f5a6] cursor-pointer" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowImportModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 font-medium">Cancel</button>
                <button type="submit" disabled={!importFile || isSubmitting} className="flex-1 py-2 rounded-lg bg-[var(--color-action-green)] text-black font-bold disabled:opacity-50">{isSubmitting ? 'Uploading...' : 'Parse & Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#1F1F1F] rounded-xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create Auto-Trigger Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name</label>
                  <input required type="text" value={campaignForm.name} onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-action-green)]" placeholder="e.g. Q4 Outreach" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Send Limit</label>
                  <input required type="number" value={campaignForm.daily_limit} onChange={e => setCampaignForm({...campaignForm, daily_limit: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-action-green)]" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sending Account</label>
                  <select required value={campaignForm.account_id} onChange={e => setCampaignForm({...campaignForm, account_id: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-action-green)]">
                    <option value="">Select Account</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target List (Import)</label>
                  <select required value={campaignForm.import_id} onChange={e => setCampaignForm({...campaignForm, import_id: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-action-green)]">
                    <option value="">Select Target List</option>
                    {imports.map(imp => <option key={imp.id} value={imp.id}>{imp.file_name} ({imp.emails_detected} emails)</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Email Template</h3>
                <p className="text-xs text-gray-500 mb-3">You can use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{email}'}</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{name}'}</code>, and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{company}'}</code> in the subject or body to personalize.</p>
                
                <div className="space-y-3">
                  <input required type="text" value={campaignForm.template_subject} onChange={e => setCampaignForm({...campaignForm, template_subject: e.target.value})} placeholder="Subject Line" className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-action-green)]" />
                  <textarea required value={campaignForm.template_body} onChange={e => setCampaignForm({...campaignForm, template_body: e.target.value})} placeholder="Write your email body here..." rows={6} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-action-green)]"></textarea>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Attachment (Optional)</h3>
                <input type="file" onChange={e => setAttachmentFile(e.target.files?.[0] || null)} accept=".pdf,.png,.jpg,.jpeg" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-action-green)] file:text-black hover:file:bg-[#b0f5a6] cursor-pointer" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCampaignModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg bg-[var(--color-action-green)] text-black font-bold disabled:opacity-50">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
