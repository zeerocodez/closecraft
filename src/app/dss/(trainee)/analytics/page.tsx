import React from 'react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { BarChart3, TrendingUp, Target, BrainCircuit, Activity } from 'lucide-react';

export default async function AnalyticsPage() {
 const session = await auth();
 if (!session?.user?.id) return null;

 return (
 <div className="max-w-6xl mx-auto w-full p-8 md:p-12 relative">
 <div className="mb-12">
 <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-4">
 Performance Analytics
 </h1>
 <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
 Track your skill progression across the digital sales curriculum. Data is pulled from your module completion and AI roleplay assessments.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-lg">
 <div className="flex items-center gap-3 text-[#45bfae] mb-4">
 <Target size={20} />
 <h3 className="font-bold text-white text-sm">Overall Score</h3>
 </div>
 <div className="text-4xl font-serif font-bold text-white mb-2">0%</div>
 <p className="text-xs text-gray-500 font-medium">Weighted average of all assessments</p>
 </div>
 
 <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-6 shadow-lg">
 <div className="flex items-center gap-3 text-gray-400 mb-4">
 <BrainCircuit size={20} />
 <h3 className="font-bold text-white text-sm">Discovery Mastery</h3>
 </div>
 <div className="text-4xl font-serif font-bold text-white mb-2">--</div>
 <p className="text-xs text-gray-500 font-medium">Not enough data to calculate</p>
 </div>

 <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-6 shadow-lg">
 <div className="flex items-center gap-3 text-gray-400 mb-4">
 <Activity size={20} />
 <h3 className="font-bold text-white text-sm">Objection Handling</h3>
 </div>
 <div className="text-4xl font-serif font-bold text-white mb-2">--</div>
 <p className="text-xs text-gray-500 font-medium">Not enough data to calculate</p>
 </div>

 <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-6 shadow-lg">
 <div className="flex items-center gap-3 text-gray-400 mb-4">
 <TrendingUp size={20} />
 <h3 className="font-bold text-white text-sm">Closing Velocity</h3>
 </div>
 <div className="text-4xl font-serif font-bold text-white mb-2">--</div>
 <p className="text-xs text-gray-500 font-medium">Not enough data to calculate</p>
 </div>
 </div>

 <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
 <BarChart3 size={48} className="text-gray-600 mb-4" />
 <h3 className="text-xl font-bold text-white mb-2">Insufficient Assessment Data</h3>
 <p className="text-gray-500 max-w-md">
 Complete more modules and participate in AI Roleplay scenarios to generate your skill progression charts.
 </p>
 </div>
 </div>
 );
}
