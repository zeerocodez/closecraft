import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Calendar, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';

export default function DSSPublicLanding() {
 return (
 <div className="min-h-screen bg-[#0d1117] text-gray-300 relative overflow-hidden font-sans">
 
 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

 <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-6 md:px-12">
 <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-[#2ea043] flex items-center justify-center text-white font-bold">
 <ShieldCheck size={24} />
 </div>
 <div>
 <span className="font-bold text-white tracking-tight block leading-tight">Zeerocodes DSS</span>
 <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Digital Sales School</span>
 </div>
 </div>
 <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
 <Link href="/dss/apply" className="hover:text-white transition-colors">Apply Now</Link>
 <Link href="/login" className="hover:text-white transition-colors">Student Login</Link>
 </div>
 </div>
 </header>

 <main>
 <section className="relative pt-32 pb-24 px-6 max-w-4xl mx-auto">
 <div className="text-[#2ea043] font-bold text-xs uppercase tracking-widest mb-6">
 Founding Cohort - 8 Weeks
 </div>
 <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight font-serif leading-tight">
 Improve how you move a sales conversation towards payment
 </h1>
 <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
 You have built a product or know how to deliver your service. The difficult part can come when a prospect asks for your price, requests a proposal or says, "Let me get back to you."
 </p>
 <p className="text-lg text-gray-400 mb-12 leading-relaxed">
 Digital Sales School helps Nigerian founders and professionals practise those conversations. Over eight teaching weeks, you will work with your own offer or a defined simulation. You will receive feedback on submitted exercises and complete an observed practical assessment.
 </p>
 
 <div className="bg-[#161b22] border border-white/10 rounded-xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
 <div>
 <h3 className="text-white font-bold text-xl mb-2">Tuition & Schedule</h3>
 <p className="text-gray-400 text-sm">₦80,000 total. Starts November 9.</p>
 </div>
 <Link href="/dss/apply" className="px-8 py-4 bg-[#2ea043] hover:bg-[#3fb950] text-white rounded-lg font-bold transition-all shadow-lg shadow-[#2ea043]/20 w-full sm:w-auto text-center">
 Apply for Fit Review
 </Link>
 </div>
 </section>

 <section className="py-24 px-6 border-t border-white/5 bg-[#161b22]">
 <div className="max-w-4xl mx-auto">
 <h2 className="text-3xl font-bold text-white mb-6 font-serif">What you will work on</h2>
 <p className="text-gray-400 mb-12 text-lg leading-relaxed">
 You will explain an offer without overstating what it can do, research a relevant buyer and practise booking a useful appointment. Discovery exercises help you understand the buyer's need before quoting. Later work covers proposals, objections and accurate follow-up records.
 </p>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
 <div className="bg-[#0d1117] p-6 rounded-xl border border-white/5">
 <CheckCircle className="text-[#2ea043] mb-4" size={24} />
 <h4 className="text-white font-bold mb-2">Submitted Work</h4>
 <p className="text-sm text-gray-400">Each learner submits defined practical work. The trainer gives correction against the published rubric, with experienced assessment support.</p>
 </div>
 <div className="bg-[#0d1117] p-6 rounded-xl border border-white/5">
 <CheckCircle className="text-[#2ea043] mb-4" size={24} />
 <h4 className="text-white font-bold mb-2">Simulations</h4>
 <p className="text-sm text-gray-400">Aspiring appointment setters and closers can use the programme's simulations to practise the work if they don't have a live offer.</p>
 </div>
 </div>

 <h3 className="text-2xl font-bold text-white mb-8 font-serif">The weekly programme</h3>
 <div className="space-y-4">
 {[
 { week: 1, title: 'Sales conduct and offer understanding', task: 'Explain an assigned or approved offer accurately' },
 { week: 2, title: 'Buyer research and qualification', task: 'A justified buyer profile' },
 { week: 3, title: 'Outreach and appointment setting', task: 'A scored meeting-booking role-play' },
 { week: 4, title: 'Discovery', task: 'An observed buyer conversation' },
 { week: 5, title: 'Value and proposals', task: 'A proposal matched to an agreed need' },
 { week: 6, title: 'Objections and authorised negotiation', task: 'A scored case within price limits' },
 { week: 7, title: 'Follow-up and sales records', task: 'Complete opportunity records' },
 { week: 8, title: 'Integrated selling practice', task: 'The final observed simulation' },
 ].map((w) => (
 <div key={w.week} className="flex items-start gap-4 p-4 border border-white/5 rounded-lg bg-[#0d1117]">
 <div className="w-12 h-12 shrink-0 rounded bg-[#2ea043]/10 flex items-center justify-center text-[#2ea043] font-bold">W{w.week}</div>
 <div>
 <h4 className="text-white font-bold">{w.title}</h4>
 <p className="text-sm text-gray-400 mt-1">{w.task}</p>
 </div>
 </div>
 ))}
 </div>
 
 <div className="mt-8 p-6 bg-[#2ea043]/5 border border-[#2ea043]/20 rounded-xl">
 <p className="text-sm text-gray-300">
 You need three live hours weekly and about two hours for exercises. The schedule includes 21, 23, 28 and 30 December. Classes take place online. We will discuss access needs during your fit review.
 </p>
 </div>
 </div>
 </section>

 <section className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
 <h2 className="text-3xl font-bold text-white mb-6 font-serif">Tuition and Admission</h2>
 <p className="text-gray-400 text-lg mb-8">
 Pay ₦80,000 in full or request the approved installment option of ₦56,000 before start and ₦24,000 before teaching Week 5. The total fee is the same.
 </p>
 <ul className="space-y-4 text-gray-400 mb-12 list-disc pl-6">
 <li>Admission steps and opening payments close at 12 noon WAT on 30 October.</li>
 <li>Graduation requires at least 80% attendance and a practical assessment score of 80 out of 100.</li>
 <li>The certificate records DSS's own assessment. It does not imply external accreditation.</li>
 </ul>
 <div className="text-center">
 <Link href="/dss/apply" className="inline-block px-8 py-4 bg-[#2ea043] hover:bg-[#3fb950] text-white rounded-lg font-bold transition-all shadow-lg shadow-[#2ea043]/20">
 Apply for a Fit Review
 </Link>
 <p className="text-xs text-gray-500 mt-4">Application is free. We will check your goal and schedule before asking for payment.</p>
 </div>
 </section>

 </main>
 
 <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5">
 © {new Date().getFullYear()} Zeerocodes Automation Limited. All rights reserved.
 </footer>
 </div>
 );
}
