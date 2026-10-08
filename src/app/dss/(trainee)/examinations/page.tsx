import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ShieldCheck, Lock, Award, BrainCircuit, ArrowRight } from 'lucide-react';

export default async function ExaminationsPage() {
  const session = await auth();
  const orgId = (session as any)?.organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;
  
  if (!organizationId || !session?.user?.id) {
    return <div>Error: Unable to load examination portal.</div>;
  }

  // Check how many modules exist vs how many are completed
  const totalModules = await db.module.count({ where: { organizationId } });
  const completedModules = await db.moduleProgress.count({
    where: { studentId: session.user.id, status: 'COMPLETED' }
  });

  const isEligible = totalModules > 0 && completedModules >= totalModules;

  return (
    <div className="max-w-5xl mx-auto w-full p-8 md:p-12 relative">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-4">
          <BrainCircuit size={14} /> AI Assessor Portal
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
          Certification Exams
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          The final proving ground. Complete all required modules to unlock your live AI-graded assessment and earn your verified digital credential.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Certification Exam Card */}
        <div className={`relative overflow-hidden rounded-2xl p-8 border ${isEligible ? 'bg-[#121c1a] border-[#248277]/50 shadow-[0_0_40px_rgba(36,130,119,0.15)]' : 'bg-[#0a0d12] border-white/10 opacity-80'} transition-all`}>
          {!isEligible && (
            <div className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-gray-500 mb-4 shadow-xl">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-white text-xl mb-2">Assessment Locked</h3>
              <p className="text-gray-400 text-sm max-w-sm">
                You must complete all {totalModules} modules before taking the final certification exam. Currently completed: {completedModules}.
              </p>
            </div>
          )}
          
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae]">
              <Award size={28} />
            </div>
            <span className="px-3 py-1 bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-[10px] rounded-full border border-white/10">
              High Stakes
            </span>
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-white mb-3">Certified Digital Sales Professional</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            A comprehensive 45-minute AI roleplay assessment. You will be evaluated on discovery frameworks, MEDDPICC qualification, objection handling, and closing velocity. 
          </p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <ShieldCheck size={16} className="text-[#45bfae]" /> AI-Graded in Real Time
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <ShieldCheck size={16} className="text-[#45bfae]" /> Requires 85% Passing Score
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <ShieldCheck size={16} className="text-[#45bfae]" /> Grants Verifiable DSS Credential
            </div>
          </div>
          
          <button 
            disabled={!isEligible}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isEligible 
              ? 'bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] shadow-lg hover:shadow-[0_0_20px_rgba(69,191,174,0.3)]' 
              : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            Start Final Assessment <ArrowRight size={18} />
          </button>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#121c1a] border border-[#248277]/20 p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-2">How AI Grading Works</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              The AI Assessor uses a specialized grading rubric formulated by top enterprise sales directors. It analyzes your transcript for key buying signals, tone, and strict adherence to the MEDDPICC framework.
            </p>
          </div>
          
          <div className="bg-[#0a0d12] border border-white/5 p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-2">Retake Policy</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              If you fail to achieve the required 85% benchmark, you will be placed in a 48-hour cooldown period before you can attempt the certification again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
