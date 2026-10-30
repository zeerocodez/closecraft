"use client";

import React, { useState } from 'react';
import { updateOrganizationIdentity } from '@/app/(saas)/actions';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Workspace identity and WhatsApp outreach number updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-on-surface" htmlFor="org-name">
          Organization Name
        </label>
        <input 
          id="org-name"
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10 px-3 bg-surface-container-low text-on-surface rounded-lg border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-on-surface" htmlFor="org-whatsapp">
            Organization WhatsApp Number
          </label>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Outreach &amp; Inbound Channel
          </span>
        </div>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-emerald-400 text-[18px] pointer-events-none">
            chat
          </span>
          <input 
            id="org-whatsapp"
            type="tel" 
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="e.g. 0810 326 2248 or +234..."
            required
            className="h-10 pl-9 pr-3 w-full bg-surface-container-low text-on-surface rounded-lg border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          />
        </div>
        <p className="text-[11px] text-on-surface-variant">
          Used to trigger 1-click WhatsApp outreach, lead notifications, and inbound enquiry routing.
        </p>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-on-surface" htmlFor="org-slug">
          Workspace URL
        </label>
        <div className="flex items-center">
          <span className="h-10 px-3 bg-surface-container flex items-center text-on-surface-variant text-xs rounded-l-lg border border-surface-container border-r-0">
            closecrafthq.com/
          </span>
          <input 
            id="org-slug"
            type="text" 
            defaultValue={initialSlug}
            disabled
            className="h-10 px-3 w-full bg-surface-container-lowest text-on-surface-variant rounded-r-lg border border-surface-container opacity-70 cursor-not-allowed text-sm"
          />
        </div>
      </div>

      <div className="mt-2">
        <button 
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-on-primary font-bold text-sm rounded-lg hover:bg-primary-container shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
          <span>{loading ? 'Saving...' : 'Save Identity Changes'}</span>
        </button>
      </div>
    </form>
  );
}
