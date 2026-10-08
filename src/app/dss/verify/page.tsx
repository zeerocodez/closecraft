'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, ArrowLeft } from 'lucide-react';

export default function CertificateVerificationPage() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/dss/verify/${encodeURIComponent(code.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 relative font-sans flex flex-col">
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
          <Link href="/dss" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Academy
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="w-full max-w-xl relative z-10">
          <div className="text-center mb-10">
            <ShieldCheck size={48} className="text-[#2ea043] mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">Verify a Certificate</h1>
            <p className="text-gray-400 text-lg">
              Enter the unique certificate ID found on the digital or printed certificate to verify its authenticity.
            </p>
          </div>

          <form onSubmit={handleVerify} className="bg-[#161b22] p-8 rounded-2xl border border-white/5 shadow-2xl">
            <div className="mb-6 relative">
              <label htmlFor="code" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Certificate ID</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. DSS-2026-X79AB9"
                  className="w-full bg-[#0d1117] border border-gray-700 focus:border-[#2ea043] rounded-xl py-4 pl-12 pr-4 text-white text-lg transition-colors outline-none font-mono"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full py-4 bg-[#2ea043] hover:bg-[#3fb950] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-[#2ea043]/20 flex items-center justify-center gap-2 text-lg"
            >
              Check Records
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-8">
            This verification portal accesses the live cryptographic ledger of Zeerocodes Automation Limited.
          </p>
        </div>
      </main>
    </div>
  );
}
