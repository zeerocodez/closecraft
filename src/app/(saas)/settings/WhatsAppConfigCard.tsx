'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, PlugZap, ShieldCheck, Unplug } from 'lucide-react';

interface Connection {
  connected: boolean;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  displayPhoneNumber: string | null;
  hasToken: boolean;
}

export function WhatsAppConfigCard() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/whatsapp/status');
      const data = await res.json();
      if (res.ok) setConnection(data.connection);
    } catch {
      // leave connection null; the form explains itself
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/integrations/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId, businessAccountId, accessToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed');
      setConnection(data.connection);
      setNotice(data.message || 'WhatsApp connected.');
      setAccessToken('');
      setLiveState(null);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Check the IDs and token.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyLive = async () => {
    setChecking(true);
    setLiveState(null);
    try {
      const res = await fetch('/api/integrations/whatsapp/status?live=1');
      const data = await res.json();
      if (data.live?.ok) {
        setLiveState({ ok: true, text: `Meta confirms this number is reachable${data.live.verifiedName ? ` (${data.live.verifiedName})` : ''}${data.live.qualityRating ? ` · Quality: ${data.live.qualityRating}` : ''}.` });
      } else {
        setLiveState({ ok: false, text: data.live?.error || 'Meta rejected the stored credentials. Reconnect with a fresh system-user token.' });
      }
    } catch {
      setLiveState({ ok: false, text: 'Could not reach the verification endpoint.' });
    } finally {
      setChecking(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect this WhatsApp number? Inbound enquiries to it will stop routing to this workspace.')) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations/whatsapp/disconnect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Disconnect failed');
      setConnection({ connected: false, phoneNumberId: null, businessAccountId: null, displayPhoneNumber: connection?.displayPhoneNumber || null, hasToken: false });
      setNotice(data.message);
      setLiveState(null);
    } catch (err: any) {
      setError(err.message || 'Disconnect failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Loader2 size={14} className="animate-spin" /> Checking WhatsApp connection…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {notice && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {connection?.connected ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0a0d12] border border-white/5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Connected — your own WhatsApp Business number</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              {connection.displayPhoneNumber || 'Number'} · Phone Number ID: {connection.phoneNumberId}
              {connection.businessAccountId ? ` · WABA: ${connection.businessAccountId}` : ''}
            </p>
            <p className="text-[11px] text-gray-400">
              Inbound enquiries to this number route to this workspace only, and outbound replies send from it.
            </p>
          </div>

          {liveState && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${liveState.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
              {liveState.ok ? <ShieldCheck size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
              <span>{liveState.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleVerifyLive}
              disabled={checking}
              className="px-4 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {checking ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Verify with Meta
            </button>
            <button
              onClick={handleDisconnect}
              disabled={submitting}
              className="px-4 py-2.5 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-300 font-bold text-xs rounded-xl border border-white/10 hover:border-red-500/30 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Unplug size={14} /> Disconnect
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="space-y-4">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Connect the WhatsApp Business number this workspace sends and receives on. You will need, from
            <strong className="text-gray-200"> Meta Business Settings → WhatsApp Accounts → API Setup</strong>: the
            <strong className="text-gray-200"> Phone Number ID</strong> for your number, and a
            <strong className="text-gray-200"> system-user access token</strong> with the
            <em> whatsapp_business_messaging</em> permission for the same business. A temporary 24-hour token works
            for testing but expires — use a system-user token for production.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1.5 block">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Phone Number ID *</span>
              <input
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 105234987654321"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d12] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#45bfae]/60 font-mono"
                required
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">WhatsApp Business Account ID (optional)</span>
              <input
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                placeholder="e.g. 987654321098765"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d12] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#45bfae]/60 font-mono"
              />
            </label>
          </div>
          <label className="space-y-1.5 block">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">System-User Access Token *</span>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAA…"
              autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d12] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#45bfae]/60 font-mono"
              required
            />
            <span className="text-[10px] text-gray-500 block">Stored encrypted. It is validated with Meta before saving and never shown again.</span>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <PlugZap size={14} />}
            Connect WhatsApp Number
          </button>
        </form>
      )}
    </div>
  );
}
