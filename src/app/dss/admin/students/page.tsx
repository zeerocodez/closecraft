import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, Search, Target, TrendingUp, ChevronRight } from 'lucide-react';

export default async function DSSAdminStudentsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const orgId = (session as any).organizationId;

  const organizationId = orgId || (await db.organization.findFirst())?.id;
  
  if (!organizationId) {
    return <div className="text-white p-8">Error: No organization found to manage LMS.</div>;
  }

  // Fetch all students and their progress
  const students = await db.studentProfile.findMany({
    where: { organizationId },
    include: {
      user: { select: { name: true, email: true } },
      moduleProgress: true,
      assessmentScores: true
    }
  });

  const totalModules = await db.module.count({ where: { organizationId } });

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">
      {/* Top Nav */}
      <header className="bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-6 shrink-0 z-40 sticky top-0">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#248277]/20 border border-[#248277]/30 text-[#45bfae] flex items-center justify-center font-bold font-serif shadow-lg">
              Z
            </div>
            <span className="font-serif font-bold text-white ml-2 text-lg">DSS Faculty Portal</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-bold">
              <Link href="/dss/admin" className="text-gray-400 hover:text-white transition-colors py-5">Curriculum</Link>
              <Link href="/dss/admin/students" className="text-[#45bfae] border-b-2 border-[#45bfae] py-5">Students</Link>
              <Link href="/dss/admin/roleplays" className="text-gray-400 hover:text-white transition-colors py-5">AI Scenarios</Link>
            </nav>
            <div className="w-8 h-8 rounded-full bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-bold text-sm uppercase">
              {session.user.name?.substring(0, 2) || 'AD'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-3">
                <Users size={14} /> Cohort Management
              </div>
              <h1 className="font-serif font-bold text-3xl text-white">Student Progress & Grades</h1>
              <p className="text-gray-400 text-sm mt-1">Monitor completions and review AI roleplay grades.</p>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full bg-[#161b22] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#45bfae] transition-colors"
              />
            </div>
          </div>

          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0a0d12] border-b border-white/5">
                <tr>
                  <th className="py-4 px-6 font-bold text-white">Student</th>
                  <th className="py-4 px-6 font-bold text-white text-center">Module Progress</th>
                  <th className="py-4 px-6 font-bold text-white text-center">Final AI Grade</th>
                  <th className="py-4 px-6 font-bold text-white text-center">Status</th>
                  <th className="py-4 px-6 font-bold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No students enrolled in this organization yet.
                    </td>
                  </tr>
                ) : (
                  students.map(student => {
                    const completed = student.moduleProgress.filter(p => p.status === 'COMPLETED').length;
                    const progressPercent = totalModules === 0 ? 0 : Math.round((completed / totalModules) * 100);
                    const finalScore = student.assessmentScores.length > 0 
                      ? Math.max(...student.assessmentScores.map(s => s.score)) 
                      : null;
                      
                    let statusLabel = 'In Progress';
                    let statusColor = 'text-blue-400 bg-blue-400/10 border-blue-400/20';
                    
                    if (finalScore !== null && finalScore >= 85) {
                      statusLabel = 'Certified';
                      statusColor = 'text-[#45bfae] bg-[#248277]/20 border-[#248277]/30';
                    } else if (finalScore !== null && finalScore < 85) {
                      statusLabel = 'Failed Exam';
                      statusColor = 'text-red-400 bg-red-400/10 border-red-400/20';
                    } else if (progressPercent === 100) {
                      statusLabel = 'Ready for Exam';
                      statusColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
                    }

                    return (
                      <tr key={student.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white">{student.user.name || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500">{student.user.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3 justify-center">
                            <div className="w-24 h-1.5 bg-[#0f1214] rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-[#248277]" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-[#45bfae] w-8 text-right">{progressPercent}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {finalScore !== null ? (
                            <span className="font-bold text-white text-lg">{finalScore}%</span>
                          ) : (
                            <span className="text-gray-600">--</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors inline-flex items-center justify-center">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
