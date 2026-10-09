import React from 'react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { MessageSquare, Inbox, Search } from 'lucide-react';

export default async function MessagesPage() {
 const session = await auth();
 if (!session?.user?.id) return null;

 return (
 <div className="max-w-6xl mx-auto w-full h-[calc(100vh-4rem)] p-4 md:p-8">
 <div className="bg-[#0a0d12] border border-white/5 rounded-2xl h-full flex overflow-hidden shadow-xl">
 
 {/* Sidebar List */}
 <div className="w-1/3 border-r border-white/5 bg-[#0d1117] flex flex-col">
 <div className="p-4 border-b border-white/5">
 <h2 className="text-lg font-bold text-white mb-4">Messages</h2>
 <div className="relative">
 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
 <input 
 type="text" 
 placeholder="Search conversations..." 
 className="w-full bg-[#161b22] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#45bfae]"
 />
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto p-2">
 <div className="text-center p-8">
 <Inbox size={32} className="text-gray-600 mx-auto mb-2" />
 <p className="text-sm text-gray-500">No active conversations</p>
 </div>
 </div>
 </div>
 
 {/* Chat Area */}
 <div className="flex-1 flex flex-col items-center justify-center bg-[#121c1a] relative">
 <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
 <div className="z-10 text-center">
 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-4 mx-auto border border-white/5">
 <MessageSquare size={24} />
 </div>
 <h3 className="text-xl font-bold text-white mb-2">Your Inbox</h3>
 <p className="text-gray-500 max-w-sm">Select a conversation to start messaging your instructors, faculty, or peers.</p>
 </div>
 </div>

 </div>
 </div>
 );
}
