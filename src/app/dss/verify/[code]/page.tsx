import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CheckCircle, XCircle, Calendar, User, Award, Check, Search } from 'lucide-react';

export default function CertificateResultPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const isValid = code.toUpperCase().startsWith('DSS-');

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 relative font-sans flex flex-col">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dss" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-[#2ea043] flex items-center justify-center text-white font-bold">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight block leading-tight">Zeerocodes DSS</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Credential Verification</span>
            </div>
          </Link>
          <Link href="/dss/verify" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Search Again
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        <div className="w-full max-w-3xl">
          
          {isValid ? (
            <div className="bg-[#161b22] p-8 md:p-12 rounded-2xl border-2 border-[#2ea043]/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2ea043]"></div>
              
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-24 h-24 rounded-full bg-[#2ea043]/10 flex items-center justify-center shrink-0 border border-[#2ea043]/20">
                  <CheckCircle size={48} className="text-[#2ea043]" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[#2ea043] font-bold text-sm tracking-wide uppercase mb-2">
                    <Check size={16} /> Verified Authentic
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-serif">Digital Sales Professional</h1>
                  <p className="text-gray-400 text-lg mb-6">Credential ID: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded">{code.toUpperCase()}</span></p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#0d1117] p-6 rounded-xl border border-gray-800">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><User size={12} /> Issued To</div>
                      <div className="font-bold text-white text-lg">Alex Chinedu</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Calendar size={12} /> Issue Date</div>
                      <div className="font-bold text-white text-lg">October 7, 2026</div>
                    </div>
                    <div className="sm:col-span-2 pt-4 border-t border-gray-800">
                      <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Award size={12} /> Issuer</div>
                      <div className="font-bold text-white">Zeerocodes Automation Limited</div>
                      <div className="text-sm text-gray-400 mt-1">Digital Sales School (DSS)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] p-8 md:p-12 rounded-2xl border-2 border-red-500/30 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto mb-6">
                <XCircle size={48} className="text-red-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">Credential Not Found</h1>
              <p className="text-gray-400 text-lg mb-6 max-w-lg mx-auto">
                We could not find any official Zeerocodes DSS records matching the ID: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded">{code}</span>
              </p>
              
              <Link href="/dss/verify" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors">
                <Search size={18} /> Search Again
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
