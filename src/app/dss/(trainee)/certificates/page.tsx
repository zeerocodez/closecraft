import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Award, Share2, Download, CheckCircle } from 'lucide-react';

export default async function CertificatesPage() {
 const session = await auth();
 if (!session?.user?.id) return null;

 // In a real app, this would query a Certificates model.
 // We'll mock the state based on module progress for now.
 const hasCredential = false; 

 return (
 <div className="max-w-5xl mx-auto w-full p-8 md:p-12 relative">
 <div className="mb-12">
 <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-4">
 Credentials Vault
 </h1>
 <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
 Manage your verified DSS credentials. You can download your certificates in high resolution or share the verification link directly to your LinkedIn profile.
 </p>
 </div>

 {hasCredential ? (
 <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-[#45bfae]/5 rounded-full blur-3xl"></div>
 
 <div className="w-full md:w-64 aspect-[4/3] bg-[#0a0d12] rounded-xl border border-white/5 flex flex-col items-center justify-center p-4 relative">
 <Award size={48} className="text-[#45bfae] mb-2 opacity-80" />
 <div className="text-[10px] font-bold text-white uppercase tracking-widest text-center">Certified Digital Sales Professional</div>
 </div>
 
 <div className="flex-1 z-10">
 <div className="flex items-center gap-2 text-[#45bfae] font-bold text-xs uppercase tracking-widest mb-2">
 <CheckCircle size={14} /> Verified Active
 </div>
 <h2 className="text-2xl font-serif font-bold text-white mb-2">Digital Sales Professional</h2>
 <p className="text-gray-400 text-sm mb-6">
 Issued on {new Date().toLocaleDateString()} • Credential ID: DSS-A792-B41X
 </p>
 
 <div className="flex flex-wrap items-center gap-3">
 <Link href="/dss/verify/DSS-A792-B41X" target="_blank" className="px-5 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-sm rounded-xl transition-colors shadow-lg flex items-center gap-2">
 <Share2 size={16} /> Share Credential
 </Link>
 <button className="px-5 py-2.5 bg-white/5 text-white hover:bg-white/10 font-bold text-sm rounded-xl border border-white/10 transition-colors flex items-center gap-2">
 <Download size={16} /> Download PDF
 </button>
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-[#0a0d12] border border-white/5 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-6">
 <Award size={32} />
 </div>
 <h2 className="text-xl font-bold text-white mb-2">No Credentials Yet</h2>
 <p className="text-gray-500 max-w-md mx-auto mb-8">
 You have not earned any verifiable credentials. Complete the curriculum and pass the AI Assessment to unlock your certificate.
 </p>
 <Link href="/dss/examinations" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10">
 Go to Examinations
 </Link>
 </div>
 )}
 </div>
 );
}
