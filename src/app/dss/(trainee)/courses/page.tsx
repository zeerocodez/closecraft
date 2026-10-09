import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { BookOpen, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

export default async function CoursesPage() {
 const session = await auth();
 const orgId = (session as any)?.organizationId;
 const organizationId = orgId || (await db.organization.findFirst())?.id;
 
 if (!organizationId) {
 return <div>Error: No organization found for LMS.</div>;
 }

 const courses = await db.course.findMany({
 where: { organizationId },
 include: { 
 modules: {
 include: { lessons: true }
 },
 enrollments: {
 where: { studentId: session?.user?.id || '' }
 }
 },
 orderBy: { createdAt: 'desc' }
 });

 return (
 <div className="max-w-6xl mx-auto w-full p-8 md:p-12 relative">
 <div className="mb-12">
 <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-4">
 <BookOpen size={14} /> Programs
 </div>
 <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
 Available Courses
 </h1>
 <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
 Select a training program to begin or continue your curriculum. Programs are structured sequentially to guide you to full certification.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {courses.length === 0 ? (
 <div className="col-span-full p-12 bg-[#121c1a] border border-[#248277]/30 border-dashed rounded-2xl text-center shadow-xl">
 <h3 className="font-serif font-bold text-white text-xl mb-2">No Courses Available</h3>
 <p className="text-gray-400 text-sm">Your organization has not published any courses yet.</p>
 </div>
 ) : (
 courses.map((course) => {
 const isEnrolled = course.enrollments.length > 0;
 const totalModules = course.modules.length;
 const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
 
 return (
 <div key={course.id} className="group relative bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#248277]/60">
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-bold uppercase tracking-widest text-[#45bfae]">Program</span>
 <div className="flex items-center gap-2">
 {course.isFree ? (
 <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
 Free
 </span>
 ) : (
 <span className="text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#45bfae]/10 px-2 py-1 rounded-md border border-[#45bfae]/20">
 {course.price ? `$${course.price}` : 'Premium'}
 </span>
 )}
 {isEnrolled && (
 <span className="text-[10px] uppercase font-bold tracking-widest text-white bg-white/10 px-2 py-1 rounded-md border border-white/10">
 Enrolled
 </span>
 )}
 </div>
 </div>
 
 <h2 className="text-2xl font-serif font-bold text-white mb-3 line-clamp-2">
 {course.title}
 </h2>
 
 <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-1">
 {course.description || "Master the fundamentals and advanced techniques of this curriculum to achieve certification."}
 </p>
 
 <div className="flex items-center gap-4 mb-6">
 <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
 <Layers size={14} className="text-[#45bfae]" /> {totalModules} Modules
 </span>
 <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
 <BookOpen size={14} className="text-[#45bfae]" /> {totalLessons} Lessons
 </span>
 </div>
 
 <Link href={`/dss/courses/${course.slug}`} className="mt-auto inline-flex items-center justify-between w-full p-3 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold rounded-xl transition-colors shadow-lg">
 <span>
 {isEnrolled ? 'Continue Course' : (course.isFree ? 'Enroll for Free' : `Buy for $${course.price || 0}`)}
 </span>
 <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>
 );
 })
 )}
 </div>
 </div>
 );
}
