import React from 'react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ClipboardList, Upload, CheckCircle, Clock } from 'lucide-react';

export default async function AssignmentsPage() {
 const session = await auth();
 if (!session?.user?.id) return null;

 return (
 <div className="max-w-5xl mx-auto w-full p-8 md:p-12 relative">
 <div className="mb-12">
 <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-4">
 Assignments & Portfolio
 </h1>
 <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
 Submit offline exercises, recorded cold calls, and written email sequences for human faculty grading and peer review.
 </p>
 </div>

 <div className="bg-[#0a0d12] border border-white/5 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center mb-8">
 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-6">
 <ClipboardList size={32} />
 </div>
 <h2 className="text-xl font-bold text-white mb-2">No Active Assignments</h2>
 <p className="text-gray-500 max-w-md mx-auto">
 You currently have no pending assignments required by your curriculum. Progress further in your modules to unlock practical exercises.
 </p>
 </div>
 
 <div>
 <h3 className="font-bold text-white mb-6 flex items-center gap-2">
 <CheckCircle size={18} className="text-[#45bfae]" /> Past Submissions
 </h3>
 <div className="p-6 rounded-2xl border border-white/5 bg-[#0a0d12]/50 text-gray-500 text-sm text-center">
 No past submissions found.
 </div>
 </div>
 </div>
 );
}
