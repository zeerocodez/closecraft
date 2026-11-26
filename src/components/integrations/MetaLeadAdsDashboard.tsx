'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  DollarSign, 
  Calendar, 
  Database, 
  Download, 
  Sliders, 
  Settings2, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  X, 
  User, 
  ArrowRight,
  Radio,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

function FacebookIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

interface MetaStatusData {
  isConnected: boolean;
  oauthConfigured?: boolean;
  integration: {
    id: string;
    status: string;
    metaUserName?: string;
    businessName?: string;
    autoSyncLeads: boolean;
    tokenExpiresAt?: string;
    updatedAt: string;
  } | null;
  pages: Array<{
    id: string;
    pageId: string;
    pageName: string;
    isSubscribed: boolean;
    isActive: boolean;
    leadAccessStatus: string;
  }>;
  adAccounts: Array<{
    id: string;
    accountId: string;
    accountName: string;
    currency: string;
    isActive: boolean;
  }>;
  forms: Array<{
    id: string;
    formId: string;
    formName: string;
    pageName: string;
    pageId: string;
    leadsCount: number;
    isActive: boolean;
    targetStage: string;
    targetAssigneeId?: string | null;
    fieldMapping?: any;
    customQuestions?: any[];
  }>;
  metrics: {
    totalLeadsCaptured: number;
    aiQualifiedCount: number;
    qualificationRate: number;
    followupsDueCount: number;
    dealsWonCount: number;
    verifiedRevenue: number;
    currency: string;
  };
  campaigns: Array<{
    campaignName: string;
    leadsCount: number;
    dealsWon: number;
    revenue: number;
  }>;
  recentLogs: Array<{
    id: string;
    syncType: string;
    leadgenId?: string | null;
    formId?: string | null;
    pageId?: string | null;
    status: string;
    details?: string | null;
    createdAt: string;
  }>;
}

const STAGES = ['NEW', 'ENGAGED', 'QUALIFYING', 'OPPORTUNITY', 'PROPOSAL', 'WON'];

export function MetaLeadAdsDashboard({ teamMembers = [] }: { teamMembers?: Array<{ id: string; name: string }> }) {
  const [data, setData] = useState<MetaStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaAuthError, setMetaAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FORMS' | 'PAGES' | 'IMPORT' | 'LOGS'>('OVERVIEW');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  // Field mapping modal state
  const [mappingModalForm, setMappingModalForm] = useState<any | null>(null);
  const [mappingFields, setMappingFields] = useState<Record<string, string>>({});

  // Historical import state
  const [importFormId, setImportFormId] = useState<string>('');
  const [importDays, setImportDays] = useState<number>(30);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integrations/meta/status');
      if (!res.ok) {
        throw new Error('Failed to retrieve Meta Lead Ads status');
      }
      const json = await res.json();
      setData(json);
      if (json.forms?.length > 0 && !importFormId) {
        setImportFormId(json.forms[0].formId);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading integration state');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qErr = params.get('meta_error') || params.get('error');
      if (qErr) {
        setMetaAuthError(decodeURIComponent(qErr));
      }
    }
    loadStatus();
  }, []);

  const handleTogglePage = async (pageId: string, isActive: boolean, subscribeWebhook?: boolean) => {
    try {
      const res = await fetch('/api/integrations/meta/toggle-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, isActive, subscribeWebhook }),
      });
      if (res.ok) {
        showToast('Page configuration updated');
        loadStatus();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update page');
      }
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleToggleForm = async (formId: string, update: { isActive?: boolean; targetStage?: string; targetAssigneeId?: string; fieldMapping?: any }) => {
    try {
      const res = await fetch('/api/integrations/meta/toggle-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, ...update }),
      });
      if (res.ok) {
        showToast('Lead form configuration saved');
        loadStatus();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update form');
      }
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Meta Lead Ads? Incoming leads will no longer sync automatically.')) {
      return;
    }
    try {
      const res = await fetch('/api/integrations/meta/disconnect', { method: 'POST' });
      if (res.ok) {
        showToast('Meta Lead Ads disconnected');
        loadStatus();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to disconnect');
      }
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleRunHistoricalImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFormId) return;

    setImportLoading(true);
    setImportResult(null);

    const until = Math.floor(Date.now() / 1000);
    const since = until - (importDays * 24 * 60 * 60);

    try {
      const res = await fetch('/api/integrations/meta/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: importFormId,
          since,
          until,
          limit: 100,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setImportResult(`✅ Import complete: ${json.importedCount} new leads ingested, ${json.skippedCount} duplicate/skipped.`);
        showToast(`Imported ${json.importedCount} leads!`);
        loadStatus();
      } else {
        setImportResult(`❌ Import failed: ${json.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setImportResult(`❌ Network error: ${err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const isConnected = data?.isConnected;
  const oauthConfigured = data?.oauthConfigured !== false;

  return (
    <div className="space-y-6">
      {(metaAuthError || !oauthConfigured || error) && (
        <div className="p-4 rounded-2xl bg-amber-950/35 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-100">
              {metaAuthError === 'MetaAppCredentialsMissing' || !oauthConfigured
                ? 'Meta App Credentials Required Before OAuth Connect'
                : 'Meta Connection Notice'}
            </p>
            <p className="text-amber-200/90 leading-relaxed">
              {metaAuthError === 'MetaAppCredentialsMissing' || !oauthConfigured
                ? 'To connect Facebook & Instagram pages without triggering Meta Invalid App ID errors, set a valid numeric META_APP_ID and META_APP_SECRET in Vercel / your environment variables, and add /api/integrations/meta/callback to your Meta App Valid OAuth Redirect URIs.'
                : error || metaAuthError}
            </p>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Connection Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1877F2]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] shadow-md">
                <FacebookIcon size={22} className="fill-[#1877F2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-white tracking-tight">
                    Meta Lead Ads (Facebook & Instagram)
                  </h3>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live & Synchronising
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Direct Graph API v21.0 integration. Ingest Instant Form leads instantly into the Revenue Engine with AI qualification and attribution.
                </p>
              </div>
            </div>

            {isConnected && data?.integration && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-2 font-mono">
                <span>Account: <strong className="text-white">{data.integration.metaUserName || 'Meta Business'}</strong></span>
                <span>•</span>
                <span>Pages: <strong className="text-emerald-400">{data.pages.length} Connected</strong></span>
                <span>•</span>
                <span>Active Forms: <strong className="text-emerald-400">{data.forms.filter(f => f.isActive).length}</strong></span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadStatus}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-colors"
                  title="Refresh state"
                >
                  <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <a
                  href="/api/integrations/meta/auth"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-2"
                >
                  <Settings2 size={14} />
                  <span>Manage Assets</span>
                </a>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/20 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : oauthConfigured ? (
              <a
                href="/api/integrations/meta/auth"
                className="px-6 py-3 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs shadow-lg shadow-[#1877F2]/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <FacebookIcon size={16} className="fill-white" />
                <span>Connect Facebook & Instagram</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="px-6 py-3 rounded-2xl bg-zinc-800 text-zinc-400 border border-white/10 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-80"
                title="Configure META_APP_ID and META_APP_SECRET in Vercel / .env first"
              >
                <FacebookIcon size={16} className="fill-zinc-400" />
                <span>Configure META_APP_ID to Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Campaign-to-Revenue Attribution Funnel KPI Strip */}
      {isConnected && data?.metrics && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <TrendingUp size={14} /> Campaign-to-Revenue Attribution Performance
            </h4>
            <span className="text-[11px] text-gray-400 font-mono">
              Verified Revenue Attribution Loop
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-[#0f1214] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                1. Leads Ingested
              </span>
              <p className="text-xl font-extrabold text-white font-mono">
                {data.metrics.totalLeadsCaptured}
              </p>
              <span className="text-[10px] text-gray-400 block">Instant Forms</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1214] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Flame size={12} className="fill-emerald-400" /> 2. AI Qualified
              </span>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">
                {data.metrics.aiQualifiedCount}
              </p>
              <span className="text-[10px] text-emerald-400/80 block">{data.metrics.qualificationRate}% Intent ≥70%</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1214] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                3. Follow-Ups Due
              </span>
              <p className="text-xl font-extrabold text-amber-400 font-mono">
                {data.metrics.followupsDueCount}
              </p>
              <span className="text-[10px] text-gray-400 block">Active SLAs</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1214] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                4. Deals Won
              </span>
              <p className="text-xl font-extrabold text-cyan-400 font-mono">
                {data.metrics.dealsWonCount}
              </p>
              <span className="text-[10px] text-cyan-400/80 block">Closed-Won Deals</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-[#0f1214] border border-emerald-500/30 space-y-1 col-span-2 md:col-span-1 shadow-md shadow-emerald-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                5. Verified Revenue
              </span>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">
                {data.metrics.currency}{data.metrics.verifiedRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-300/80 block">Traced Ad Revenue</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      {isConnected && (
        <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Campaign Attribution ({data?.campaigns?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FORMS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'FORMS'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Lead Forms & Mapping ({data?.forms?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAGES')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'PAGES'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Connected Pages ({data?.pages?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'IMPORT'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Historical Import
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'LOGS'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Sync Activity Logs ({data?.recentLogs?.length || 0})
          </button>
        </div>
      )}

      {/* TAB 1: CAMPAIGN ATTRIBUTION */}
      {isConnected && activeTab === 'OVERVIEW' && (
        <div className="p-6 rounded-3xl bg-[#0f1214] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-white text-base">
              Active Meta Advertising Campaigns
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              Direct Ingestion from Facebook & Instagram Ads
            </span>
          </div>

          {data?.campaigns && data.campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-3">Campaign Name</th>
                    <th className="py-3 px-3">Leads Ingested</th>
                    <th className="py-3 px-3">Deals Won</th>
                    <th className="py-3 px-3 text-right">Attributed Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.campaigns.map((c, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {c.campaignName}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-300">
                        {c.leadsCount}
                      </td>
                      <td className="py-3 px-3 font-mono text-cyan-400 font-bold">
                        {c.dealsWon}
                      </td>
                      <td className="py-3 px-3 font-mono text-right font-extrabold text-emerald-400">
                        ₦{c.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-2xl">
              No Meta campaigns have generated leads yet. When leads submit your Instant Forms, campaigns will appear here with verified revenue attribution.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEAD FORMS & FIELD MAPPING */}
      {isConnected && activeTab === 'FORMS' && (
        <div className="p-6 rounded-3xl bg-[#0f1214] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-white text-base">
                Discovered Lead Forms
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure auto-sync, default pipeline stage, and closer assignment for each Instant Form.
              </p>
            </div>
          </div>

          {data?.forms && data.forms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-3">Form Name & Page</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Target Stage</th>
                    <th className="py-3 px-3">Assigned Closer</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.forms.map((f) => (
                    <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{f.formName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          Page: {f.pageName} &bull; ID: {f.formId}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleForm(f.formId, { isActive: !f.isActive })}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            f.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-gray-500 border border-white/10'
                          }`}
                        >
                          {f.isActive ? 'Active Sync' : 'Paused'}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={f.targetStage}
                          onChange={(e) => handleToggleForm(f.formId, { targetStage: e.target.value })}
                          className="bg-[#161a1d] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={f.targetAssigneeId || ''}
                          onChange={(e) => handleToggleForm(f.formId, { targetAssigneeId: e.target.value })}
                          className="bg-[#161a1d] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 max-w-[150px] truncate"
                        >
                          <option value="">Unassigned (Open Pool)</option>
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setMappingModalForm(f);
                            setMappingFields(f.fieldMapping || {});
                          }}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs border border-white/5 transition-colors"
                        >
                          Field Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-2xl">
              No lead forms found for connected pages. Make sure your Facebook Page has active Instant Form campaigns created in Meta Ads Manager.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONNECTED PAGES */}
      {isConnected && activeTab === 'PAGES' && (
        <div className="p-6 rounded-3xl bg-[#0f1214] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-white text-base">
              Connected Facebook Pages
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              Auto Webhook Subscriptions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.pages.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-white text-sm">{p.pageName}</h5>
                    <p className="text-[11px] text-gray-500 font-mono">Page ID: {p.pageId}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    p.isSubscribed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {p.isSubscribed ? 'Webhook Subscribed' : 'Not Subscribed'}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">
                    Leadgen Webhook:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePage(p.pageId, p.isActive, !p.isSubscribed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      p.isSubscribed
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                    }`}
                  >
                    {p.isSubscribed ? 'Unsubscribe' : 'Subscribe to Webhook'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HISTORICAL IMPORT */}
      {isConnected && activeTab === 'IMPORT' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0f1214] border border-white/5 space-y-6 max-w-2xl">
          <div>
            <h4 className="font-serif font-bold text-white text-lg">
              Historical Meta Lead Ad Importer
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Retroactively import leads submitted before CloseCraft was connected. Leads will automatically pass through the Revenue Engine for qualification and deduplication.
            </p>
          </div>

          <form onSubmit={handleRunHistoricalImport} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Select Lead Form to Import From:
              </label>
              <select
                value={importFormId}
                onChange={(e) => setImportFormId(e.target.value)}
                className="w-full bg-[#161a1d] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {data?.forms.map((f) => (
                  <option key={f.formId} value={f.formId}>
                    {f.formName} ({f.pageName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Import Time Range:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setImportDays(days)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      importDays === days
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5'
                    }`}
                  >
                    Past {days} Days
                  </button>
                ))}
              </div>
            </div>

            {importResult && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-gray-200">
                {importResult}
              </div>
            )}

            <button
              type="submit"
              disabled={importLoading || !importFormId}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download size={14} className={importLoading ? 'animate-bounce' : ''} />
              <span>{importLoading ? 'Importing Leads from Meta...' : `Start Historical Import (Past ${importDays} Days)`}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: SYNC ACTIVITY LOGS */}
      {isConnected && activeTab === 'LOGS' && (
        <div className="p-6 rounded-3xl bg-[#0f1214] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-white text-base">
              Real-Time Webhook & Sync Audit Trail
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              Live Ingestion Log
            </span>
          </div>

          {data?.recentLogs && data.recentLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase text-gray-400">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Leadgen ID</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-300">
                          {log.syncType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-300">
                        {log.leadgenId || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-2xl">
              No synchronisation logs recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Field Mapping Modal */}
      {mappingModalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0f1214] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">
                Field Mapping: {mappingModalForm.formName}
              </h4>
              <button
                type="button"
                onClick={() => setMappingModalForm(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Meta question fields are automatically normalized into CloseCraft prospect profiles. Customize additional question keys if needed.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="font-mono text-gray-300">full_name</span>
                <span className="font-bold text-emerald-400">&rarr; Lead Name</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="font-mono text-gray-300">email</span>
                <span className="font-bold text-emerald-400">&rarr; Lead Email</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="font-mono text-gray-300">phone_number</span>
                <span className="font-bold text-emerald-400">&rarr; WhatsApp / Phone</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="font-mono text-gray-300">company_name</span>
                <span className="font-bold text-emerald-400">&rarr; Prospect Company</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMappingModalForm(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
