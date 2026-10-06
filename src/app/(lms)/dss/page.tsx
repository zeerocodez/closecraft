import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function StudentHomePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Load the student profile and active enrollment
  const student = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { cohort: true }
      }
    }
  });

  const activeEnrollment = student?.enrollments?.[0];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-primary to-tertiary rounded-2xl p-8 text-on-primary shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-headline-lg text-3xl font-bold">
              Welcome back, {session.user.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="font-body-lg text-on-primary/80 max-w-xl">
              You are currently enrolled in the <strong>{activeEnrollment?.cohort?.name || 'Digital Sales School'}</strong>. Let's continue your journey to becoming a certified tech closer.
            </p>
          </div>
          <Link 
            href="/dss/curriculum" 
            className="shrink-0 bg-surface text-primary px-8 py-4 rounded-xl font-headline-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            Resume Learning
            <span className="material-symbols-outlined">play_arrow</span>
          </Link>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm font-bold text-on-surface">Course Progress</h3>
            <span className="material-symbols-outlined text-primary">donut_large</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-metric-numeral-lg text-4xl font-bold text-on-surface">12%</span>
            <span className="font-body-sm text-on-surface-variant uppercase tracking-wider">Completed</span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[12%]"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm font-bold text-on-surface">Sales Readiness</h3>
            <span className="material-symbols-outlined text-tertiary">analytics</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-metric-numeral-lg text-4xl font-bold text-on-surface">45/100</span>
            <span className="font-body-sm text-on-surface-variant uppercase tracking-wider">Index Score</span>
          </div>
          <p className="font-body-sm text-on-surface-variant">
            Requires minimum 80/100 across 10 competencies for certification.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm font-bold text-on-surface">Next Milestone</h3>
            <span className="material-symbols-outlined text-secondary">flag</span>
          </div>
          <div className="space-y-1 mb-4">
            <h4 className="font-label-lg font-bold text-on-surface">Module 4 Assessment</h4>
            <p className="font-body-sm text-on-surface-variant">Due in 3 days</p>
          </div>
          <Link href="/dss/curriculum" className="font-label-md font-bold text-primary flex items-center gap-1 hover:underline">
            Go to task <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm overflow-hidden">
        <div className="bg-surface-container-low px-6 py-4 border-b border-surface-container">
          <h2 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">campaign</span>
            Latest Announcements
          </h2>
        </div>
        <div className="divide-y divide-surface-container">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-primary font-bold uppercase tracking-wider">System</span>
              <span className="font-body-sm text-on-surface-variant">Today</span>
            </div>
            <h3 className="font-label-lg font-bold text-on-surface mb-1">Welcome to the AI-Powered Learning Environment</h3>
            <p className="font-body-md text-on-surface-variant">
              Every module is locked by default. You must complete the lessons, pass the quizzes, and conquer the AI Buyer Role-plays to advance. Good luck!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
