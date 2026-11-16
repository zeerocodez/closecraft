import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { 
  ShieldCheck, 
  Lock, 
  Award, 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileCheck,
  UserCheck
} from 'lucide-react';

export const metadata = {
  title: 'Certification Exams & AI Assessor | Digital Sales School',
  description: 'High-stakes AI roleplay examination and verified digital credentials for sales professionals.',
};

export default async function ExaminationsPage() {
  const session = await auth();
  const orgId = (session as any)?.organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;
  const studentId = session?.user?.id;
  
  if (!organizationId || !studentId) {
    return <div className="p-8 text-center text-gray-400">Error: Unable to load examination portal.</div>;
  }

  // Check how many modules exist vs how many are completed
  const totalModules = await db.module.count({ where: { organizationId } });
  const completedModules = await db.moduleProgress.count({
    where: { studentId, status: 'COMPLETED' }
  });

  const isEligible = totalModules > 0 && completedModules >= totalModules;

  // Check if student already passed the capstone drill or exam
  const capstoneSession = await (db as any).practiceSession.findFirst({
    where: {
      userId: studentId,
      scenario: { isCapstone: true }
    },
    include: {
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const capstoneEval = capstoneSession?.evaluations?.[0];
  const isPassed = Boolean(capstoneEval?.passedThreshold);

  return (
    <div className="max-w-5xl mx-auto w-full p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="border-b border-white/5 pb-8">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-3">
          <BrainCircuit size={14} /> AI Assessor & Credentialing
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
          Certification Examinations
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
          The final proving ground. Complete all required curriculum workshops to unlock your live AI-graded assessment and earn your verified digital credential.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Certification Exam Card */}
        <div className={`relative overflow-hidden rounded-2xl p-6 md:p-8 border transition-all ${
          isEligible 
            ? 'bg-[#121c1a] border-[#248277]/50 shadow-[0_0_40px_rgba(36,130,119,0.15)]' 
            : 'bg-[#0a0d12] border-white/10 opacity-80'
        }`}>
          {!isEligible && (
            <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-gray-400 mb-4 shadow-xl">
                <Lock size={22} />
              </div>
              <h3 className="font-serif font-bold text-white text-lg mb-2">Assessment Locked</h3>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                You must complete all {totalModules} curriculum modules before taking the final certification exam. Currently completed: {completedModules} of {totalModules}.
              </p>
              <Link
                href="/dss/courses"
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors"
              >
                Resume Learning &rarr;
              </Link>
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
          
          <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-3">
            Certified Digital Sales Professional (CDSP)
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mb-6 leading-relaxed">
            A comprehensive multi-turn live AI roleplay assessment. Evaluated across discovery frameworks, MEDDPICC qualification, objection diagnosis, and closing velocity.
          </p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
              <ShieldCheck size={16} className="text-[#45bfae]" /> AI-Graded in Real Time (8 Rubrics)
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
              <ShieldCheck size={16} className="text-[#45bfae]" /> Requires 12/16 Passing Score
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
              <UserCheck size={16} className="text-[#45bfae]" /> Authoritative Faculty Review & Oversight
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
              <FileCheck size={16} className="text-[#45bfae]" /> Generates Verifiable DSS Public Credential
            </div>
          </div>
          
          {isPassed ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} /> Certified & Verified
              </div>
              <p className="text-xs text-gray-300">
                You passed your capstone assessment with a score of {capstoneEval?.totalScore}/16 pts.
              </p>
              <Link
                href="/dss/certificates"
                className="inline-block mt-2 px-5 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                View Credential in Vault &rarr;
              </Link>
            </div>
          ) : (
            <Link
              href={isEligible ? "/dss/roleplay?sprint=4" : "#"}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                isEligible 
                  ? 'bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] shadow-lg hover:shadow-[0_0_20px_rgba(69,191,174,0.3)]' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <span>Start Final AI Assessment</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {/* Info & Rubric Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#121c1a] border border-[#248277]/20 p-6 rounded-2xl space-y-3">
            <h3 className="font-serif font-bold text-white text-base">How AI Assessor Works</h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              The AI Assessor evaluates your conversation dynamically against an 8-criterion rubric formulated by experienced revenue leaders. It analyzes your messages for offer accuracy, diagnostic questions, active listening, and objection composure without bias.
            </p>
          </div>
          
          <div className="bg-[#0a0d12] border border-white/5 p-6 rounded-2xl space-y-3">
            <h3 className="font-serif font-bold text-white text-base">Authoritative Human Oversight</h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              In accordance with DSS quality standards, high-stakes certifications are reviewed and endorsed by human faculty. The AI provides fast, unvarnished scoring; human trainers verify edge-case evidence before issuing official credentials.
            </p>
          </div>

          <div className="bg-[#0a0d12] border border-white/5 p-6 rounded-2xl space-y-3">
            <h3 className="font-serif font-bold text-white text-base">Verifiable Digital Badging</h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              Upon passing, a cryptographic credential record is created at <code className="text-[#45bfae]">/dss/verify/[code]</code>, allowing potential hiring partners, remote sales agencies, and SaaS founders to independently verify your competence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
