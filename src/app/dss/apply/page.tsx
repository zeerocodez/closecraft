"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { submitDSSApplication } from './actions';

export default function DSSApplyPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-300 flex flex-col items-center justify-center p-6">
        <div className="bg-[#161b22] p-12 rounded-2xl border border-white/5 max-w-lg text-center">
          <ShieldCheck className="w-16 h-16 text-[#2ea043] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Application Received</h2>
          <p className="text-gray-400 mb-8">
            Thank you. We aim to respond within two working days while admissions are open. Please do not transfer money until you have an admission decision and official invoice.
          </p>
          <Link href="/dss" className="text-[#2ea043] font-bold hover:underline">
            Return to Digital Sales School
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 flex flex-col pt-12 pb-24 font-sans">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 flex flex-col items-center">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 font-serif">
            Digital Sales School November Application
          </h1>
          <p className="text-lg text-gray-400">
            Tell us what you want to improve and whether the schedule works for you. This form requests a fit review; it does not reserve a paid place. Tuition is ₦80,000. Read the full offer at <Link href="/dss" className="text-[#2ea043] hover:underline">the landing page</Link> before submitting.
          </p>
        </div>

        <div className="bg-[#161b22] p-8 rounded-2xl border border-white/5 w-full">
          <form className="space-y-8" action={async (formData) => {
            const res = await submitDSSApplication(formData);
            if (res.success) setSubmitted(true);
          }}>
            
            {/* 1 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">1. Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none" />
            </div>

            {/* 2 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">2. Email Address <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">Use this for admission messages.</p>
              <input type="email" name="email" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none" />
            </div>

            {/* 3 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">3. Phone number and preferred contact route <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">Choosing a route does not authorize unrelated marketing.</p>
              <div className="flex gap-4 mb-3">
                <input type="tel" name="phone" required placeholder="Phone number" className="flex-1 h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none" />
                <select name="contactRoute" required className="h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                  <option value="">Contact via...</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            {/* 4 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">4. Which best describes your current work? <span className="text-red-500">*</span></label>
              <select name="role" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                <option value="">Select role...</option>
                <option>Business Owner</option>
                <option>Tech Founder</option>
                <option>Founder building with AI tools</option>
                <option>Service Provider</option>
                <option>Salesperson</option>
                <option>Aspiring Sales Professional</option>
                <option>Other</option>
              </select>
            </div>

            {/* 5 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">5. What offer do you sell, or what sales role are you preparing for? <span className="text-red-500">*</span></label>
              <textarea name="offer" required rows={3} className="w-full p-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none" placeholder="A business link is optional."></textarea>
            </div>

            {/* 6 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">6. Describe one recent sales conversation you found difficult. <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">Please remove customer names and private details.</p>
              <textarea name="difficultConv" required rows={3} className="w-full p-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none"></textarea>
            </div>

            {/* 7 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">7. What would you like to handle better after the programme? <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">Ask for a skill or behaviour, rather than an earnings target alone.</p>
              <textarea name="handleBetter" required rows={3} className="w-full p-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none"></textarea>
            </div>

            {/* 8 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">8. Can you attend Monday and Wednesday classes from 7 pm to 8.30 pm WAT, from 9 November to 30 December? <span className="text-red-500">*</span></label>
              <select name="schedule" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                <option value="">Select answer...</option>
                <option>Yes</option>
                <option>I need to discuss a conflict</option>
                <option>No</option>
              </select>
            </div>

            {/* 9 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">9. Can you allow about two additional hours weekly for exercises, with adequate data and laptop access? <span className="text-red-500">*</span></label>
              <select name="access" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                <option value="">Select answer...</option>
                <option>Yes</option>
                <option>I need to discuss access or time</option>
              </select>
            </div>

            {/* 10 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">10. Who will approve and pay for your place? <span className="text-red-500">*</span></label>
              <select name="approver" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                <option value="">Select answer...</option>
                <option>I will</option>
                <option>My business will</option>
                <option>An employer or another sponsor will</option>
                <option>Approval is still undecided</option>
              </select>
            </div>

            {/* 11 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">11. Which payment arrangement would you like us to review? <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">This is not a credit application or a commitment to pay.</p>
              <select name="payment" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                <option value="">Select answer...</option>
                <option>Full ₦80,000</option>
                <option>Approved ₦56,000 + ₦24,000 arrangement</option>
                <option>I need to discuss whether either is workable</option>
              </select>
            </div>

            {/* 12 */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">12. Would you like a short fit call? <span className="text-red-500">*</span></label>
              <select name="fitCall" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                <option value="">Select answer...</option>
                <option>Yes, through booking link</option>
                <option>Please review by my selected contact route first</option>
              </select>
            </div>

            {/* 13 & 14 */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="readSchedule" required className="mt-1 w-4 h-4 text-[#2ea043] bg-[#0d1117] border-white/20 rounded focus:ring-[#2ea043]" />
                <span className="text-sm text-gray-300">I have read the programme schedule and understand that employment and internship selection are separate from tuition. <span className="text-red-500">*</span></span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="wantReminders" className="mt-1 w-4 h-4 text-[#2ea043] bg-[#0d1117] border-white/20 rounded focus:ring-[#2ea043]" />
                <span className="text-sm text-gray-300">
                  I would like WhatsApp programme reminders and future DSS updates. 
                  <span className="block text-xs text-gray-500 mt-1">You can stop these updates by replying STOP. Your choice does not affect your application.</span>
                </span>
              </label>
            </div>

            <button type="submit" className="w-full h-14 bg-[#2ea043] hover:bg-[#3fb950] text-white font-bold rounded-lg mt-8 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#2ea043]/20">
              Submit Request for Fit Review <ArrowRight size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
