import React from 'react';
import { auth, signOut } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PendingApprovalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  let organization = null;

  if (organizationId) {
    organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
      }
    });
  }

  // If approved already, send them straight to dashboard
  if (organization && organization.status === 'APPROVED') {
    redirect('/dashboard');
  }

  const fastTrackUrl = `https://wa.me/2348000000000?text=${encodeURIComponent(
    `Hello CloseCraft Team, I just registered "${organization?.name || 'My Organization'}" for the CloseCraft Pilot and would like to fast-track our verification and WhatsApp activation.`
  )}`;

  return (
    <div className="flex flex-col w-full px-4 md:px-8 py-12 min-h-screen justify-center items-center bg-surface">
      <div className="w-full max-w-xl mx-auto flex flex-col">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-1.5 px-3 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Pending Review</span>
          </span>
        </div>

        {/* Card Container */}
        <div className="relative w-full rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xl p-6 md:p-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-primary to-emerald-500"></div>

          {/* Brand & Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-500">
              <span className="material-symbols-outlined text-[36px]">hourglass_top</span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-xs text-on-surface tracking-wider">CLOSECRAFT</span>
              <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase">
                REVENUE OS
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Your Workspace is Under Review
            </h1>
            <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
              CloseCraft onboards select Nigerian training academies, consulting firms, and sales agencies through vetted pilot cohorts to guarantee dedicated AI capacity.
            </p>
          </div>

          {/* Organization Details Panel */}
          <div className="rounded-xl bg-surface-container-low border border-outline-variant/20 p-4 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
              Application Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-on-surface-variant block">Organization:</span>
                <span className="font-semibold text-on-surface text-sm">{organization?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Work Email:</span>
                <span className="font-semibold text-on-surface text-sm truncate block">{session.user.email}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Workspace Slug:</span>
                <span className="font-mono text-primary font-medium">{organization?.slug || 'pending'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-500 uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[14px]">pending</span>
                  {organization?.status || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Onboarding Steps */}
          <div className="space-y-3 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-secondary">
              What Happens Next
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container/50 border border-outline-variant/10">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-on-surface block">1. Account Registered</span>
                <span className="text-on-surface-variant">Your user identity and workspace credentials have been recorded.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-amber-400 block">2. ICP & Offer Verification (Current Step)</span>
                <span className="text-on-surface-variant">Our engineering team validates your business offer, pricing model, and qualification rules.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container/30 border border-outline-variant/10 opacity-70">
              <div className="w-6 h-6 rounded-full bg-surface-container-high text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-on-surface block">3. Revenue Engine & WhatsApp Activation</span>
                <span className="text-on-surface-variant">Access is granted to the Sales Command Centre, lead queue, and WhatsApp Business API.</span>
              </div>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={fastTrackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Fast-Track via WhatsApp</span>
            </a>

            <Link
              href="/dashboard"
              className="h-11 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Check Status</span>
            </Link>
          </div>

          {/* Sign Out Form */}
          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Signed in as {session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button
                type="submit"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </form>
          </div>

        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-on-surface-variant/60 mt-6">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          <span>Tenant Isolation Enforced • Strict Organizational Admission Control</span>
        </div>

      </div>
    </div>
  );
}
