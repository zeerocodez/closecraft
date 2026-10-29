import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, Lock, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LaunchDrillButton from '@/components/practice/LaunchDrillButton';
import { Logo } from '@/components/ui/Logo';

export default async function ModuleAssessmentPage({
  params,
}: {
  params: { slug?: string; moduleId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const studentId = session.user.id;

  const moduleData = await db.module.findUnique({
    where: { id: params.moduleId },
    include: {
      lessons: { orderBy: { orderIndex: 'asc' } },
      progress: { where: { studentId } },
      course: true,
    },
  });

  // Workshop number mapped from module
  const workshopNum = moduleData ? (moduleData.orderIndex % 12) + 1 : 4;
  const scenario = await (db as any).practiceScenario.findFirst({
    where: { workshopNumber: workshopNum },
  }) || await (db as any).practiceScenario.findFirst();

  // Find recent attempt on this scenario
  const recentSession = scenario ? await (db as any).practiceSession.findFirst({
    where: {
      userId: studentId,
      scenarioId: scenario.id,
    },
    include: {
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { criterionScores: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  }) : null;

  const latestEval = recentSession?.evaluations?.[0];

  return (
    <div className="max-w-6xl mx-auto w-full p-8 md:p-12 relative space-y-8">
      <div>
        <Link 
          href={moduleData?.course?.slug ? `/dss/courses/${moduleData.course.slug}` : '/dss/courses'} 
          className="text-[#45bfae] hover:text-[#5cd4c3] text-sm font-bold flex items-center gap-2 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Course Curriculum
        </Link>
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-4">
          <BookOpen size={14} /> Module Assessment • Workshop {workshopNum}
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
          {scenario?.title || 'Objection Handling Roleplay Simulation'}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {scenario?.studentBrief || 'Demonstrate practical competence in multi-turn sales simulation. Evaluated on the 8-criterion DSS rubric before unlocking advanced modules.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Live Simulation Launch Hub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#248277]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#45bfae]/20 flex items-center justify-center text-[#45bfae]">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      Buyer Persona: {scenario?.buyerPersona?.name || 'Prospect'}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {scenario?.buyerPersona?.title || 'Decision Maker'} • {scenario?.buyerPersona?.company || 'Enterprise'}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-[#248277]/20 text-[#45bfae] border border-[#248277]/30 text-xs font-bold uppercase tracking-wider rounded-md">
                  Active Simulation Engine
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">Simulation Brief</div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {scenario?.studentBrief || 'Handle customer objections effectively without unapproved discounts.'}
                </p>
              </div>

              {latestEval && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Latest Demonstrated Score:</div>
                    <div className={`text-xl font-bold font-mono ${latestEval.passed ? 'text-[#45bfae]' : 'text-amber-400'}`}>
                      {latestEval.totalScore}/16 pts ({latestEval.passed ? 'PASSED' : 'NEEDS PRACTICE'})
                    </div>
                  </div>
                  <Link
                    href={`/dss/roleplay/review/${recentSession.id}`}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-bold transition-colors"
                  >
                    View Rubric Breakdown &rarr;
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-white/5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Logo variant="icon" size="xs" />
                <span>Powered by <strong>Closecraft Enablement Engine</strong></span>
              </div>

              {scenario && (
                <LaunchDrillButton
                  scenarioId={scenario.id}
                  assignmentId={params.moduleId}
                  lessonId={moduleData?.lessons?.[0]?.id}
                  moduleId={params.moduleId}
                  variant="dss"
                  label={latestEval ? 'Practise Drill Again' : 'Start Live Roleplay Drill'}
                  className="px-6 py-3 text-sm font-bold w-full sm:w-auto"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Rubric & Criteria */}
        <div className="space-y-6">
          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-white font-serif font-bold text-xl mb-4">Required Rubric Standards</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={18} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span>Discovery & Needs Diagnosis before prescribing offer.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={18} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span>Follow approved PAS (Problem-Agitate-Solve) structure.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={18} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span>Commercial Guardrails: Never invent prices or grant unauthorized terms.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={18} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span>Next-Step Progression: Concrete commitment with clear scheduled time.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-white font-bold text-sm">Evidence-Based Certification</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every turn is archived server-side. Faculty review assesses verbatim evidence quotes from your practice session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
