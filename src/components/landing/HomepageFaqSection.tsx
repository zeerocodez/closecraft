'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function HomepageFaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What exactly does CloseCraft do?',
      a: 'CloseCraft is a connected revenue growth system. We bring together software, professional growth services, and sales education to help businesses stop losing sales to unanswered enquiries and forgotten follow-ups. We help you attract prospects, capture and respond to enquiries quickly, organise sales follow-ups, and build your team\'s sales skills.'
    },
    {
      q: 'Is CloseCraft only an AI chatbot?',
      a: 'No. While CloseCraft incorporates AI to assist with enquiry responses, contextual summaries, and Next Best Action recommendations, it is not merely a chatbot. It is a full revenue operating system with a multi-user lead inbox, visual Kanban sales pipeline, SLA countdown timers, appointment scheduling, and human sales operations.'
    },
    {
      q: 'Can CloseCraft help us manage leads from Facebook and Instagram ads?',
      a: 'Yes. CloseCraft ingests enquiries from Meta lead ads, web forms, and connected messaging channels directly into your workspace in real time. Each lead is tagged with campaign source attribution and immediately assigned an owner and a follow-up SLA.'
    },
    {
      q: 'Can it support WhatsApp enquiries?',
      a: 'Yes. CloseCraft supports WhatsApp enquiry management, allowing you to centralise conversations, track customer needs, maintain message context across your team, and ensure that prospects on WhatsApp receive consistent, prompt follow-up.'
    },
    {
      q: 'Does Revenue Engine replace our sales team?',
      a: 'No. Revenue Engine is designed to make your human salespeople more effective and accountable. It automates predictable reminders, tracks response deadlines, and recommends the next best action, but human judgment, relationship building, and high-value closing remain in the hands of your team.'
    },
    {
      q: 'Can we use CloseCraft without buying every product?',
      a: 'Yes. You are never required to purchase every product or service. You can use CloseCraft software on a 7-day trial or paid subscription, request specific advertising or creative services as needed, or enroll reps in Digital Sales School independently.'
    },
    {
      q: 'Can we request advertising and creative services?',
      a: 'Yes. Our professional services team provides hands-on execution for Facebook and Instagram Ads Management, AI Image and Flyer Creation, AI Video Creation, Landing Page Design, and Video Sales Letter (VSL) Design.'
    },
    {
      q: 'Can we combine multiple professional services?',
      a: 'Yes. You can select multiple services in a single project brief (for example, combining Meta Ads Management with Landing Page Design and AI Video Creation). You will submit one consolidated request and receive a single project reference.'
    },
    {
      q: 'How does the partner consultation process work?',
      a: 'After you submit your project brief, our system generates a unique reference code and assigns a vetted specialist partner to review your scope. Once assigned, you can connect directly on our official WhatsApp contact to review deliverables, agree on timelines, and receive a formal commercial proposal.'
    },
    {
      q: 'Does CloseCraft train sales teams?',
      a: 'Yes. Through the Digital Sales School (DSS), we provide practical training in appointment setting, lead qualification, discovery conversations, objection handling, and high-ticket closing. We offer both individual sprints and customized team training.'
    },
    {
      q: 'How do we get started?',
      a: 'If you want to organise your follow-up process and manage enquiries, start with our 7-day no-card Starter trial or complete our short follow-up diagnostic. If you need advertising or creative services, simply choose your services in the catalogue and submit a project brief.'
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#080808] border-t border-[#1f1f1f] scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <HelpCircle size={12} />
            <span>ANSWERS &amp; DETAILS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#a1a1aa]">
            Everything you need to know about our software, professional services, and sales education.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-[#101010] border border-[#1f1f1f] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#151515] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-white">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#71717a] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#45bfae]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-[#a1a1aa] leading-relaxed border-t border-[#1f1f1f]/60 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
