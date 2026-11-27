'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface MetaAdsConfigCardProps {
  workspaceSlug: string;
  // Supplied by the server from FACEBOOK_VERIFY_TOKEN / META_VERIFY_TOKEN.
  // Never hardcode the webhook verify token in client code.
  verifyToken?: string;
}

export function MetaAdsConfigCard({ workspaceSlug, verifyToken = '' }: MetaAdsConfigCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/facebook`
    : 'https://www.closecrafthq.com/api/webhooks/facebook';
  

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Send sample test lead payload directly to embed/leads endpoint to verify pipeline ingestion
      const res = await fetch('/api/leads/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug,
          name: 'Meta Ads Test Prospect',
          email: `meta.test.${Date.now()}@example.com`,
          phone: '+2348033001122',
          source: 'FACEBOOK_LEAD_AD',
          notes: 'Test lead dispatched from Meta Lead Ads connection diagnostic in Workspace Settings.'
        })
      });

      if (res.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Paid Acquisition Bridge
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              Facebook & Instagram
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Share2 size={18} className="text-emerald-400" />
            <span>Connect Meta Ads Campaign (Facebook &amp; Instagram Lead Ads)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Automatically ingest prospects who fill out Instant Forms in your Facebook and Instagram ad campaigns directly into CloseCraft's Revenue Engine for instant AI qualification, closer assignment, and WhatsApp outreach.
          </p>
        </div>

        <a
          href="https://developers.facebook.com/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <span>Meta Developers Portal</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Webhook Connection Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Callback URL Card */}
        <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Webhook Callback URL</span>
            <button
              type="button"
              onClick={() => handleCopy(webhookUrl, 'url')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              {copiedField === 'url' ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedField === 'url' ? 'Copied!' : 'Copy URL'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-[#13171a] border border-white/5 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
            {webhookUrl}
          </div>
          <p className="text-[11px] text-gray-500">
            Paste into Meta App Dashboard &rarr; Webhooks &rarr; Page &rarr; Callback URL.
          </p>
        </div>

        {/* Verify Token Card */}
        <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Verify Token</span>
            <button
              type="button"
              onClick={() => handleCopy(verifyToken, 'token')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              {copiedField === 'token' ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedField === 'token' ? 'Copied!' : 'Copy Token'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-[#13171a] border border-white/5 font-mono text-xs text-slate-300 select-all overflow-x-auto">
            {verifyToken || 'Not configured — set FACEBOOK_VERIFY_TOKEN in the server environment'}
          </div>
          <p className="text-[11px] text-gray-500">
            Paste into Verify Token field in Meta App Dashboard.
          </p>
        </div>
      </div>

      {/* Step-by-Step Meta Setup Guide */}
      <div className="p-5 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
          Step-by-Step Meta Setup Guide
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-white text-xs">Meta App Webhook</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              In Meta Developers, open your App &rarr; Add Product &rarr; <strong>Webhooks</strong>. Select <strong>Page</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-white text-xs">Subscribe &amp; Verify</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> above. Click <em>Verify and Save</em>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-white text-xs">Subscribe to Leadgen</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Under Page Subscriptions, locate <strong>leadgen</strong> and click <em>Subscribe</em>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-white text-xs">Live Revenue Engine</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Every ad submission instantly enters your <strong>Unified Inbox</strong> and <strong>Deal Pipeline</strong> with AI qualification!
            </p>
          </div>
        </div>
      </div>

      {/* Test Lead Verification & Connection Ping */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-emerald-400" />
            <span className="text-xs font-bold text-white">Verify Meta Ads Pipeline Ingestion</span>
          </div>
          <p className="text-[11px] text-gray-300">
            Send a simulated Meta Lead Ads ping to verify that incoming campaign leads immediately appear in your Inbox and Pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {testResult === 'success' && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={14} />
              <span>Test Lead Dispatched &amp; Ingested!</span>
            </span>
          )}

          {testResult === 'error' && (
            <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle size={14} />
              <span>Simulation Failed</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleTestPing}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            <Play size={12} className="fill-slate-950" />
            <span>{isTesting ? 'Simulating Ingestion...' : 'Test Meta Lead Ping'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
