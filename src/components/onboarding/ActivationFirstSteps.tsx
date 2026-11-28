import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, MessageCircle, Share2, ArrowRight } from 'lucide-react';

interface ActivationFirstStepsProps {
  whatsappConnected: boolean;
  metaConnected: boolean;
  leadCount: number;
}

/**
 * Shown at the top of /onboarding, before the qualification questions.
 * Activation comes first for a business that runs ads: enquiries only flow
 * once a channel is connected. All states come from real connection data
 * fetched by the page — this component never guesses.
 */
export default function ActivationFirstSteps({
  whatsappConnected,
  metaConnected,
  leadCount,
}: ActivationFirstStepsProps) {
  const allDone = whatsappConnected && metaConnected && leadCount > 0;

  if (allDone) {
    return (
      <div className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-200">
          Your channels are connected and enquiries are flowing. The questions below are optional — they help
          personalise CloseCraft to your business, and you can skip them.
        </p>
      </div>
    );
  }

  const channels = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      desc: 'Enquiries to your WhatsApp Business number land in your Inbox automatically.',
      isDone: whatsappConnected,
      href: '/settings#whatsapp',
      actionLabel: whatsappConnected ? 'Manage connection' : 'Connect WhatsApp',
    },
    {
      icon: Share2,
      title: 'Meta Lead Ads',
      desc: 'Leads from your Facebook and Instagram ads flow straight into CloseCraft.',
      isDone: metaConnected,
      href: '/settings#meta-ads',
      actionLabel: metaConnected ? 'Manage connection' : 'Connect Meta Ads',
    },
  ];

  return (
    <section className="max-w-3xl mx-auto mb-6 p-6 rounded-3xl bg-[#0f1214] border border-white/5 shadow-xl space-y-4">
      <div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#248277]/10 text-[#45bfae] border border-[#248277]/20">
          First — connect your channels
        </span>
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mt-3">
          Your enquiries can&apos;t arrive until a channel is connected
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
          This takes about two minutes, and it is the whole point of CloseCraft: every enquiry from your ads and
          your WhatsApp lands in one Inbox, gets followed up, and gets closed. Connect now, or after the questions
          below — the setup checklist will be waiting on your Overview page either way.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {channels.map((channel) => (
          <div key={channel.title} className="p-4 rounded-2xl bg-[#0a0d12] border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              {channel.isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <channel.icon className="w-4 h-4 text-[#45bfae]" />
              <h3 className="text-sm font-semibold text-white">{channel.title}</h3>
              <span
                className={`ml-auto text-[10px] font-bold uppercase tracking-wider ${
                  channel.isDone ? 'text-emerald-400' : 'text-amber-300'
                }`}
              >
                {channel.isDone ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{channel.desc}</p>
            <Link
              href={channel.href}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#45bfae] hover:text-[#5cd4c3] transition"
            >
              <span>{channel.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
