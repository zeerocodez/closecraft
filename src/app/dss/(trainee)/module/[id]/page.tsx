import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, Lock, PlayCircle, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function ModulePage({ params, searchParams }: { params: { id: string }, searchParams: { lesson?: string } }) {
 const session = await auth();
 if (!session?.user) redirect('/login');
 
 const studentId = session.user.id || '';
 
 const moduleData = await db.module.findUnique({
 where: { id: params.id },
 include: { 
 lessons: { orderBy: { orderIndex: 'asc' } },
 progress: { where: { studentId } }
 }
 });

 if (!moduleData) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
 Module not found.
 </div>
 );
 }
 
 // Fetch lesson progress
 const lessonProgress = await db.lessonProgress.findMany({
 where: { studentId, lesson: { moduleId: moduleData.id } }
 });
 
 const completedLessonIds = new Set(lessonProgress.filter(p => p.status === 'COMPLETED').map(p => p.lessonId));
 
 const totalLessons = moduleData.lessons.length;
 const completedCount = completedLessonIds.size;
 const progressPercent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
 
 // Determine current lesson
 let activeLessonIndex = 0;
 if (searchParams.lesson) {
 activeLessonIndex = moduleData.lessons.findIndex(l => l.id === searchParams.lesson);
 if (activeLessonIndex === -1) activeLessonIndex = 0;
 } else {
 // Find first incomplete
 activeLessonIndex = moduleData.lessons.findIndex(l => !completedLessonIds.has(l.id));
 if (activeLessonIndex === -1 && totalLessons > 0) activeLessonIndex = totalLessons - 1; // all complete, show last
 if (activeLessonIndex === -1) activeLessonIndex = 0;
 }
 
 const activeLesson = moduleData.lessons[activeLessonIndex];
 
 // Server Action to complete lesson
 async function completeLesson(formData: FormData) {
 'use server';
 const session = await auth();
 if (!session?.user?.id) return;
 const lessonId = formData.get('lessonId') as string;
 const moduleId = formData.get('moduleId') as string;
 
 await db.lessonProgress.upsert({
 where: {
 studentId_lessonId: { studentId: session.user.id, lessonId }
 },
 update: { status: 'COMPLETED', completedAt: new Date() },
 create: {
 studentId: session.user.id,
 lessonId,
 status: 'COMPLETED',
 completedAt: new Date()
 }
 });
 
 // Check if module is complete
 const lessonCount = await db.lesson.count({ where: { moduleId } });
 const compCount = await db.lessonProgress.count({ 
 where: { studentId: session.user.id, lesson: { moduleId }, status: 'COMPLETED' }
 });
 
 if (compCount >= lessonCount) {
 await db.moduleProgress.upsert({
 where: { studentId_moduleId: { studentId: session.user.id, moduleId } },
 update: { status: 'COMPLETED', completedAt: new Date() },
 create: {
 studentId: session.user.id,
 moduleId,
 status: 'COMPLETED',
 completedAt: new Date()
 }
 });
 }
 
 revalidatePath(`/dss/module/${moduleId}`);
 // Redirect logic would go here typically, but revalidatePath will refresh the view
 }

 return (
 <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">
 {/* Top Nav */}
 <header className="sticky top-0 z-40 bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-6">
 <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
 <Link href="/dss/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm">
 <ArrowLeft size={16} /> Back to Dashboard
 </Link>
 <div className="flex items-center gap-2 font-serif font-bold text-white text-lg">
 {moduleData.title}
 </div>
 <div className="w-8 h-8 rounded-full bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-bold text-sm uppercase shadow-lg">
 {session.user.name?.substring(0, 2) || 'ST'}
 </div>
 </div>
 </header>

 {/* Main Layout Grid */}
 <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto overflow-hidden">
 
 {/* Left Sidebar: Lesson List */}
 <aside className="w-full lg:w-80 border-r border-white/5 bg-[#0a0d12] flex flex-col shrink-0 lg:h-[calc(100vh-4rem)] overflow-y-auto">
 <div className="p-6 border-b border-white/5">
 <div className="text-xs font-bold uppercase tracking-widest text-[#45bfae] mb-3">Curriculum Progress</div>
 <div className="w-full h-1.5 bg-[#0f1214] rounded-full overflow-hidden mb-3 border border-white/5">
 <div className="h-full bg-[#248277] transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
 </div>
 <div className="text-xs text-gray-500 font-medium flex justify-between">
 <span>{completedCount} of {totalLessons} Complete</span>
 <span className="font-bold text-[#45bfae]">{progressPercent}%</span>
 </div>
 </div>
 
 <div className="flex-1 p-4 space-y-2">
 
 {moduleData.lessons.map((lesson, index) => {
 const isCompleted = completedLessonIds.has(lesson.id);
 // Lesson N is unlocked if Lesson N-1 is completed
 const isLocked = index > 0 && !completedLessonIds.has(moduleData.lessons[index-1].id);
 const isActive = index === activeLessonIndex;

 return (
 <Link 
 key={lesson.id} 
 href={isLocked ? '#' : `/dss/module/${moduleData.id}?lesson=${lesson.id}`}
 className={`w-full text-left p-4 rounded-xl flex gap-3 items-start transition-all ${
 isActive ? 'bg-[#248277]/10 border border-[#248277]/30 shadow-lg' : 
 isLocked ? 'opacity-50 cursor-not-allowed border border-transparent' : 
 'hover:bg-white/5 border border-transparent'
 }`}
 >
 <div className={`mt-0.5 shrink-0 ${isActive ? 'text-[#45bfae]' : isCompleted ? 'text-[#248277]' : 'text-gray-500'}`}>
 {isCompleted && !isActive ? <CheckCircle size={18} /> : 
 isLocked ? <Lock size={18} /> : 
 <PlayCircle size={18} className={isActive ? "fill-[#248277]/20" : ""} />}
 </div>
 <div className="flex-1 min-w-0">
 <div className={`text-sm font-bold truncate ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
 {index + 1}. {lesson.title}
 </div>
 <div className={`text-xs mt-1 font-medium ${isActive ? 'text-[#45bfae]' : 'text-gray-500'}`}>
 {isActive ? 'Playing Now' : isLocked ? 'Locked' : isCompleted ? 'Completed' : 'Ready'}
 </div>
 </div>
 </Link>
 );
 })}

 {/* Assessment / Roleplay Lock */}
 <div className="mt-8 pt-4 border-t border-white/5">
 <Link href={progressPercent === 100 ? "/dss/roleplay" : "#"} className={`w-full text-left p-4 rounded-xl flex gap-3 items-start ${progressPercent === 100 ? 'bg-[#45bfae]/10 border border-[#45bfae]/30 hover:bg-[#45bfae]/20' : 'opacity-50 cursor-not-allowed border border-transparent'}`}>
 <div className={`mt-0.5 ${progressPercent === 100 ? 'text-[#45bfae]' : 'text-gray-500'}`}>
 {progressPercent === 100 ? <ShieldCheck size={18} /> : <Lock size={18} />}
 </div>
 <div className="flex-1">
 <div className={`text-sm font-bold ${progressPercent === 100 ? 'text-white' : 'text-gray-400'}`}>Module Assessment</div>
 <div className={`text-xs mt-1 ${progressPercent === 100 ? 'text-[#45bfae]' : 'text-gray-500'}`}>
 {progressPercent === 100 ? 'Unlocked - Start AI Roleplay' : 'Complete lessons to unlock'}
 </div>
 </div>
 </Link>
 </div>

 </div>
 </aside>

 {/* Right Content Area: Video & Materials */}
 <div className="flex-1 flex flex-col h-full lg:h-[calc(100vh-4rem)] overflow-y-auto">
 {activeLesson ? (
 <>
 {/* Video Player Placeholder */}
 <div className="w-full aspect-video bg-black flex items-center justify-center relative border-b border-white/5 shadow-2xl">
 <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
 <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent flex flex-col justify-end p-8 lg:p-12 z-10">
 <div className="text-xs font-bold uppercase tracking-widest text-[#45bfae] mb-2 drop-shadow-md">Lesson {activeLessonIndex + 1}</div>
 <div className="text-white font-serif font-bold text-3xl md:text-4xl drop-shadow-lg">{activeLesson.title}</div>
 </div>
 {/* Play Button */}
 <div className="w-20 h-20 rounded-full bg-[#248277]/80 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-[#248277] transition-all hover:scale-110 shadow-[0_0_30px_rgba(36,130,119,0.5)] z-20 border border-[#45bfae]/30">
 <PlayCircle className="text-white" size={40} fill="rgba(69, 191, 174, 0.2)" />
 </div>
 </div>

 {/* Transcript & Materials */}
 <div className="flex-1 bg-[#0d1117] p-8 lg:p-12">
 <div className="max-w-4xl mx-auto">
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-white/5 pb-8">
 <div>
 <h2 className="font-serif font-bold text-2xl text-white mb-2">Lesson Overview</h2>
 <p className="text-gray-400 text-sm">Instructor: Zeerocodes DSS Faculty</p>
 </div>
 <form action={completeLesson}>
 <input type="hidden" name="lessonId" value={activeLesson.id} />
 <input type="hidden" name="moduleId" value={moduleData.id} />
 <button 
 type="submit" 
 disabled={completedLessonIds.has(activeLesson.id)}
 className={`px-8 py-3 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all ${
 completedLessonIds.has(activeLesson.id) 
 ? 'bg-white/5 text-[#45bfae] cursor-default border border-white/5' 
 : 'bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3]'
 }`}
 >
 <CheckCircle size={18} /> 
 {completedLessonIds.has(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
 </button>
 </form>
 </div>

 <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 font-sans leading-relaxed">
 <p>
 {activeLesson.transcript || 'No transcript available for this lesson yet. Watch the video above to master this concept.'}
 </p>
 
 <div className="p-6 bg-[#121c1a] rounded-2xl border border-[#248277]/20 mt-12 shadow-xl">
 <h4 className="font-bold text-white flex items-center gap-2 mb-4 text-lg">
 <BookOpen size={20} className="text-[#45bfae]" /> Attached Materials
 </h4>
 <ul className="space-y-3">
 {activeLesson.contentUrl ? (
 <li>
 <a href={activeLesson.contentUrl} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 text-sm font-bold text-[#45bfae]">
 <span className="material-symbols-outlined text-[20px]">download</span>
 Download Playbook / PDF
 </a>
 </li>
 ) : (
 <li className="text-sm text-gray-500 font-medium">No attachments for this lesson.</li>
 )}
 </ul>
 </div>
 </div>
 </div>
 </div>
 </>
 ) : (
 <div className="flex-1 flex items-center justify-center text-gray-500">
 No lessons available.
 </div>
 )}
 </div>

 </div>
 </div>
 );
}
