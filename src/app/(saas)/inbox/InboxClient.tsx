'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatWhatsAppUrl } from '@/lib/whatsapp';
import { assignLeadToUser } from '@/app/(saas)/actions';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  Bot, 
  UserCheck, 
  Pause, 
  Flame,
  Search,
  Check,
  CheckCheck,
  ShieldCheck,
  ChevronDown,
  Megaphone
} from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface InboxClientProps {
  initialLeads: any[];
  teamMembers?: TeamMember[];
  currentUserId?: string;
}

// Enquiry sources unified in this inbox. An enquiry's origin is recorded
// on Lead.source (e.g. WHATSAPP, FACEBOOK_LEAD_AD, WEBSITE_WIDGET); the
// conversation channel only records how replies go out, so it is used
// here purely as a fallback signal.
export type EnquirySource = 'WHATSAPP' | 'META_ADS' | 'WEB' | 'OTHER';

export function getEnquirySource(lead: any): EnquirySource {
  const s = String(lead?.source || '').toUpperCase();
  if (s.includes('FACEBOOK') || s.includes('META') || s.includes('INSTAGRAM')) return 'META_ADS';
  if (s.includes('WEBSITE') || s.includes('WEB') || s.includes('PUBLIC')) return 'WEB';
  if (s.includes('WHATSAPP')) return 'WHATSAPP';
  const channel = lead?.conversations?.[0]?.channel;
  if (channel === 'WHATSAPP') return 'WHATSAPP';
  if (channel === 'WEB') return 'WEB';
  return lead?.phone ? 'WHATSAPP' : 'OTHER';
}

export const ENQUIRY_SOURCE_LABEL: Record<EnquirySource, string> = {
  WHATSAPP: 'WhatsApp',
  META_ADS: 'Meta Ads',
  WEB: 'Web Capture',
  OTHER: 'Other',
};

export default function InboxClient({ 
  initialLeads, 
  teamMembers = [], 
  currentUserId 
}: InboxClientProps) {
  const router = useRouter();

  // Local leads state for instant optimistic updates
  const [leads, setLeads] = useState<any[]>(initialLeads);

  // Filters & Navigation State
  const [activeChannelFilter, setActiveChannelFilter] = useState<'ALL' | 'WHATSAPP' | 'META_ADS' | 'WEB' | 'HANDOFF' | 'HOT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLeadId, setActiveLeadId] = useState<string | null>(initialLeads[0]?.id || null);
  const [composerText, setComposerText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileTab, setMobileTab] = useState<'LIST' | 'CHAT' | 'CONTEXT'>('LIST');
  const [isAssigning, startAssignTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Human Takeover / AI Pause state per conversation
  const [pausedAiLeads, setPausedAiLeads] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick Response Presets
  const quickTemplates = [
    { label: 'Book Demo 📅', text: 'Hi! Let’s schedule a brief 15-minute walkthrough to review your revenue targets. What time works best for you this week?' },
    { label: 'Send Scoped Quote 📄', text: 'Thanks for clarifying your requirements. I have prepared our verified scope and proposal for your review. Would you like me to share the link here?' },
    { label: 'Diagnose Objection 🎯', text: 'Completely understand your perspective. To make sure we address your exact hesitation, is your primary concern around implementation timeline or ROI velocity?' },
    { label: 'Request WhatsApp Call 📞', text: 'Are you available for a quick 5-minute WhatsApp audio call right now to align on next steps?' }
  ];

  // Enquiry counts per source, for the filter chips
  const sourceCounts: Record<EnquirySource, number> = { WHATSAPP: 0, META_ADS: 0, WEB: 0, OTHER: 0 };
  leads.forEach((l) => { sourceCounts[getEnquirySource(l)] += 1; });

  // 1. Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const enquirySource = getEnquirySource(lead);
    if (activeChannelFilter === 'WHATSAPP' && enquirySource !== 'WHATSAPP') return false;
    if (activeChannelFilter === 'META_ADS' && enquirySource !== 'META_ADS') return false;
    if (activeChannelFilter === 'WEB' && enquirySource !== 'WEB') return false;
    if (activeChannelFilter === 'HOT') {
      const intent = lead.buyingIntent || 0;
      if (intent < 70) return false;
    }
    if (activeChannelFilter === 'HANDOFF') {
      const latestMsg = lead.conversations?.[0]?.messages?.[0];
      const needsHuman = lead.status === 'ENGAGED' || latestMsg?.senderType === 'PROSPECT';
      if (!needsHuman) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name?.toLowerCase().includes(q);
      const matchPhone = lead.phone?.toLowerCase().includes(q);
      const matchEmail = lead.email?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }

    return true;
  });

  // Ensure active lead exists
  let currentActiveId = activeLeadId;
  if (!filteredLeads.find((l) => l.id === currentActiveId)) {
    currentActiveId = filteredLeads[0]?.id || null;
  }

  const activeLead = filteredLeads.find((l) => l.id === currentActiveId);
  const activeConversation = activeLead?.conversations?.[0];
  const messages = activeConversation?.messages ? [...activeConversation.messages].reverse() : [];
  const activeDeal = activeLead?.deals?.[0];
  const activeDealAmount = activeDeal 
    ? `₦${(activeDeal.amount).toLocaleString()}` 
    : (activeLead?.estimatedValue ? `₦${activeLead.estimatedValue.toLocaleString()}` : 'No Deal Linked');
  const activeNextAction = activeLead?.revenueActions?.[0];

  const isAiPaused = activeLead ? Boolean(pausedAiLeads[activeLead.id]) : false;

  const toggleAiHandoff = () => {
    if (!activeLead) return;
    setPausedAiLeads((prev) => ({
      ...prev,
      [activeLead.id]: !prev[activeLead.id]
    }));
  };

  const handleSelectLead = (id: string) => {
    setActiveLeadId(id);
    setMobileTab('CHAT');
  };

  // Team Member Assignment Handler
  const handleAssignLead = (targetUserId: string) => {
    if (!activeLead) return;

    const assignedMember = teamMembers.find((m) => m.id === targetUserId);
    const assignedName = assignedMember?.name || 'Unassigned';

    // Optimistically update local state
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === activeLead.id) {
          return {
            ...l,
            assignedUserId: targetUserId || null,
            assignedUser: assignedMember ? { id: assignedMember.id, name: assignedMember.name, email: assignedMember.email } : null,
          };
        }
        return l;
      })
    );

    startAssignTransition(async () => {
      try {
        if (targetUserId) {
          await assignLeadToUser(activeLead.id, targetUserId, assignedMember?.role);
          showToast(`✅ Lead assigned to ${assignedName}`);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to update assignment');
        router.refresh();
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() || !activeLead || isSending) return;

    setIsSending(true);
    const content = composerText.trim();

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation?.id,
          leadId: activeLead.id,
          content,
          senderType: 'HUMAN',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComposerText('');

        // Report the dispatch outcome truthfully: a WhatsApp reply is only
        // "sent" when Meta accepted it. Dry-run mode logs without sending.
        if (data.dispatch?.deliveryStatus === 'SENT') {
          showToast('Message sent via WhatsApp');
        } else if (data.dispatch?.dryRun) {
          showToast('Live WhatsApp dispatch is off — message logged only, not sent');
        } else if (data.dispatch) {
          showToast(data.dispatch.error || 'WhatsApp delivery failed — the message is marked failed in the thread');
        } else {
          showToast('Message logged');
        }
        // Optimistically add message
        if (data.message) {
          setLeads((prev) =>
            prev.map((l) => {
              if (l.id === activeLead.id) {
                const convs = [...(l.conversations || [])];
                if (convs.length > 0) {
                  convs[0] = {
                    ...convs[0],
                    messages: [data.message, ...(convs[0].messages || [])],
                  };
                }
                return { ...l, conversations: convs };
              }
              return l;
            })
          );
        }
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('Network error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const handleDirectWhatsAppOutreach = async () => {
    if (!activeLead?.phone) return;
    const draft = composerText.trim() || `Hi ${activeLead.name}, this is your sales advisor from CloseCraft. Let's discuss your requirements.`;
    const url = formatWhatsAppUrl(activeLead.phone, draft);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation?.id,
          leadId: activeLead.id,
          content: draft,
          senderType: 'HUMAN',
        }),
      });
      setComposerText('');
      showToast('WhatsApp outreach recorded');
      router.refresh();
    } catch (err) {
      console.error('Failed to log WhatsApp outreach:', err);
    }
  };

  const assignedRep = activeLead?.assignedUser || teamMembers.find((m) => m.id === activeLead?.assignedUserId);

  return (
    <div className="flex flex-col flex-1 bg-[#0f1214] border border-white/5 rounded-2xl overflow-hidden shadow-2xl min-h-0 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 right-4 z-50 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Mobile Screen Switcher Bar */}
      <div className="lg:hidden flex border-b border-white/5 bg-[#0a0d12] text-xs font-bold shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('LIST')}
          className={`flex-1 py-3 text-center transition-colors border-b-2 ${
            mobileTab === 'LIST' 
              ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Conversations ({filteredLeads.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('CHAT')}
          disabled={!activeLead}
          className={`flex-1 py-3 text-center transition-colors border-b-2 ${
            mobileTab === 'CHAT' 
              ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10' 
              : 'text-gray-400 border-transparent hover:text-white disabled:opacity-40'
          }`}
        >
          Active Thread
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('CONTEXT')}
          disabled={!activeLead}
          className={`flex-1 py-3 text-center transition-colors border-b-2 ${
            mobileTab === 'CONTEXT' 
              ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10' 
              : 'text-gray-400 border-transparent hover:text-white disabled:opacity-40'
          }`}
        >
          Lead Intel
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* =========================================================================
            PANE 1: Conversation List (Triage Stream)
            ========================================================================= */}
        <section 
          className={`w-full lg:w-[340px] xl:w-[370px] shrink-0 border-r border-white/5 flex flex-col bg-[#0a0d12] h-full overflow-hidden ${
            mobileTab !== 'LIST' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search & Channel Filters */}
          <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
            {/* Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161a1d] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Source Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-nowrap">
              <button
                type="button"
                onClick={() => setActiveChannelFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeChannelFilter === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                All ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('WHATSAPP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeChannelFilter === 'WHATSAPP'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                <MessageSquare size={12} /> WhatsApp ({sourceCounts.WHATSAPP})
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('META_ADS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeChannelFilter === 'META_ADS'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                <Megaphone size={12} /> Meta Ads ({sourceCounts.META_ADS})
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('WEB')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeChannelFilter === 'WEB'
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                <Globe size={12} /> Web Capture ({sourceCounts.WEB})
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('HOT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeChannelFilter === 'HOT'
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 hover:bg-white/10 text-amber-400'
                }`}
              >
                <Flame size={12} /> Hot
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('HANDOFF')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeChannelFilter === 'HANDOFF'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                Handoff
              </button>
            </div>
          </div>

          {/* Conversation Cards Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredLeads.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                No active conversations matching criteria.
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const latestMsg = lead.conversations?.[0]?.messages?.[0];
                const isSelected = lead.id === currentActiveId;
                const isHot = lead.buyingIntent && lead.buyingIntent >= 70;
                const source = getEnquirySource(lead);
                const deal = lead.deals?.[0];
                const dealVal = deal ? `₦${(deal.amount / 1000).toFixed(0)}k` : null;
                const assigned = lead.assignedUser || teamMembers.find((m) => m.id === lead.assignedUserId);

                return (
                  <article
                    key={lead.id}
                    onClick={() => handleSelectLead(lead.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                        : 'bg-white/[0.02] hover:bg-white/5 border border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                          {lead.name?.substring(0, 2).toUpperCase() || 'LD'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm truncate">{lead.name}</span>
                            {isHot && (
                              <span title="High Intent Lead">
                                <Flame size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {lead.phone || lead.email}
                          </div>
                        </div>
                      </div>

                      {latestMsg && (
                        <span className="text-[11px] text-gray-500 shrink-0 font-mono">
                          {new Date(latestMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Latest Message Preview */}
                    {latestMsg && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2.5 leading-relaxed">
                        <strong className="text-gray-300 font-medium">
                          {latestMsg.senderType === 'PROSPECT' ? 'Buyer: ' : latestMsg.senderType === 'AI' ? 'AI: ' : 'You: '}
                        </strong>
                        {latestMsg.content}
                      </p>
                    )}

                    {/* Badges Strip */}
                    <div className="flex items-center justify-between text-[10px] pt-2.5 border-t border-white/5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1 ${
                          source === 'WHATSAPP'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : source === 'META_ADS'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : source === 'WEB'
                            ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                          {source === 'WHATSAPP' ? <MessageSquare size={10} /> : source === 'META_ADS' ? <Megaphone size={10} /> : source === 'WEB' ? <Globe size={10} /> : null}
                          {ENQUIRY_SOURCE_LABEL[source]}
                        </span>

                        {assigned && (
                          <span className="text-[10px] text-gray-400 font-medium truncate flex items-center gap-0.5">
                            <User size={10} className="text-emerald-400 shrink-0" />
                            {assigned.name?.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      {dealVal && (
                        <span className="font-mono text-emerald-400 font-bold text-xs shrink-0">
                          {dealVal}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* =========================================================================
            PANE 2: Omnichannel Conversation Thread & Composer
            ========================================================================= */}
        <section 
          className={`flex-1 min-w-0 flex flex-col bg-[#0f1214] h-full overflow-hidden ${
            mobileTab !== 'CHAT' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeLead ? (
            <>
              {/* Conversation Header */}
              <header className="p-4 md:p-5 bg-[#0a0d12] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-md shrink-0">
                    {activeLead.name?.substring(0, 2).toUpperCase() || 'LD'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif font-bold text-white text-base md:text-lg truncate">{activeLead.name}</h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 shrink-0">
                        {activeLead.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                      <span>{activeLead.phone || activeLead.email}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">{ENQUIRY_SOURCE_LABEL[getEnquirySource(activeLead)]} enquiry</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Team Member Closer Assignment Dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#161a1d] px-2.5 py-1.5 rounded-xl border border-white/10 text-xs">
                    <UserCheck size={13} className="text-emerald-400 shrink-0" />
                    <span className="text-gray-400 text-[11px] font-medium hidden sm:inline">Rep:</span>
                    <select
                      value={activeLead.assignedUserId || ''}
                      onChange={(e) => handleAssignLead(e.target.value)}
                      disabled={isAssigning}
                      className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer max-w-[130px] truncate"
                    >
                      <option value="" className="bg-[#111827] text-gray-400">Unassigned</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#111827] text-white">
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AI Auto-Pilot Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleAiHandoff}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      isAiPaused
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                    title={isAiPaused ? 'Resume AI Auto-Pilot' : 'Pause AI and Take Over'}
                  >
                    {isAiPaused ? <Pause size={13} /> : <Bot size={13} />}
                    <span className="hidden sm:inline">{isAiPaused ? 'Human Active' : 'AI Copilot'}</span>
                  </button>

                  {/* Direct WhatsApp Web Button */}
                  {activeLead.phone && (
                    <button
                      type="button"
                      onClick={handleDirectWhatsAppOutreach}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                    >
                      <Phone size={13} />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  )}
                </div>
              </header>

              {/* AI Auto-Pilot Warning Banner */}
              {isAiPaused && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} />
                    <span>AI auto-responder paused. Rep is responding directly to this prospect.</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={toggleAiHandoff} 
                    className="underline text-[11px] font-bold hover:text-white"
                  >
                    Resume AI
                  </button>
                </div>
              )}

              {/* Message Thread Scroll Area */}
              <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-8 space-y-5 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center space-y-2 p-6">
                    <MessageSquare size={36} className="text-emerald-500/30" />
                    <p className="font-semibold text-gray-300 text-sm">No messages exchanged yet.</p>
                    <p className="text-gray-500 max-w-sm">
                      Use the smart composer below to send a verified introductory template, or click WhatsApp to initiate direct outreach.
                    </p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isProspect = msg.senderType === 'PROSPECT';
                    const isAi = msg.senderType === 'AI';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          isProspect ? 'items-start self-start' : 'items-end self-end'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-[11px] text-gray-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-[11px] uppercase font-bold tracking-wider ${
                            isProspect ? 'text-gray-400' : isAi ? 'text-emerald-400' : 'text-emerald-300'
                          }`}>
                            {isProspect ? 'Buyer' : isAi ? 'AI Support' : 'Rep (Human Closer)'}
                          </span>
                        </div>

                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                            isProspect
                              ? 'bg-[#161a1d] border border-white/5 text-gray-200 rounded-tl-sm'
                              : isAi
                              ? 'bg-emerald-950/20 border border-emerald-500/30 text-white rounded-tr-sm'
                              : 'bg-emerald-600 text-white rounded-tr-sm shadow-emerald-950/20'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* WhatsApp Delivery Receipt Indicators for Outbound Messages */}
                          {!isProspect && (
                            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-end gap-2 text-[10px]">
                              {msg.status === 'READ' || msg.readAt ? (
                                <span className="inline-flex items-center gap-1 text-cyan-300 font-mono font-medium">
                                  <CheckCheck size={12} className="text-cyan-300" /> Read
                                </span>
                              ) : msg.status === 'DELIVERED' || msg.deliveredAt ? (
                                <span className="inline-flex items-center gap-1 text-emerald-200 font-mono">
                                  <CheckCheck size={12} className="text-emerald-200" /> Delivered
                                </span>
                              ) : msg.status === 'SENT' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-200 font-mono">
                                  <Check size={11} className="text-emerald-200" /> Sent
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-emerald-200/90 font-mono">
                                  <CheckCheck size={12} /> Logged
                                </span>
                              )}

                              {msg.providerMessageId && (
                                <span
                                  className="text-[9px] font-mono text-white/50 bg-black/20 px-1 py-0.5 rounded truncate max-w-[110px]"
                                  title={`Meta Provider Message ID: ${msg.providerMessageId}`}
                                >
                                  {msg.providerMessageId.replace('wamid.', '')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Smart Composer & Presets */}
              <div className="p-4 md:p-5 bg-[#0a0d12] border-t border-white/5 shrink-0 space-y-3">
                {/* AI Preset Chips - Clean horizontal scroll with no truncation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mr-0.5 flex items-center gap-1 shrink-0">
                    <Sparkles size={12} /> Templates:
                  </span>
                  {quickTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setComposerText(t.text)}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors border border-white/5 shrink-0 whitespace-nowrap"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Composer Form */}
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Type an omnichannel reply, or choose a verified template above..."
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    className="w-full bg-[#161a1d] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-gray-500">
                      Channel: <strong className="text-gray-300">{activeLead.phone ? 'WhatsApp Cloud API' : 'Email'}</strong>
                      {assignedRep && (
                        <span className="ml-2 text-emerald-400">· Rep: {assignedRep.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {activeLead.phone && (
                        <button
                          type="button"
                          onClick={handleDirectWhatsAppOutreach}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <ExternalLink size={13} />
                          <span>Open in WhatsApp</span>
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isSending || !composerText.trim()}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-40"
                      >
                        <Send size={13} />
                        <span>{isSending ? 'Sending...' : 'Log & Send'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a conversation to start triaging.
            </div>
          )}
        </section>

        {/* =========================================================================
            PANE 3: Omnichannel Lead Context Inspector
            ========================================================================= */}
        <section 
          className={`w-full xl:w-80 2xl:w-88 shrink-0 border-l border-white/5 flex flex-col bg-[#0a0d12] h-full overflow-y-auto p-5 space-y-5 ${
            mobileTab !== 'CONTEXT' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {activeLead ? (
            <>
              {/* Header */}
              <div className="border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Lead Intelligence
                </span>
                <h3 className="font-serif font-bold text-white text-base truncate">{activeLead.name}</h3>
              </div>

              {/* Commercial Snapshot Card */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Opportunity Snapshot
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block">Est. Deal Value</span>
                    <span className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5 block truncate" title={activeDealAmount}>
                      {activeDealAmount}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 block">Propensity</span>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">
                      {activeLead.buyingIntent || 50}%
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-0.5">
                  <span>Pipeline Stage:</span>
                  <span className="font-bold text-white font-mono">{activeDeal?.stage || 'OPPORTUNITY'}</span>
                </div>
              </div>

              {/* Assigned Closer / Sales Rep Card */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Assigned Closer
                  </span>
                  {assignedRep && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {assignedRep.role || 'Rep'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                    {assignedRep?.name ? assignedRep.name.substring(0, 2).toUpperCase() : '??'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-white truncate">
                      {assignedRep?.name || 'Unassigned (Open Pool)'}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate font-mono">
                      {assignedRep?.email || 'Assign a team closer below'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <label className="text-[10px] text-gray-400 block mb-1">Reassign Team Member:</label>
                  <select
                    value={activeLead.assignedUserId || ''}
                    onChange={(e) => handleAssignLead(e.target.value)}
                    disabled={isAssigning}
                    className="w-full bg-[#161a1d] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="" className="bg-[#111827] text-gray-400">Unassigned (Open Pool)</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#111827] text-white">
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next Best Action Card */}
              {activeNextAction && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#121c1a] to-[#0f1214] border border-emerald-500/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} /> Next Best Action
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {activeNextAction.recommendedActor || 'HUMAN'}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-white text-xs">
                      {activeNextAction.type?.replace(/_/g, ' ')}
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                      {activeNextAction.reason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Priority Score:</span>
                    <span className="font-bold font-mono text-emerald-400">{activeNextAction.priority}%</span>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Contact Information
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{activeLead.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{activeLead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Source: {ENQUIRY_SOURCE_LABEL[getEnquirySource(activeLead)]}</span>
                  </div>
                </div>
              </div>

              {/* View in Deal Pipeline Link */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/pipeline`)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors border border-white/10 flex items-center justify-center gap-1.5"
                >
                  <span>Open in Deal Pipeline</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500 text-center py-8">
              No lead selected.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
