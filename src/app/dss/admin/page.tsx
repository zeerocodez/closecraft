import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, Settings, Plus, BarChart2, CheckSquare, PlayCircle, BrainCircuit } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DSSAdminPage() {
 const session = await auth();
 if (!session?.user) redirect('/login');
 const orgId = (session as any).organizationId;

 // We should fetch the organization, if missing just fallback (in dev/demo)
 const organizationId = orgId || (await db.organization.findFirst())?.id;
 
 if (!organizationId) {
 return <div className="text-white p-8">Error: No organization found to manage LMS.</div>;
 }

 const courses = await db.course.findMany({
 where: { organizationId },
 include: {
 modules: {
 include: { lessons: { orderBy: { orderIndex: 'asc' } } },
 orderBy: { orderIndex: 'asc' }
 }
 },
 orderBy: { createdAt: 'desc' }
 });

 const studentsCount = await db.studentProfile.count({
 where: { organizationId }
 });

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
 <Link href="/dss/admin" className="text-[#45bfae] border-b-2 border-[#45bfae] py-5">Curriculum</Link>
 <Link href="/dss/admin/students" className="text-gray-400 hover:text-white transition-colors py-5">Students</Link>
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
 
 <div className="flex items-center justify-between mb-8">
 <div>
 <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-3">
 <BookOpen size={14} /> Content Management
 </div>
 <h1 className="font-serif font-bold text-3xl text-white">Curriculum Builder</h1>
 <p className="text-gray-400 text-sm mt-1">Manage courses, modules, lessons, and AI assessment locks.</p>
 </div>
 <button className="px-5 py-2.5 bg-[#45bfae] text-[#0f1214] font-bold rounded-xl hover:bg-[#5cd4c3] transition-colors shadow-lg flex items-center gap-2">
 <Plus size={18} /> Add Course
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Col: Courses List */}
 <div className="lg:col-span-2 space-y-6">
 
 {courses.length === 0 ? (
 <div className="p-12 bg-[#121c1a] border border-[#248277]/30 border-dashed rounded-2xl text-center shadow-xl">
 <div className="w-20 h-20 rounded-full bg-[#248277]/10 flex items-center justify-center mx-auto mb-6">
 <BookOpen className="text-[#45bfae]" size={32} />
 </div>
 <h3 className="font-serif font-bold text-white text-xl mb-2">No Courses Found</h3>
 <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">Get started by creating your first course program for the Digital Sales School.</p>
 <button className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-colors mx-auto flex items-center gap-2">
 <Plus size={18} /> Create Course
 </button>
 </div>
 ) : (
 courses.map((course) => (
 <div key={course.id} className="bg-[#121c1a] border border-[#248277]/20 rounded-2xl overflow-hidden shadow-xl mb-6">
 <div className="p-5 bg-[#0a0d12] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <span className="text-[10px] font-bold text-[#45bfae] uppercase tracking-widest block">Program</span>
 {course.isFree ? (
 <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">FREE</span>
 ) : (
 <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">${course.price || 0}</span>
 )}
 </div>
 <h2 className="font-bold text-white text-xl">{course.title}</h2>
 </div>
 <div className="flex items-center gap-4">
 <span className="px-3 py-1 rounded-full bg-[#248277]/20 text-[#45bfae] font-bold text-[10px] uppercase tracking-widest border border-[#248277]/30">PUBLISHED</span>
 <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/5"><Settings size={16} /></button>
 </div>
 </div>
 
 <div className="p-5 bg-[#0d1117]">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Modules</h3>
 <button className="text-xs font-bold text-[#45bfae] hover:text-[#5cd4c3] flex items-center gap-1 transition-colors">
 <Plus size={14} /> Add Module
 </button>
 </div>
 
 <div className="space-y-4">
 {course.modules.length === 0 ? (
 <div className="py-8 text-center text-sm text-gray-500 bg-[#0a0d12] rounded-xl border border-white/5 border-dashed">No modules added to this course yet.</div>
 ) : (
 course.modules.map((mod, index) => (
 <div key={mod.id} className="bg-[#0a0d12] border border-white/5 rounded-xl overflow-hidden">
 <div className="p-4 border-b border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-gray-600 group-hover:text-gray-400 transition-colors">drag_indicator</span>
 <h4 className="font-bold text-white text-sm">Module {index + 1}: {mod.title}</h4>
 </div>
 <span className="text-xs text-gray-500">{mod.lessons.length} Lessons</span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Right Col: Quick Stats */}
 <div className="space-y-6">
 
 <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-[#45bfae]/5 rounded-full blur-2xl"></div>
 <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2 relative z-10">
 <BrainCircuit size={18} className="text-[#45bfae]" /> LMS Overview
 </h3>
 <div className="space-y-5 relative z-10">
 <div className="flex items-center justify-between p-3 bg-[#0a0d12] rounded-xl border border-white/5">
 <span className="text-sm text-gray-400 flex items-center gap-3"><Users size={16} /> Active Trainees</span>
 <span className="font-bold text-white text-lg">{studentsCount}</span>
 </div>
 <div className="flex items-center justify-between p-3 bg-[#0a0d12] rounded-xl border border-white/5">
 <span className="text-sm text-gray-400 flex items-center gap-3"><CheckSquare size={16} /> Avg. Completion</span>
 <span className="font-bold text-[#45bfae] text-lg">0%</span>
 </div>
 <div className="flex items-center justify-between p-3 bg-[#0a0d12] rounded-xl border border-white/5">
 <span className="text-sm text-gray-400 flex items-center gap-3"><BarChart2 size={16} /> Certifications Issued</span>
 <span className="font-bold text-white text-lg">0</span>
 </div>
 </div>
 </div>

 <div className="bg-[#0a0d12] border border-white/10 rounded-2xl p-6 shadow-xl">
 <h3 className="font-bold text-white mb-2">Global Settings</h3>
 <p className="text-xs text-gray-500 mb-6 leading-relaxed">Configure the strictness of the AI Assessor and default module locking rules across the organization.</p>
 
 <div className="space-y-6">
 <label className="flex items-center justify-between cursor-pointer group">
 <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Enforce Sequential Progression</span>
 <div className="w-11 h-6 bg-[#45bfae] rounded-full relative shadow-[0_0_10px_rgba(69,191,174,0.3)]">
 <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-[#0f1214] rounded-full"></div>
 </div>
 </label>
 
 <label className="flex flex-col gap-2">
 <span className="text-sm font-bold text-gray-300">AI Grading Strictness</span>
 <select className="w-full p-3 bg-[#161b22] rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-[#45bfae] transition-colors cursor-pointer">
 <option>Standard (Recommended)</option>
 <option>Lenient</option>
 <option>Strict (Enterprise Sales)</option>
 </select>
 </label>
 </div>
 </div>

 </div>

 </div>
 </div>
 </main>

 </div>
 );
}
