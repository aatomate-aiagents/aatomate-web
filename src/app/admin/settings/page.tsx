"use client";

import { useState, useEffect } from "react";
import { Save, Server, Shield, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [hostingerApiKey, setHostingerApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  // Load saved API key on mount from secure database
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("outreach_global_settings")
        .select("value")
        .eq("key", "hostinger_api_key")
        .single();
        
      if (data && !error) {
        setHostingerApiKey(data.value);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Upsert the API key to the database
    const { error } = await supabase
      .from("outreach_global_settings")
      .upsert({ 
        key: "hostinger_api_key", 
        value: hostingerApiKey,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
      
    setIsSaving(false);
    
    if (error) {
      alert("Failed to save settings: " + error.message);
    } else {
      alert("Settings saved successfully and securely stored in your database!");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
          Platform Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Manage integrations, API keys, and global configurations.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#1F1F1F] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-[#1F1F1F] bg-gray-50/50 dark:bg-[#050505]/50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-action-green)]/20 flex items-center justify-center text-[var(--color-action-green)] dark:text-[#aef5a5]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hostinger Agentic API Connection
            </h2>
            <p className="text-sm text-gray-500">
              Connect your Hostinger webmail for agentic email outreach and AI replies.
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                API Token
              </label>
              <input
                type="password"
                value={hostingerApiKey}
                onChange={(e) => setHostingerApiKey(e.target.value)}
                placeholder="hst_xxxxxxxxxxxx"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-action-green)]/50 focus:border-[var(--color-action-green)] transition-all dark:text-white"
              />
              <p className="text-xs text-gray-500">
                Generate this in your Hostinger API Management console.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Webhook URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value="https://api.aatomate.com/webhooks/hostinger"
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-l-lg focus:outline-none text-gray-500 cursor-not-allowed font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText("https://api.aatomate.com/webhooks/hostinger")}
                  className="px-4 py-2 bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 rounded-r-lg hover:bg-gray-300 dark:hover:bg-[#333] transition-colors text-sm font-medium border-y border-r border-gray-200 dark:border-[#2A2A2A]"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Provide this URL to Hostinger to receive bounce and reply events.
              </p>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-midnight-ink)] hover:bg-[var(--color-deep-smoke)] text-white dark:bg-[var(--color-action-green)] dark:text-black dark:hover:bg-[#b0f5a6] rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
