"use client";

import React, { useState } from 'react';
import { ArrowRight, Calendar, Download } from 'lucide-react';
import { submitClinicRegistration } from './actions';

export default function DSSClinicPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-300 flex flex-col items-center justify-center p-6">
        <div className="bg-[#161b22] p-12 rounded-2xl border border-white/5 max-w-lg text-center">
          <Download className="w-16 h-16 text-[#2ea043] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Registration Confirmed</h2>
          <p className="text-gray-400 mb-8">
            Thank you! You are registered for the DSS free sales clinic. We've emailed you the Ten Enquiry Sales Audit worksheet and the joining link.
          </p>
          <a href="/downloads/Ten_Enquiry_Sales_Audit.pdf" className="text-[#2ea043] font-bold hover:underline">
            Download the Free Worksheet Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 flex flex-col pt-12 pb-24 font-sans">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 flex flex-col items-center">
        
        <div className="text-center mb-12">
          <div className="text-[#2ea043] font-bold text-xs uppercase tracking-widest mb-6">
            Free Live Clinic
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 font-serif">
            They asked for your price and went quiet.
          </h1>
          <p className="text-lg text-gray-400 mb-4">
            Bring one sales conversation you want to handle better. In this free sixty-minute DSS clinic, we will review a simple enquiry audit and practise a question that helps you understand what the buyer still needs.
          </p>
          <p className="text-lg text-gray-400">
            You will leave with a worksheet and one behaviour to test.
          </p>
        </div>

        <div className="bg-[#161b22] p-8 rounded-2xl border border-white/5 w-full">
          <form className="space-y-8" action={async (formData) => {
            const res = await submitClinicRegistration(formData);
            if (res.success) setSubmitted(true);
          }}>
            
            <div>
              <label className="block text-sm font-bold text-white mb-2">Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Email Address <span className="text-red-500">*</span></label>
              <input type="email" name="email" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Chosen Session <span className="text-red-500">*</span></label>
              <select name="session" required className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none">
                <option value="">Select a session...</option>
                <option value="Wednesday 14 October, 7 pm WAT">Wednesday 14 October, 7 pm WAT</option>
                <option value="Saturday 24 October, 11 am WAT">Saturday 24 October, 11 am WAT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">One anonymised sales question <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">Please remove customer names and private details.</p>
              <textarea name="question" required rows={3} className="w-full p-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none"></textarea>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="wantReminders" className="mt-1 w-4 h-4 text-[#2ea043] bg-[#0d1117] border-white/20 rounded focus:ring-[#2ea043]" />
                <span className="text-sm text-gray-300">
                  I would like optional WhatsApp reminders for this clinic.
                </span>
              </label>
              <div className="pl-7">
                 <input type="tel" name="phone" placeholder="Phone number (optional)" className="w-full h-11 px-3 rounded-lg bg-[#0d1117] text-white border border-white/10 focus:border-[#2ea043] focus:outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full h-14 bg-[#2ea043] hover:bg-[#3fb950] text-white font-bold rounded-lg mt-8 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#2ea043]/20">
              Register & Get Worksheet <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
