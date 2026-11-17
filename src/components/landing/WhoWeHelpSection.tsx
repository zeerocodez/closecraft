'use client';

import React from 'react';
import { 
  Megaphone, 
  MessageSquare, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  ShoppingBag, 
  Cpu, 
  TrendingUp, 
  Users 
} from 'lucide-react';

export default function WhoWeHelpSection() {
  const categories = [
    {
      title: 'Meta Advertisers',
      description: 'Businesses spending money on Facebook & Instagram ads that need leads followed up before they cool down.',
      icon: <Megaphone className="w-5 h-5 text-blue-400" />
    },
    {
      title: 'WhatsApp & Social Sellers',
      description: 'Companies receiving dozens of daily enquiries across WhatsApp, Instagram DMs, and Facebook Messenger.',
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Service Businesses with Reps',
      description: 'Agencies, consultancies, and B2B providers managing teams of sales setters and closers.',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />
    },
    {
      title: 'Real Estate & Property',
      description: 'Developers and brokers handling high-ticket buyer enquiries, site visits, and multi-week follow-up cycles.',
      icon: <Building2 className="w-5 h-5 text-purple-400" />
    },
    {
      title: 'Education & Training Institutes',
      description: 'Academies, certification schools, and bootcamps managing student enquiries, admissions, and tuition follow-up.',
      icon: <GraduationCap className="w-5 h-5 text-cyan-400" />
    },
    {
      title: 'High-Value E-Commerce',
      description: 'Merchants selling higher-order products where customers ask questions before committing to purchase.',
      icon: <ShoppingBag className="w-5 h-5 text-rose-400" />
    },
    {
      title: 'Tech & Professional Services',
      description: 'SaaS companies, fintechs, and technical providers running discovery calls and commercial proposals.',
      icon: <Cpu className="w-5 h-5 text-[#45bfae]" />
    },
    {
      title: 'Growing Sales Teams',
      description: 'Businesses outgrowing spreadsheets that need a repeatable, accountable process for managing opportunities.',
      icon: <TrendingUp className="w-5 h-5 text-indigo-400" />
    }
  ];

  return (
    <section className="py-24 bg-[#080808] border-t border-[#1f1f1f] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#248277]/40 text-[#45bfae] text-xs font-bold uppercase tracking-wider">
            <Users size={12} />
            <span>WHO WE HELP</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Built for Businesses That Cannot Afford to Keep Losing Opportunities.
          </h2>

          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            CloseCraft is engineered for businesses that generate customer interest through advertising, websites, WhatsApp and social media, and need an organised system to ensure every enquiry receives consistent follow-up.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/50 transition-all space-y-3 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#181818] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#45bfae] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

