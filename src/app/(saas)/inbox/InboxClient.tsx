'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatWhatsAppUrl } from '@/lib/whatsapp';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  FileText, 
  Calendar, 
  DollarSign, 
  Layers, 
  Bot, 
  UserCheck, 
  Play, 
  Pause, 
  Flame,
  Search,
  Check
} from 'lucide-react';

interface InboxClientProps {
  initialLeads: any[];
}

export default function InboxClient({ initialLeads }: InboxClientProps) {
  const router = useRouter();

  // Filters & State
  const [activeChannelFilter, setActiveChannelFilter] = useState<'ALL' | 'WHATSAPP' | 'EMAIL' | 'WEB' | 'HANDOFF' | 'HOT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLeadId, setActiveLeadId] = useState<string | null>(initialLeads[0]?.id || null);
  const [composerText, setComposerText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileTab, setMobileTab] = useState<'LIST' | 'CHAT' | 'CONTEXT'>('LIST');

  // Human Takeover / AI Pause state per conversation
  const [pausedAiLeads, setPausedAiLeads] = useState<Record<string, boolean>>({});

  // Quick Response Presets
  const quickTemplates = [
    { label: 'Book Demo 📅', text: 'Hi! Let’s schedule a brief 15-minute walkthrough to review your revenue targets. What time works best for you this week?' },
    { label: 'Send Scoped Quote 📄', text: 'Thanks for clarifying your requirements. I have prepared our verified scope and proposal for your review. Would you like me to share the link here?' },
    { label: 'Diagnose Objection 🎯', text: 'Completely understand your perspective. To make sure we address your exact hesitation, is your primary concern around implementation timeline or ROI velocity?' },
    { label: 'Request WhatsApp Call 📞', text: 'Are you available for a quick 5-minute WhatsApp audio call right now to align on next steps?' }
  ];

  // 1. Filter Leads
  const filteredLeads = initialLeads.filter(lead => {
    // Channel filter
    const primaryChannel = lead.conversations?.[0]?.channel || (lead.phone ? 'WHATSAPP' : 'EMAIL');
    if (activeChannelFilter === 'WHATSAPP' && primaryChannel !== 'WHATSAPP') return false;
    if (activeChannelFilter === 'EMAIL' && primaryChannel !== 'EMAIL') return false;
    if (activeChannelFilter === 'WEB' && primaryChannel !== 'WEB') return false;
    if (activeChannelFilter === 'HOT') {
      const intent = lead.buyingIntent || 0;
      if (intent < 70) return false;
    }
    if (activeChannelFilter === 'HANDOFF') {
      const latestMsg = lead.conversations?.[0]?.messages?.[0];
      const needsHuman = lead.status === 'ENGAGED' || latestMsg?.senderType === 'PROSPECT';
      if (!needsHuman) return false;
    }

    // Search query
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
  if (!filteredLeads.find(l => l.id === currentActiveId)) {
    currentActiveId = filteredLeads[0]?.id || null;
  }

  const activeLead = filteredLeads.find(l => l.id === currentActiveId);
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
    setPausedAiLeads(prev => ({
      ...prev,
      [activeLead.id]: !prev[activeLead.id]
    }));
  };

  const handleSelectLead = (id: string) => {
    setActiveLeadId(id);
    setMobileTab('CHAT');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: composerText.trim(),
          senderType: 'HUMAN',
          isManuallySent: false
        })
      });

      if (res.ok) {
        setComposerText('');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
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

    if (activeConversation) {
      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConversation.id,
            content: draft,
            senderType: 'HUMAN',
            isManuallySent: true
          })
        });
        setComposerText('');
        router.refresh();
      } catch (err) {
        console.error('Failed to log WhatsApp outreach:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#0f1214] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Mobile Screen Switcher Bar */}
      <div className="lg:hidden flex border-b border-white/5 bg-[#0a0d12] text-xs font-bold shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('LIST')}
          className={`flex-1 py-3 text-center transition-colors border-b-2 ${
            mobileTab === 'LIST' 
              ? 'text-[#45bfae] border-[#45bfae] bg-[#248277]/10' 
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
              ? 'text-[#45bfae] border-[#45bfae] bg-[#248277]/10' 
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
              ? 'text-[#45bfae] border-[#45bfae] bg-[#248277]/10' 
              : 'text-gray-400 border-transparent hover:text-white disabled:opacity-40'
          }`}
        >
          Lead Intel
        </button>
      </div>

      <div className="grid grid-cols-12 flex-1 overflow-hidden">
        {/* =========================================================================
            PANE 1: Conversation List (Triage Stream)
            ========================================================================= */}
        <section 
          className={`col-span-12 lg:col-span-4 xl:col-span-3 border-r border-white/5 flex flex-col bg-[#0a0d12] h-full overflow-hidden ${
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
                className="w-full bg-[#161a1d] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#45bfae] transition-colors"
              />
            </div>

            {/* Channel Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-nowrap">
              <button
                type="button"
                onClick={() => setActiveChannelFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeChannelFilter === 'ALL'
                    ? 'bg-[#45bfae] text-[#0f1214]'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                All ({initialLeads.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('HANDOFF')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeChannelFilter === 'HANDOFF'
                    ? 'bg-[#45bfae] text-[#0f1214]'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                Handoff
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('HOT')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                  activeChannelFilter === 'HOT'
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 hover:bg-white/10 text-amber-400'
                }`}
              >
                <Flame size={12} /> Hot
              </button>
              <button
                type="button"
                onClick={() => setActiveChannelFilter('WHATSAPP')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeChannelFilter === 'WHATSAPP'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                WhatsApp
              </button>
            </div>
          </div>

          {/* Conversation Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No active conversations matching criteria.
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const latestMsg = lead.conversations?.[0]?.messages?.[0];
                const isSelected = lead.id === currentActiveId;
                const isHot = lead.buyingIntent && lead.buyingIntent >= 70;
                const channel = lead.conversations?.[0]?.channel || (lead.phone ? 'WHATSAPP' : 'EMAIL');
                const deal = lead.deals?.[0];
                const dealVal = deal ? `₦${(deal.amount / 1000).toFixed(0)}k` : null;

                return (
                  <article
                    key={lead.id}
                    onClick={() => handleSelectLead(lead.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#121c1a] border border-[#248277]/50 shadow-lg shadow-[#248277]/10'
                        : 'bg-white/[0.02] hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-bold text-xs shrink-0">
                          {lead.name?.substring(0, 2).toUpperCase() || 'LD'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs truncate">{lead.name}</span>
                            {isHot && (
                              <span title="High Intent Lead">
                                <Flame size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {lead.phone || lead.email}
                          </div>
                        </div>
                      </div>

                      {latestMsg && (
                        <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                          {new Date(latestMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Latest Message Preview */}
                    {latestMsg && (
                      <p className="text-[11px] text-gray-400 line-clamp-1 mb-2 leading-relaxed">
                        <strong className="text-gray-300 font-medium">
                          {latestMsg.senderType === 'PROSPECT' ? 'Buyer: ' : latestMsg.senderType === 'AI' ? 'AI: ' : 'You: '}
                        </strong>
                        {latestMsg.content}
                      </p>
                    )}

                    {/* Badges Strip */}
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        channel === 'WHATSAPP' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {channel}
                      </span>
                      {dealVal && (
                        <span className="font-mono text-gray-300 font-semibold">
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
          className={`col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col bg-[#0f1214] h-full overflow-hidden ${
            mobileTab !== 'CHAT' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeLead ? (
            <>
              {/* Conversation Header */}
              <header className="p-4 bg-[#0a0d12] border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#248277]/20 border border-[#248277]/40 flex items-center justify-center text-[#45bfae] font-bold text-sm shadow-md">
                    {activeLead.name?.substring(0, 2).toUpperCase() || 'LD'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif font-bold text-white text-base md:text-lg">{activeLead.name}</h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                        {activeLead.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{activeLead.phone || activeLead.email}</span>
                      <span>•</span>
                      <span className="text-[#45bfae] font-medium">{activeLead.source || 'Website Inbound'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Auto-Pilot Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleAiHandoff}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      isAiPaused
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-[#248277]/15 text-[#45bfae] border-[#248277]/30'
                    }`}
                    title={isAiPaused ? 'Resume AI Auto-Pilot' : 'Pause AI and Take Over'}
                  >
                    {isAiPaused ? <Pause size={13} /> : <Bot size={13} />}
                    <span>{isAiPaused ? 'Human Took Over' : 'AI Active'}</span>
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
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} />
                    <span>AI auto-responder paused. You are communicating directly with this prospect.</span>
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
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center space-y-2">
                    <MessageSquare size={32} className="opacity-40" />
                    <p>No messages exchanged yet.</p>
                    <p className="text-gray-600 max-w-xs">
                      Send a message below or click Open in WhatsApp to begin outreach.
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
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${
                            isProspect ? 'text-gray-400' : isAi ? 'text-[#45bfae]' : 'text-emerald-400'
                          }`}>
                            {isProspect ? 'Buyer' : isAi ? 'AI Support' : 'You (Sales Rep)'}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-md ${
                            isProspect
                              ? 'bg-[#161a1d] border border-white/5 text-gray-200 rounded-tl-sm'
                              : isAi
                              ? 'bg-[#121c1a] border border-[#248277]/30 text-white rounded-tr-sm'
                              : 'bg-[#248277] text-white rounded-tr-sm shadow-[#248277]/20'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Smart Composer & Presets */}
              <div className="p-4 bg-[#0a0d12] border-t border-white/5 shrink-0 space-y-3">
                {/* AI Preset Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-nowrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#45bfae]" /> Templates:
                  </span>
                  {quickTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setComposerText(t.text)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-medium transition-colors border border-white/5"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Composer Form */}
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Type an omnichannel reply, or choose a verified template..."
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    className="w-full bg-[#161a1d] border border-white/10 rounded-xl p-3 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#45bfae] transition-colors resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-gray-500">
                      Channel: <strong className="text-gray-300">{activeLead.phone ? 'WhatsApp Cloud API' : 'Email'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeLead.phone && (
                        <button
                          type="button"
                          onClick={handleDirectWhatsAppOutreach}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <ExternalLink size={13} />
                          <span>Dispatch via WhatsApp</span>
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isSending || !composerText.trim()}
                        className="px-4 py-2 rounded-xl bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-40"
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
          className={`col-span-12 xl:col-span-3 border-l border-white/5 flex flex-col bg-[#0a0d12] h-full overflow-y-auto p-4 space-y-4 ${
            mobileTab !== 'CONTEXT' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {activeLead ? (
            <>
              {/* Header */}
              <div className="border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#45bfae] block mb-1">
                  Lead Intelligence
                </span>
                <h3 className="font-serif font-bold text-white text-base truncate">{activeLead.name}</h3>
              </div>

              {/* Commercial Snapshot Card */}
              <div className="p-4 rounded-xl bg-[#121c1a] border border-[#248277]/30 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Opportunity Snapshot
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block">Est. Deal Value</span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block truncate">
                      {activeDealAmount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block">Propensity</span>
                    <span className="text-sm font-bold text-[#45bfae] font-mono mt-0.5 block">
                      {activeLead.buyingIntent || 50}%
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                  <span>Pipeline Stage:</span>
                  <span className="font-bold text-white">{activeDeal?.stage || 'OPPORTUNITY'}</span>
                </div>
              </div>

              {/* Next Best Action Card */}
              {activeNextAction && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#121c1a] to-[#0f1214] border border-[#45bfae]/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#45bfae]">
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} /> Next Best Action
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#45bfae]/20 text-[#45bfae]">
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
                    <span className="font-bold font-mono text-[#45bfae]">{activeNextAction.priority}%</span>
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
                    <Phone size={14} className="text-[#45bfae] shrink-0" />
                    <span className="truncate">{activeLead.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={14} className="text-[#45bfae] shrink-0" />
                    <span className="truncate">{activeLead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe size={14} className="text-[#45bfae] shrink-0" />
                    <span className="truncate">Source: {activeLead.source || 'Website'}</span>
                  </div>
                </div>
              </div>

              {/* CloseCraft Growth Services Brief (If applicable) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Growth Services Engagement
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Linked to CloseCraft 5 Core Services (Ads, Creatives, AI Video, Landing Page, VSL).
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/pipeline`)}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors border border-white/10 flex items-center justify-center gap-1.5"
                  >
                    <span>View in Pipeline</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
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
