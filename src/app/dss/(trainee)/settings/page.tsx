import React from 'react';
import { auth } from '@/lib/auth';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
 const session = await auth();
 if (!session?.user?.id) return null;

 return (
 <div className="max-w-4xl mx-auto w-full p-8 md:p-12 relative">
 <div className="mb-10">
 <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-4">
 Account Settings
 </h1>
 <p className="text-gray-400 text-lg">
 Manage your DSS profile, notification preferences, and privacy.
 </p>
 </div>

 <div className="space-y-6">
 <div className="bg-[#0a0d12] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
 <div className="p-6 border-b border-white/5 bg-[#121c1a] flex items-center gap-3">
 <User className="text-[#45bfae]" size={20} />
 <h2 className="font-bold text-white text-lg">Personal Profile</h2>
 </div>
 <div className="p-6 space-y-6">
 <div className="flex items-center gap-6">
 <div className="w-24 h-24 rounded-full bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] text-3xl font-bold uppercase">
 {session.user.name?.substring(0, 2) || 'ST'}
 </div>
 <div>
 <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg border border-white/10 transition-colors">
 Upload Avatar
 </button>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
 <input type="text" defaultValue={session.user.name || ''} className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#45bfae]" />
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
 <input type="email" disabled defaultValue={session.user.email || ''} className="w-full bg-[#161b22] border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
 </div>
 </div>
 
 <div className="flex justify-end">
 <button className="px-6 py-2.5 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold rounded-xl transition-colors shadow-lg">
 Save Profile
 </button>
 </div>
 </div>
 </div>

 <div className="bg-[#0a0d12] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
 <div className="p-6 border-b border-white/5 bg-[#121c1a] flex items-center gap-3">
 <Bell className="text-[#45bfae]" size={20} />
 <h2 className="font-bold text-white text-lg">Notifications</h2>
 </div>
 <div className="p-6">
 <div className="flex items-center justify-between py-4 border-b border-white/5">
 <div>
 <h4 className="font-bold text-white text-sm">Curriculum Updates</h4>
 <p className="text-xs text-gray-500">Get notified when new modules or lessons are added.</p>
 </div>
 <div className="w-11 h-6 bg-[#45bfae] rounded-full relative cursor-pointer">
 <div className="w-5 h-5 bg-[#0f1214] rounded-full absolute right-0.5 top-0.5"></div>
 </div>
 </div>
 <div className="flex items-center justify-between py-4 border-b border-white/5">
 <div>
 <h4 className="font-bold text-white text-sm">Assignment Grades</h4>
 <p className="text-xs text-gray-500">Alerts when your submissions are graded by faculty.</p>
 </div>
 <div className="w-11 h-6 bg-[#45bfae] rounded-full relative cursor-pointer">
 <div className="w-5 h-5 bg-[#0f1214] rounded-full absolute right-0.5 top-0.5"></div>
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 );
}
