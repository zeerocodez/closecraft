import React from 'react';
import Link from 'next/link';
import { ShieldCheck, BrainCircuit, Activity, Award, UserPlus, LogIn, ChevronRight } from 'lucide-react';

export default function DSSPublicLanding() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 relative overflow-hidden font-sans">
      
      {/* Abstract Background Pattern (Subtle grid/icons effect) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2ea043] flex items-center justify-center text-white font-bold">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight block leading-tight">Zeerocodes DSS</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Learning Management System</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="/dss/dashboard" className="hover:text-white transition-colors">Browse Courses</Link>
            <Link href="/dss/verify" className="hover:text-white transition-colors">Verify a Certificate</Link>
            <Link href="/login" className="hover:text-white transition-colors">Staff Login</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 px-6 text-center max-w-4xl mx-auto">
          <div className="text-[#2ea043] font-bold text-xs uppercase tracking-widest mb-6">
            Africa's Premier Digital Sales Academy
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight font-serif" style={{ lineHeight: 1.1 }}>
            Courses that end in a certificate anyone can verify.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Zeerocodes DSS trains Africa's next elite sales workforce — B2B Closing, Appointment Setting, Revenue Operations, and more — through structured courses, AI-graded roleplays, and personalized feedback after every attempt. Finish a course, and you walk away with a real, publicly verifiable credential.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dss/dashboard" className="px-8 py-4 bg-[#2ea043] hover:bg-[#3fb950] text-white rounded-lg font-bold transition-all shadow-lg shadow-[#2ea043]/20 w-full sm:w-auto">
              Browse Courses
            </Link>
            <Link href="/dss/verify" className="px-8 py-4 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-white rounded-lg font-bold transition-all w-full sm:w-auto">
              Verify a Certificate
            </Link>
          </div>
        </section>

        {/* Value Props Grid */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#161b22] p-8 rounded-2xl border border-white/5 hover:border-[#2ea043]/30 transition-colors">
              <h3 className="text-xl font-bold text-[#2ea043] mb-4">Structured Courses</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Modules and lessons that unlock as you complete them — progress that's earned, not just watched.
              </p>
            </div>

            <div className="bg-[#161b22] p-8 rounded-2xl border border-white/5 hover:border-[#2ea043]/30 transition-colors">
              <h3 className="text-xl font-bold text-[#2ea043] mb-4">AI-Graded Assessments</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Bank-backed, randomized questions and live AI roleplay scenarios with fair, instant grading every time.
              </p>
            </div>

            <div className="bg-[#161b22] p-8 rounded-2xl border border-white/5 hover:border-[#2ea043]/30 transition-colors">
              <h3 className="text-xl font-bold text-[#2ea043] mb-4">Personalized Feedback</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                After every assessment, AI analyzes your strengths and what to review next to hit your quotas.
              </p>
            </div>

            <div className="bg-[#161b22] p-8 rounded-2xl border border-white/5 hover:border-[#2ea043]/30 transition-colors">
              <h3 className="text-xl font-bold text-[#2ea043] mb-4">Verified Certificates</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Earn a real credential the moment you finish, with a public link anyone can check.
              </p>
            </div>

          </div>
        </section>

        {/* Start Where You Are */}
        <section className="py-32 px-6 text-center max-w-3xl mx-auto border-t border-white/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full bg-[#161b22] border border-white/5 flex items-center justify-center">
              <BrainCircuit className="text-[#2ea043]" size={32} />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 font-serif">Start where you are.</h2>
          <p className="text-gray-400 mb-12 text-lg">
            Browse what's available now, or sign in if you've already started a course.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/dss/dashboard" className="px-8 py-4 bg-[#2ea043] hover:bg-[#3fb950] text-white rounded-lg font-bold transition-all shadow-lg shadow-[#2ea043]/20 flex items-center gap-2">
              <UserPlus size={20} /> Create an Account
            </Link>
            <Link href="/login" className="px-8 py-4 bg-transparent text-[#2ea043] hover:text-[#3fb950] font-bold transition-all flex items-center gap-2">
              <LogIn size={20} /> Sign In
            </Link>
          </div>
        </section>

        {/* Certificate Section */}
        <section className="py-24 px-6 border-t border-white/5 bg-[#161b22]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="w-48 h-48 mx-auto md:mx-0 relative">
                {/* Decorative Laurel Wreath / Certificate Icon */}
                <div className="absolute inset-0 border-4 border-[#2ea043] rounded-full opacity-20"></div>
                <div className="absolute inset-4 border-2 border-dashed border-[#2ea043] rounded-full opacity-40 animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award size={64} className="text-[#2ea043]" />
                </div>
              </div>
            </div>
            <div className="flex-[2]">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
                A credential that holds up outside the Academy, too.
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Every certificate gets a unique code and a public verification page — no login required. Anyone who wants to confirm a credential is genuine, an employer, a client, anyone, can check it in seconds.
              </p>
              <Link href="/dss/verify" className="inline-flex items-center gap-2 text-[#2ea043] font-bold hover:text-[#3fb950] group">
                Verify a certificate <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

      </main>
      
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5">
        © {new Date().getFullYear()} Zeerocodes Automation Limited. All rights reserved.
      </footer>
    </div>
  );
}
