'use client';

import React, { useState } from 'react';
import { formatWhatsAppUrl } from '@/lib/whatsapp';

export interface LeadAiModalData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  buyingIntent?: number | null;
  assignedRole?: string | null;
  assignedUserId?: string | null;
  assignedUser?: {
    id?: string;
    name?: string | null;
    email?: string;
    image?: string | null;
  } | null;
  aiAssessment?: string | null;
  nextStepsRecommendation?: string | null;
}

interface LeadAiAssessmentModalProps {
  lead: LeadAiModalData;
  onClose: () => void;
  onClaim?: (leadId: string, leadName: string) => void;
  onBookDemo?: (lead: LeadAiModalData) => void;
  isPending?: boolean;
}

export function LeadAiAssessmentModal({
  lead,
  onClose,
  onClaim,
  onBookDemo,
  isPending = false,
}: LeadAiAssessmentModalProps) {
  const [copiedScript, setCopiedScript] = useState(false);

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const intentScore = lead.buyingIntent || 50;
  const isHot = intentScore >= 75;

  const fallbackAssessment =
    `• Fit Score: ${intentScore}/100 • Intent: ${isHot ? 'High Urgency' : 'Standard Urgency'}\n` +
    `• Stated Need: "${lead.message || 'Commercial requirements inquiry'}"\n` +
    `• Verified against Organization ICP Policy.`;

  const fallbackProtocol =
    `🎯 CONSULTATIVE OUTREACH PROTOCOL (HUMAN REVIEW REQUIRED):\n` +
    `• Prescribed WhatsApp Opener: "Hi ${lead.name}, thanks for reaching out. I'm reviewing your inquiry with our team—do you have 10 minutes today for a quick chat to discuss your requirements?"\n` +
    `• Best Channel: WhatsApp Direct Message / Quick Call.\n` +
    `• Objective: Qualify scope, validate timeline, and confirm readiness for proposal.\n` +
    `• SLA: Respond within 15 minutes.`;

  const assessmentText = lead.aiAssessment || fallbackAssessment;
  const protocolText = lead.nextStepsRecommendation || fallbackProtocol;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-on-surface">{lead.name}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                    isHot
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">bolt</span>
                  {intentScore}/100 Intent
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">{lead.email}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Target Closer/Setter Assignment Box */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary block">
                Recommended Operator Role
              </span>
              <span className="text-sm font-bold text-on-surface flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span>
                  {lead.assignedRole === 'CLOSER'
                    ? 'High-Ticket Sales Closer'
                    : 'Appointment Setter (Discovery)'}
                </span>
              </span>
            </div>

            {!lead.assignedUserId && onClaim ? (
              <button
                disabled={isPending}
                onClick={() => onClaim(lead.id, lead.name)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">handshake</span>
                <span>Claim Lead</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface">
                Assigned to: {lead.assignedUser?.name || lead.assignedUser?.email || 'Team Member'}
              </span>
            )}
          </div>

          {/* 1. AI Deal Assessment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-[18px]">insights</span>
              <span>AI Qualification Assessment</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
              {assessmentText}
            </div>
          </div>

          {/* 2. Prescriptive Next Steps for Closer / Setter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                <span>Prescriptive Action Protocol & Coaching</span>
              </div>
              <button
                onClick={() => handleCopyScript(protocolText)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-on-surface whitespace-pre-wrap leading-relaxed font-sans">
              {protocolText}
            </div>
          </div>

          {/* Quick Communication & Scheduling Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {lead.phone && (
              <a
                href={formatWhatsAppUrl(
                  lead.phone,
                  `Hi ${lead.name}, thanks for reaching out. I reviewed your notes and would love to connect.`
                ) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Open in WhatsApp with Opener Script</span>
              </a>
            )}

            {onBookDemo && (
              <button
                onClick={() => onBookDemo(lead)}
                className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">event</span>
                <span>Book Demo Meeting</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
