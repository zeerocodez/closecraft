import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDSSPage() {
  const session = await auth();
  
  // Basic RBAC check (mocked for now, assuming role field exists in a real app)
  if (!session?.user) redirect('/login');
  // if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') redirect('/dss');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold text-on-surface">DSS Administration</h1>
          <p className="font-body-lg text-on-surface-variant">Manage curriculum, review submissions, and monitor student progress.</p>
        </div>
        <button className="px-6 py-2 bg-primary text-on-primary font-label-md font-bold rounded-lg shadow-md hover:bg-primary-container transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          New Cohort
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 shadow-sm">
            <h3 className="font-headline-sm font-bold text-on-surface mb-4">Active Cohorts</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-label-lg font-bold text-primary">Fall 2026 Tech Sales</h4>
                  <span className="px-2 py-1 bg-primary text-on-primary text-[10px] uppercase font-bold rounded">Active</span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant font-body-sm">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">group</span> 45 Students</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">flag</span> Week 4/13</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-error-container/20 rounded-2xl border border-error-container p-6 shadow-sm">
            <h3 className="font-headline-sm font-bold text-error mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              At-Risk Students
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-surface-container">
                <div>
                  <p className="font-label-md font-bold text-on-surface">Michael O.</p>
                  <p className="font-body-sm text-error">Failed Mod 3 Quiz (3 attempts)</p>
                </div>
                <button className="text-primary font-label-sm font-bold hover:underline">Review</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workflows */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Reviews */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container overflow-hidden shadow-sm">
            <div className="bg-surface-container-low px-6 py-4 border-b border-surface-container flex justify-between items-center">
              <h2 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">assignment_turned_in</span>
                Pending Manual Reviews
              </h2>
              <span className="bg-secondary text-on-secondary px-2 py-0.5 rounded-full font-label-sm font-bold">12</span>
            </div>
            
            <div className="divide-y divide-surface-container">
              {/* Manual Review Item */}
              <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest/50">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg font-bold text-on-surface">AI Role-play Override Request</h4>
                    <p className="font-body-sm text-on-surface-variant">
                      Student: <strong>Sarah Jenkins</strong> • Score: 78/100 (Failed by 2 pts)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-surface-container-high text-on-surface font-label-sm font-bold rounded-lg hover:bg-surface-container-low">View Transcript</button>
                  <button className="px-4 py-2 bg-primary text-on-primary font-label-sm font-bold rounded-lg hover:bg-primary-container">Override & Pass</button>
                </div>
              </div>

              {/* Assignment Review Item */}
              <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest/50">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg font-bold text-on-surface">Module 7: Cold Call Script Submission</h4>
                    <p className="font-body-sm text-on-surface-variant">
                      Student: <strong>David K.</strong> • Submitted: 2 hours ago
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-surface-container-high text-on-surface font-label-sm font-bold rounded-lg hover:bg-surface-container-low">Grade Rubric</button>
              </div>
            </div>
          </div>

          {/* Curriculum Manager */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_tree</span>
                Curriculum Structure (28 Modules)
              </h2>
              <button className="text-primary font-label-md font-bold hover:underline">Edit Curriculum</button>
             </div>
             
             <div className="p-4 border border-surface-container-high border-dashed rounded-xl bg-surface flex flex-col items-center justify-center text-center space-y-2 py-8">
                <span className="material-symbols-outlined text-[48px] text-surface-container-highest">schema</span>
                <p className="font-body-md text-on-surface-variant max-w-sm">
                  Drag and drop modules to reorder, configure completion gates, and assign AI Role-play rubrics.
                </p>
                <button className="mt-2 px-6 py-2 bg-surface-container text-on-surface font-label-md font-bold rounded-lg hover:bg-surface-container-high">
                  Open Curriculum Builder
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
