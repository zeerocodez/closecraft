'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, PlugZap, Radio, Send, ShieldCheck, Unplug } from 'lucide-react';

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
  const [warning, setWarning] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [webhookCheck, setWebhookCheck] = useState<{
    webhookVerified: boolean;
    webhookMessage: string;
    appSecretConfigured: boolean;
    liveDispatchEnabled: boolean;
    wabaSubscribed?: boolean;
    testSendResult?: { attempted: boolean; delivered: boolean; detail: string };
  } | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testPhone, setTestPhone] = useState('');

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
    setWarning(null);
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
      setWarning(data.subscription?.warning || null);
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
        if (data.live.subscribed === false) {
          setLiveState({ ok: false, text: 'Meta confirms this number is reachable, but its WhatsApp Business Account is not subscribed to CloseCraft — inbound messages will not arrive. Reconnect with the WABA ID and a token that has whatsapp_business_management permission.' });
        } else {
          setLiveState({ ok: true, text: `Meta confirms this number is reachable${data.live.verifiedName ? ` (${data.live.verifiedName})` : ''}${data.live.qualityRating ? ` · Quality: ${data.live.qualityRating}` : ''}${data.live.subscribed === true ? ' · WABA subscribed to receive inbound messages' : ''}.` });
        }
      } else {
        setLiveState({ ok: false, text: data.live?.error || 'Meta rejected the stored credentials. Reconnect with a fresh system-user token.' });
      }
    } catch {
      setLiveState({ ok: false, text: 'Could not reach the verification endpoint.' });
    } finally {
      setChecking(false);
    }
  };

  const handleWebhookSelfTest = async (sendLiveTest: boolean) => {
    setTestingWebhook(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendLiveTest, testPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'WhatsApp self-test failed');
      setWebhookCheck(data);
    } catch (err: any) {
      setError(err?.message || 'WhatsApp webhook self-test failed.');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect this WhatsApp number? Inbound enquiries to it will stop routing to this workspace.')) return;
    setSubmitting(true);
    setError(null);
    setWarning(null);
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
      {warning && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> <span>{warning}</span>
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
            {!connection.businessAccountId && (
              <p className="text-[11px] text-amber-300/90">
                No WhatsApp Business Account ID is stored, so CloseCraft could not subscribe this account to receive inbound messages. Disconnect and reconnect with the WABA ID (and a token with whatsapp_business_management permission) to switch inbound on.
              </p>
            )}
          </div>

          {liveState && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${liveState.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
              {liveState.ok ? <ShieldCheck size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
              <span>{liveState.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleVerifyLive}
              disabled={checking}
              className="px-4 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {checking ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Verify with Meta
            </button>
            <button
              type="button"
              onClick={() => handleWebhookSelfTest(false)}
              disabled={testingWebhook}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {testingWebhook ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
              Verify Webhook
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={submitting}
              className="px-4 py-2.5 bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-300 font-bold text-xs rounded-xl border border-white/10 hover:border-red-500/30 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Unplug size={14} /> Disconnect
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Test recipient (+234...)"
              className="px-3 py-2 rounded-xl bg-[#0a0d12] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#45bfae]/60 font-mono w-48"
            />
            <button
              type="button"
              onClick={() => handleWebhookSelfTest(true)}
              disabled={testingWebhook}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <Send size={13} /> Send hello_world Test
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="space-y-4">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Connect the WhatsApp Business number this workspace sends and receives on. You will need, from
            <strong className="text-gray-200"> Meta Business Settings → WhatsApp Accounts → API Setup</strong>: the
            <strong className="text-gray-200"> Phone Number ID</strong> for your number, the
            <strong className="text-gray-200"> WhatsApp Business Account ID</strong> that owns it, and a
            <strong className="text-gray-200"> system-user access token</strong> with the
            <em> whatsapp_business_messaging</em> and <em>whatsapp_business_management</em> permissions for the same business.
            CloseCraft subscribes your account to the app on connect — that subscription is what lets inbound
            messages reach the inbox. A temporary 24-hour token works
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
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">WhatsApp Business Account ID (needed for inbound)</span>
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
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <PlugZap size={14} />}
              Connect WhatsApp Number
            </button>
            <button
              type="button"
              onClick={() => handleWebhookSelfTest(false)}
              disabled={testingWebhook}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {testingWebhook ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
              Verify Webhook
            </button>
          </div>
        </form>
      )}

      {webhookCheck && (
        <div className="p-3.5 rounded-xl bg-[#0a0d12] border border-white/10 space-y-1.5 text-[11px] text-gray-300">
          <p className="flex items-center gap-2">
            {webhookCheck.webhookVerified ? (
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={13} className="text-red-400 shrink-0" />
            )}
            <span>{webhookCheck.webhookMessage}</span>
          </p>
          <p className="flex items-center gap-2">
            {webhookCheck.liveDispatchEnabled ? (
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={13} className="text-amber-400 shrink-0" />
            )}
            <span>
              {webhookCheck.liveDispatchEnabled
                ? 'Live outbound WhatsApp dispatch is enabled ✓'
                : 'Outbound sends are in Dry-Run mode (set WHATSAPP_LIVE_DISPATCH_ENABLED=true in Vercel for live sends).'}
            </span>
          </p>
          {webhookCheck.wabaSubscribed !== undefined && (
            <p className="flex items-center gap-2">
              {webhookCheck.wabaSubscribed ? (
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={13} className="text-amber-400 shrink-0" />
              )}
              <span>
                {webhookCheck.wabaSubscribed
                  ? 'WABA subscribed to CloseCraft Meta App ✓'
                  : 'WABA not yet subscribed to CloseCraft Meta App.'}
              </span>
            </p>
          )}
          {webhookCheck.testSendResult?.detail && webhookCheck.testSendResult.detail !== 'No test send requested.' && (
            <p className="flex items-center gap-2 pt-1 border-t border-white/5">
              {webhookCheck.testSendResult.delivered ? (
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={13} className="text-amber-400 shrink-0" />
              )}
              <span>{webhookCheck.testSendResult.detail}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
