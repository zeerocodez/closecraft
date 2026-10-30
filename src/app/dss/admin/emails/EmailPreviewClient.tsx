'use client';

import React, { useState } from 'react';
import {
  Mail,
  Eye,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ClosecraftTemplateId, DSSTemplateId } from '@/lib/email/types';

export type TemplateMeta = {
  id: ClosecraftTemplateId | DSSTemplateId;
  name: string;
  brand: 'Closecraft' | 'DSS by Closecraft';
  trigger: string;
};

export const ALL_TEMPLATES: TemplateMeta[] = [
  // Closecraft Templates
  { id: 'CC-01', name: 'Verify your email', brand: 'Closecraft', trigger: 'New user requests or requires email verification' },
  { id: 'CC-02', name: 'Workspace ready & 7-day trial started', brand: 'Closecraft', trigger: 'Starter workspace provisioned and 168-hour clock begins' },
  { id: 'CC-03', name: 'Trial ends in 24 hours', brand: 'Closecraft', trigger: '24 hours before actual trial expiration' },
  { id: 'CC-04', name: 'Trial ended', brand: 'Closecraft', trigger: 'Trial entitlement expired and paid features paused' },
  { id: 'CC-05', name: 'Payment received & subscription active', brand: 'Closecraft', trigger: 'Payment verified and subscription active' },
  { id: 'CC-06', name: 'Payment not completed', brand: 'Closecraft', trigger: 'Payment provider confirms failure or terminal state' },
  { id: 'CC-07', name: 'Subscription cancellation confirmed', brand: 'Closecraft', trigger: 'Cancellation saved; shows access end date' },
  { id: 'CC-08', name: 'Password reset requested', brand: 'Closecraft', trigger: 'Valid reset request through auth system' },
  { id: 'CC-09', name: 'Password changed', brand: 'Closecraft', trigger: 'Confirmed password update security event' },
  { id: 'CC-10', name: 'Workspace invitation', brand: 'Closecraft', trigger: 'Workspace admin issues team invitation' },

  // DSS by Closecraft Templates
  { id: 'DSS-01', name: 'Application received', brand: 'DSS by Closecraft', trigger: 'Real DSS application stored' },
  { id: 'DSS-02', name: 'Application accepted & payment requested', brand: 'DSS by Closecraft', trigger: 'Authorized admissions review passes' },
  { id: 'DSS-03', name: 'Payment received (Tuition receipt)', brand: 'DSS by Closecraft', trigger: 'Verified tuition payment with early bird discount snapshot' },
  { id: 'DSS-04', name: 'Enrolment confirmed & dashboard ready', brand: 'DSS by Closecraft', trigger: 'Enrolment conditions met and LMS access active' },
  { id: 'DSS-05', name: 'Cohort schedule confirmed or updated', brand: 'DSS by Closecraft', trigger: 'Published schedule confirmed or updated' },
  { id: 'DSS-06', name: 'Live session reminder', brand: 'DSS by Closecraft', trigger: '24 hours before live workshop for enrolled learners' },
  { id: 'DSS-07', name: 'Assignment feedback ready', brand: 'DSS by Closecraft', trigger: 'Faculty feedback published for assignment' },
  { id: 'DSS-08', name: 'Final assessment needs action', brand: 'DSS by Closecraft', trigger: 'Completion review requires evidence corrections' },
  { id: 'DSS-09', name: 'Completion confirmed & certificate issued', brand: 'DSS by Closecraft', trigger: 'Trainer confirms graduation requirements and certificate issued' },
  { id: 'DSS-10', name: 'Tuition payment not completed', brand: 'DSS by Closecraft', trigger: 'Conclusively failed tuition payment attempt' },
  { id: 'DSS-11', name: 'Refund processed', brand: 'DSS by Closecraft', trigger: 'Verified tuition refund processed by provider' },
];

export default function EmailPreviewClient({
  previews,
  emailLogs,
  senderConfig,
}: {
  previews: Record<string, { subject: string; preheader: string; html: string; text: string }>;
  emailLogs: any[];
  senderConfig: {
    fromAddress: string;
    hasApiKey: boolean;
    isTestMode: boolean;
    allowlist: string[];
  };
}) {
  const [selectedId, setSelectedId] = useState<string>('DSS-03');
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const activeMeta = ALL_TEMPLATES.find((t) => t.id === selectedId) || ALL_TEMPLATES[0];
  const activePreview = previews[selectedId] || {
    subject: 'Subject',
    preheader: 'Preheader',
    html: '<p>Template preview</p>',
    text: 'Template preview',
  };

  const handleSendTest = async () => {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setTestResult({ success: false, message: 'Please enter a valid recipient email address.' });
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedId,
          recipientEmail: testEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTestResult({
          success: false,
          message: data.error || 'Failed to dispatch test email.',
        });
      } else {
        setTestResult({
          success: true,
          message: data.status === 'BLOCKED_TEST_MODE'
            ? `Safety Check: Recipient blocked by test mode. Add ${testEmail} to EMAIL_ALLOWLIST.`
            : `Test message dispatched successfully to ${testEmail}!`,
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Network error' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Col: Template Selector */}
      <div className="lg:col-span-4 space-y-6">
        {/* System Readiness Box */}
        <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Delivery System Status</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Sender Address:</span>
              <span className="font-mono text-white text-[11px]">{senderConfig.fromAddress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Resend API:</span>
              <span className={`font-semibold ${senderConfig.hasApiKey ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                {senderConfig.hasApiKey ? 'Configured & Active' : 'Dev Mock Mode'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Test Mode Gate:</span>
              <span className={`font-semibold ${senderConfig.isTestMode ? 'text-[#F59E0B]' : 'text-[#38BDF8]'}`}>
                {senderConfig.isTestMode ? 'Enforced (Allowlist)' : 'Normal Send'}
              </span>
            </div>
          </div>
        </div>

        {/* Template List */}
        <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Transactional Templates (21)
          </div>

          <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
            {ALL_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedId;
              const isDSS = tmpl.brand === 'DSS by Closecraft';

              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(tmpl.id);
                    setTestResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2 text-xs ${
                    isSelected
                      ? 'bg-[#0066FF] text-white shadow-md'
                      : 'hover:bg-white/5 text-[#CBD5E1]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-[#38BDF8]'
                      }`}>
                        {tmpl.id}
                      </span>
                      <span className="font-semibold">{tmpl.name}</span>
                    </div>
                    <div className={`text-[11px] mt-1 line-clamp-1 ${
                      isSelected ? 'text-white/80' : 'text-[#94A3B8]'
                    }`}>
                      {tmpl.trigger}
                    </div>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isDSS
                      ? 'bg-[#0066FF]/20 text-[#60A5FA]'
                      : 'bg-white/5 text-[#94A3B8]'
                  }`}>
                    {isDSS ? 'DSS' : 'CC'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Col: Interactive Preview & Test Dispatcher */}
      <div className="lg:col-span-8 space-y-6">
        {/* Active Template Meta & View Switcher */}
        <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0066FF] text-white">
                  {activeMeta.id}
                </span>
                <h2 className="text-lg font-bold text-white">{activeMeta.name}</h2>
                <span className="text-xs text-[#94A3B8]">({activeMeta.brand})</span>
              </div>
              <div className="text-xs text-[#94A3B8]">
                Trigger: <span className="text-[#CBD5E1]">{activeMeta.trigger}</span>
              </div>
            </div>

            {/* Switch HTML vs Plain-Text */}
            <div className="flex bg-[#071126] p-1 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('html')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'html'
                    ? 'bg-[#0066FF] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>HTML Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'text'
                    ? 'bg-[#0066FF] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Plain-Text Parity</span>
              </button>
            </div>
          </div>

          {/* Subject & Preheader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#071126] p-4 rounded-xl border border-white/5 mb-6">
            <div>
              <span className="text-[#94A3B8] block mb-0.5 font-semibold">Subject:</span>
              <span className="font-medium text-white select-all">{activePreview.subject}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block mb-0.5 font-semibold">Preheader:</span>
              <span className="font-medium text-[#CBD5E1] select-all">{activePreview.preheader}</span>
            </div>
          </div>

          {/* Test Dispatch Bar */}
          <div className="p-4 rounded-xl bg-[#0D1C3D] border border-white/10 mb-6">
            <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Send Controlled Test Dispatch</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test-recipient@domain.com"
                className="flex-1 h-10 px-3 rounded-xl bg-[#071126] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#0066FF]"
              />
              <button
                type="button"
                disabled={sendingTest}
                onClick={handleSendTest}
                className="px-5 h-10 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
              >
                {sendingTest ? 'Sending...' : 'Send Test'}
              </button>
            </div>

            {testResult && (
              <div
                className={`text-xs mt-3 p-3 rounded-lg border flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                    : 'bg-red-900/30 text-red-200 border-red-500/40'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Preview Container */}
          <div className="rounded-2xl overflow-hidden border border-white/15 bg-white shadow-xl">
            {viewMode === 'html' ? (
              <div className="p-2 sm:p-6 bg-[#f4f7fa]">
                <iframe
                  title="Email HTML Preview"
                  srcDoc={activePreview.html}
                  className="w-full min-h-[580px] bg-white rounded-xl shadow border border-gray-200"
                />
              </div>
            ) : (
              <div className="p-6 bg-[#0f172a] text-[#e2e8f0] font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                {activePreview.text}
              </div>
            )}
          </div>
        </div>

        {/* Audit Delivery Logs */}
        <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">Recent Delivery Audit Trail</h3>
          {emailLogs.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">No transactional sends recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#94A3B8]">
                    <th className="pb-2 font-semibold">Template</th>
                    <th className="pb-2 font-semibold">Recipient</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Deduplication Key</th>
                    <th className="pb-2 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emailLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="text-white hover:bg-white/[0.02]">
                      <td className="py-2.5 font-mono text-[#38BDF8]">{log.templateId}</td>
                      <td className="py-2.5 font-mono">{log.recipientEmail}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'SENT' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-red-900/30 text-red-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-[#94A3B8]">{log.deduplicationKey}</td>
                      <td className="py-2.5 text-[#94A3B8]">
                        {new Date(log.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
