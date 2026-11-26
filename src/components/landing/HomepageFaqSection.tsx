'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { HOMEPAGE_FAQS as IMPORTED_FAQS, HomepageFaqItem } from '@/lib/data/homepage-faqs';

export type { HomepageFaqItem };

export const HOMEPAGE_FAQS: HomepageFaqItem[] = IMPORTED_FAQS;

export default function HomepageFaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const faqs = HOMEPAGE_FAQS;

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

