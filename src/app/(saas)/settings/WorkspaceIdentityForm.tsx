"use client";

import React, { useState } from 'react';
import { updateOrganizationIdentity } from '@/app/(saas)/actions';
import { Building2, MessageSquare, Globe, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';

interface WorkspaceIdentityFormProps {
  initialName: string;
  initialSlug: string;
  initialWhatsApp: string;
}

export function WorkspaceIdentityForm({
  initialName,
  initialSlug,
  initialWhatsApp,
}: WorkspaceIdentityFormProps) {
  const [name, setName] = useState(initialName || '');
  const [whatsapp, setWhatsapp] = useState(initialWhatsApp || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await updateOrganizationIdentity(name, whatsapp);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update organization identity.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl font-sans">
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>Workspace identity and WhatsApp outreach number updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Organization Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5" htmlFor="org-name">
          <Building2 size={14} className="text-[#45bfae]" />
          <span>Workspace / Organization Legal Name</span>
        </label>
        <input 
          id="org-name"
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Acme Sales Group Ltd"
          className="h-10 px-3.5 bg-[#0a0d12] text-white rounded-xl border border-white/10 focus:border-[#45bfae] focus:outline-none text-xs md:text-sm font-medium transition-colors"
        />
        <p className="text-[11px] text-gray-400">
          Appears on client proposals, Bachs payment receipts, and team invitation emails.
        </p>
      </div>

      {/* WhatsApp Outreach Number */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5" htmlFor="org-whatsapp">
            <MessageSquare size={14} className="text-emerald-400" />
            <span>Official WhatsApp Outreach Number</span>
          </label>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Outreach & Inbound Dispatch
          </span>
        </div>
        <div className="relative flex items-center">
          <input 
            id="org-whatsapp"
            type="tel" 
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="e.g. +234 810 326 2248 or 08103262248"
            required
            className="h-10 px-3.5 w-full bg-[#0a0d12] text-white rounded-xl border border-white/10 focus:border-[#45bfae] focus:outline-none font-mono text-xs md:text-sm transition-colors"
          />
        </div>
        <p className="text-[11px] text-gray-400">
          Used to trigger 1-click WhatsApp outreach, lead notifications, and inbound enquiry routing.
        </p>
      </div>
      
      {/* Workspace URL / Slug */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5" htmlFor="org-slug">
          <Globe size={14} className="text-[#45bfae]" />
          <span>Workspace Slug Identifier</span>
        </label>
        <div className="flex items-center">
          <span className="h-10 px-3.5 bg-[#161a1d] flex items-center text-gray-400 text-xs rounded-l-xl border border-white/10 border-r-0 select-none">
            closecrafthq.com/
          </span>
          <input 
            id="org-slug"
            type="text" 
            defaultValue={initialSlug}
            disabled
            className="h-10 px-3.5 w-full bg-[#0a0d12] text-gray-400 rounded-r-xl border border-white/10 opacity-70 cursor-not-allowed font-mono text-xs"
          />
        </div>
        <p className="text-[11px] text-gray-500">
          Permanent tenant slug for routing and webhook verification. Contact support to transfer or modify.
        </p>
      </div>

      <div className="pt-2">
        <button 
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl shadow-lg shadow-[#248277]/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save Workspace Identity</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
