'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { trackConversionEvent } from '@/lib/analytics/events';

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    serviceInterest: 'Revenue Engine Software',
    message: '',
  });

  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      business: formData.business.trim(),
      serviceInterest: formData.serviceInterest,
      needDescription: formData.message.trim(),
      formType: 'GENERAL_INQUIRY',
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to deliver your message. Please try again or email us directly.');
      }

      // Track conversion event
      trackConversionEvent('inquiry_submitted', {
        interest: formData.serviceInterest,
        business: formData.business,
      });

      setSuccessMessage('Thank you. Your message has been routed to our solutions team. We will review your enquiry and get back to you within 2 business hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        business: '',
        serviceInterest: 'Revenue Engine Software',
        message: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while transmitting your request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0E] text-white selection:bg-[#248277] selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#070A0E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" aria-label="Closecraft Home">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/pricing"
              className="text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/about"
              className="text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/early-access"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Channels & Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/10 border border-[#248277]/30 text-[#45bfae] text-xs font-semibold uppercase tracking-wider">
                <MessageSquare size={13} />
                <span>Direct Access</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Get In Touch With The CloseCraft Team
              </h1>
              <p className="text-xs sm:text-sm text-[#8A9CAE] leading-relaxed">
                Whether you want to explore managed sales outsourcing, evaluate our software for your team, or enquire about Digital Sales School cohorts—we are here to help.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0B1117] border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-[#248277]/10 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Sales & Enterprise Proposals</h3>
                  <a href="mailto:sales@closecrafthq.com" className="text-xs text-[#45bfae] hover:underline">
                    sales@closecrafthq.com
                  </a>
                  <p className="text-[11px] text-[#8A9CAE] mt-0.5">For corporate contracts, demos, and managed retainers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0B1117] border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-[#248277]/10 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Telephone / WhatsApp</h3>
                  <a href="tel:+2348000000000" className="text-xs text-white hover:text-[#45bfae] transition-colors">
                    +234 800 000 0000
                  </a>
                  <p className="text-[11px] text-[#8A9CAE] mt-0.5">Mon–Fri: 8:00 AM – 6:00 PM (WAT)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0B1117] border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-[#248277]/10 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Operating Entity</h3>
                  <p className="text-xs text-[#A7B7C7]">Zeerocodes Automation Limited</p>
                  <p className="text-[11px] text-[#8A9CAE] mt-0.5">Lagos, Nigeria</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0B1117] border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-[#248277]/10 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Guaranteed Response SLA</h3>
                  <p className="text-xs text-[#A7B7C7]">Within 2 business hours</p>
                  <p className="text-[11px] text-[#8A9CAE] mt-0.5">We practice the speed-to-lead discipline we build into our software.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1117] border border-white/10 shadow-2xl space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Send Us a Direct Message</h2>
                <p className="text-xs text-[#8A9CAE] mt-1">
                  Tell us about your business, lead volume, and goals. We will prepare relevant material before reaching out.
                </p>
              </div>

              {successMessage && (
                <div className="p-4 rounded-2xl bg-[#248277]/15 border border-[#248277]/40 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#45bfae] shrink-0 mt-0.5" />
                  <p className="text-xs text-white leading-relaxed">{successMessage}</p>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                  <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300 leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Samuel Adebayo"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#6A7B8C] focus:outline-none focus:border-[#45bfae] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="samuel@company.com"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#6A7B8C] focus:outline-none focus:border-[#45bfae] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Company / Business Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      placeholder="e.g. Nexus Capital Group"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#6A7B8C] focus:outline-none focus:border-[#45bfae] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7B7C7]">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#6A7B8C] focus:outline-none focus:border-[#45bfae] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7B7C7]">Primary Area of Interest</label>
                  <select
                    value={formData.serviceInterest}
                    onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs focus:outline-none focus:border-[#45bfae] transition-colors"
                  >
                    <option value="Revenue Engine Software">Revenue Engine SaaS Platform</option>
                    <option value="Managed Sales Outsourcing">Managed Sales Outsourcing (Setters & Closers)</option>
                    <option value="Lead Generation (Meta Ads)">Lead Generation (Meta & Google Ads)</option>
                    <option value="Digital Sales School">Digital Sales School (Training / Hiring)</option>
                    <option value="Partnership / Affiliate">Affiliate & Partner Network</option>
                    <option value="General Question">General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7B7C7]">How Can We Help You? *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe your business model, current monthly enquiries, or sales team requirements..."
                    className="w-full p-3.5 rounded-xl bg-[#111C26] border border-white/10 text-white text-xs placeholder:text-[#6A7B8C] focus:outline-none focus:border-[#45bfae] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <Send size={15} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#6A7B8C] text-center pt-1">
                  Your information is handled strictly under our <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>. No spam, ever.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
