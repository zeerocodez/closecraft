import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Calendar, User, Award, Check, Search, ShieldCheck } from 'lucide-react';
import { DSSLogo } from '@/components/ui/Logo';
import { getVerifiableCredentialByCode } from '@/lib/practice/credentials';

export const metadata = {
  title: 'Verify Credential | Digital Sales School (DSS)',
  description: 'Public verification of assessed practical competence credentials.',
};

export default async function CertificateResultPage({
  params,
}: {
  params: Promise<{ code: string }> | { code: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const code = decodeURIComponent(resolvedParams.code).trim().toUpperCase();

  const credential = await getVerifiableCredentialByCode(code).catch(() => null);

  const isAuthentic = credential && credential.status === 'ACTIVE' && credential.isPublicOptIn;

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 relative font-sans flex flex-col">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dss" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <DSSLogo variant="full" size="md" alt="Digital Sales School" />
          </Link>
          <Link
            href="/dss/verify"
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Search Another Record
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        <div className="w-full max-w-3xl">
          {isAuthentic ? (
            <div className="bg-[#161b22] p-8 md:p-12 rounded-2xl border-2 border-[#2ea043]/30 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2ea043]" />

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-20 h-20 rounded-full bg-[#2ea043]/10 flex items-center justify-center shrink-0 border border-[#2ea043]/20">
                  <CheckCircle size={44} className="text-[#2ea043]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[#2ea043] font-bold text-xs tracking-wider uppercase mb-1">
                    <Check size={16} /> Verified Authentic Credential
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {credential.trackTitle}
                  </h1>
                  <p className="text-gray-400 text-sm font-mono">
                    Credential ID:{' '}
                    <span className="text-white bg-gray-800 px-2 py-0.5 rounded font-bold">
                      {credential.uniqueCode}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0d1117] p-6 rounded-xl border border-gray-800 text-sm">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                    <User size={13} /> Issued To
                  </div>
                  <div className="font-bold text-white text-base">
                    {credential.user?.name || 'Verified Sales Representative'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                    <Calendar size={13} /> Issue Date
                  </div>
                  <div className="font-bold text-white text-base">
                    {new Date(credential.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                    <ShieldCheck size={13} /> Assessed Performance
                  </div>
                  <div className="font-bold text-emerald-400 text-base font-mono">
                    {credential.verifiedScore} / 16 Points (Passed Capstone Threshold)
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Evaluated Rubric: {credential.criterionVersion}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                    <User size={13} /> Reviewing Authority
                  </div>
                  <div className="font-bold text-white text-base">
                    {credential.reviewer?.name || 'Authorised DSS Trainer'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Zeerocodes Automation Limited
                  </div>
                </div>

                <div className="sm:col-span-2 pt-3 border-t border-gray-800 text-xs text-gray-400 leading-relaxed">
                  <strong>Verification Notice:</strong> This internal credential verifies assessed practical competence demonstrated in controlled buyer simulations evaluated against the 8-criterion Digital Sales School rubric. It does not represent external university accreditation or guarantee employment.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] p-8 md:p-12 rounded-2xl border-2 border-red-500/30 shadow-2xl relative overflow-hidden text-center space-y-5">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />

              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto">
                <XCircle size={44} className="text-red-500" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Credential Not Found</h1>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                  We could not find an active, verified Digital Sales School completion record matching the identifier:{' '}
                  <span className="font-mono text-white bg-gray-800 px-2 py-0.5 rounded font-bold">
                    {code}
                  </span>
                </p>
              </div>

              <Link
                href="/dss/verify"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                <Search size={15} /> Search Again
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
