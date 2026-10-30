import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DSSLogo } from '@/components/ui/Logo';
import { renderEmail } from '@/lib/email/service';
import EmailPreviewClient, { ALL_TEMPLATES } from './EmailPreviewClient';

export default async function DSSAdminEmailsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.closecrafthq.com';

  // Synthetic sample data for all 21 templates
  const syntheticDataset: Record<string, any> = {
    'CC-01': {
      firstName: 'Alex',
      verificationUrl: `${baseUrl}/verify?token=synthetic_token_demo_only`,
      verificationExpiryDescription: 'in 24 hours',
    },
    'CC-02': {
      firstName: 'Alex',
      workspaceName: 'Acme Growth Labs',
      trialEndDatetime: '7 November 2026 at 18:00 WAT',
      dashboardUrl: `${baseUrl}/dashboard`,
      supportUrl: `${baseUrl}/support`,
    },
    'CC-03': {
      firstName: 'Alex',
      workspaceName: 'Acme Growth Labs',
      trialEndDatetime: 'tomorrow at 18:00 WAT',
      billingUrl: `${baseUrl}/billing`,
    },
    'CC-04': {
      firstName: 'Alex',
      workspaceName: 'Acme Growth Labs',
      trialEndDatetime: '6 November 2026 at 18:00 WAT',
      billingUrl: `${baseUrl}/billing`,
      supportUrl: `${baseUrl}/support`,
    },
    'CC-05': {
      firstName: 'Alex',
      workspaceName: 'Acme Growth Labs',
      planName: 'Starter',
      billingPeriod: 'Monthly',
      amountPaid: '₦20,000',
      paymentReference: 'PAY-CC-98234-SYNTH',
      dashboardUrl: `${baseUrl}/dashboard`,
      billingUrl: `${baseUrl}/billing`,
    },
    'CC-06': {
      firstName: 'Alex',
      workspaceName: 'Acme Growth Labs',
      amountDue: '₦20,000',
      billingUrl: `${baseUrl}/billing`,
      supportUrl: `${baseUrl}/support`,
      orderReference: 'ORD-CC-77123',
    },
    'CC-07': {
      firstName: 'Alex',
      workspaceName: 'Acme Growth Labs',
      accessEndDatetime: '30 November 2026 at 23:59 WAT',
      recurringBillingDisabled: true,
      billingUrl: `${baseUrl}/billing`,
      supportUrl: `${baseUrl}/support`,
    },
    'CC-08': {
      firstName: 'Alex',
      resetUrl: `${baseUrl}/reset-password?token=synthetic_token_demo_only`,
      resetExpiryDescription: 'in 1 hour',
    },
    'CC-09': {
      firstName: 'Alex',
      securityEventDatetime: '30 October 2026 at 14:15 WAT',
      accountRecoveryUrl: `${baseUrl}/security/recover`,
      supportUrl: `${baseUrl}/support`,
    },
    'CC-10': {
      firstName: 'Jordan',
      inviterName: 'Alex Rivera',
      workspaceName: 'Acme Growth Labs',
      invitedRoleLabel: 'Pipeline Setter',
      invitationUrl: `${baseUrl}/invite/accept?token=synthetic_invite_demo`,
      invitationExpiryDatetime: '6 November 2026 at 23:59 WAT',
    },

    // DSS by Closecraft Templates
    'DSS-01': {
      firstName: 'Adeola',
      programmeName: 'DSS Four-Week Remote Sales Sprint',
      cohortName: 'Cohort 001',
      reviewRequired: true,
      applicationUrl: `${baseUrl}/dss/apply`,
      applicationReference: 'DSS-APP-48291',
    },
    'DSS-02': {
      firstName: 'Adeola',
      programmeName: 'Setters Route',
      cohortName: 'Cohort 001',
      offerUrl: `${baseUrl}/dss/checkout?code=cohort001`,
      offerExpiryDatetime: '5 November 2026 at 18:00 WAT',
      supportUrl: `${baseUrl}/dss/support`,
    },
    'DSS-03': {
      firstName: 'Adeola',
      programmeName: 'Setters Route',
      cohortName: 'Cohort 001',
      originalFee: '₦100,000',
      earlyBirdApplied: true,
      discountAmount: '₦50,000',
      amountPaid: '₦50,000',
      paymentReference: 'PAY-DSS-883719',
      orderReference: 'DSS-ORD-17933-2819',
      enrolmentStatus: 'ACTIVE',
      receiptUrl: `${baseUrl}/dss/dashboard?order=DSS-ORD-17933-2819`,
      supportUrl: `${baseUrl}/dss/support`,
    },
    'DSS-04': {
      firstName: 'Adeola',
      programmeName: 'Setters Route',
      cohortName: 'Cohort 001',
      dashboardUrl: `${baseUrl}/dss/dashboard`,
      isStartConfirmed: false,
    },
    'DSS-05': {
      firstName: 'Adeola',
      cohortName: 'Cohort 001',
      scheduleActionLabel: 'confirmed',
      scheduleUrl: `${baseUrl}/dss/dashboard/schedule`,
      displayTimezone: 'West Africa Time (WAT)',
    },
    'DSS-06': {
      firstName: 'Adeola',
      sessionTitle: 'Workshop 1: Calibrated 60-Second Value Pitch & Account Research',
      sessionDatetime: 'Monday, 3 November 2026 at 19:00 WAT',
      programmeName: 'Setters Route',
      sessionUrl: `${baseUrl}/dss/dashboard/workshops/1`,
      approvedPreparationNote: 'Review ICP research template in your student manual before joining.',
    },
    'DSS-07': {
      firstName: 'Adeola',
      assignmentTitle: 'Sprint Group 1: 60-Second Audio Pitch Submission',
      feedbackUrl: `${baseUrl}/dss/dashboard/submissions/grp-1`,
      revisionRequested: false,
    },
    'DSS-08': {
      firstName: 'Adeola',
      programmeName: 'DSS Four-Week Remote Sales Sprint',
      completionReviewUrl: `${baseUrl}/dss/dashboard/completion-review`,
      revisionDueDatetime: '10 November 2026 at 18:00 WAT',
    },
    'DSS-09': {
      firstName: 'Adeola',
      programmeName: 'Setters Route (DSS-SDR)',
      certificateUrl: `${baseUrl}/dss/verify/CERT-DSS-2026-ADEOLA`,
    },
    'DSS-10': {
      firstName: 'Adeola',
      programmeName: 'Setters Route',
      orderUrl: `${baseUrl}/dss/checkout?route=dss-setters-route`,
      supportUrl: `${baseUrl}/dss/support`,
      orderReference: 'DSS-ORD-17933-2819',
    },
    'DSS-11': {
      firstName: 'Adeola',
      programmeName: 'Setters Route',
      orderReference: 'DSS-ORD-17933-2819',
      refundReference: 'REF-DSS-9921',
      refundAmount: '₦50,000',
      refundProcessedDatetime: '30 October 2026',
      refundDetailsUrl: `${baseUrl}/dss/dashboard`,
      supportUrl: `${baseUrl}/dss/support`,
    },
  };

  // Render previews for all 21 templates
  const previews: Record<string, { subject: string; preheader: string; html: string; text: string }> = {};

  for (const tmpl of ALL_TEMPLATES) {
    const data = syntheticDataset[tmpl.id] || {};
    try {
      const rendered = renderEmail(tmpl.id, data);
      previews[tmpl.id] = {
        subject: rendered.subject,
        preheader: rendered.preheader,
        html: rendered.html,
        text: rendered.text,
      };
    } catch (err: any) {
      previews[tmpl.id] = {
        subject: `[Render Error] ${tmpl.id}`,
        preheader: '',
        html: `<p style="color:red;">Error rendering ${tmpl.id}: ${err.message}</p>`,
        text: `Error rendering ${tmpl.id}: ${err.message}`,
      };
    }
  }

  // Fetch recent transactional email logs
  const emailLogs = await db.transactionalEmailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const senderConfig = {
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'info@closecrafthq.com',
    hasApiKey: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_key'),
    isTestMode: process.env.EMAIL_TEST_MODE === 'true',
    allowlist: (process.env.EMAIL_ALLOWLIST || '').split(',').map((e) => e.trim()).filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-[#071126] text-[#F3F7FA] font-sans">
      {/* Top Header */}
      <header className="bg-[#071126]/90 backdrop-blur-xl border-b border-white/10 h-16 flex items-center px-6 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DSSLogo variant="icon" size="sm" alt="Digital Sales School" />
            <span className="font-bold text-white text-base sm:text-lg">Transactional Email System</span>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-xs font-bold">
              <Link href="/dss/admin" className="text-[#94A3B8] hover:text-white py-5">
                Curriculum
              </Link>
              <Link href="/dss/admin/students" className="text-[#94A3B8] hover:text-white py-5">
                Students
              </Link>
              <Link href="/dss/admin/campaigns" className="text-[#94A3B8] hover:text-white py-5">
                Campaigns
              </Link>
              <Link
                href="/dss/admin/emails"
                className="text-[#38BDF8] border-b-2 border-[#38BDF8] py-5"
              >
                Email Previews
              </Link>
            </nav>

            <Link
              href="/dss"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold border border-white/10"
            >
              &larr; View Landing Page
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8] bg-[#0066FF]/10 px-3 py-1 rounded-full border border-[#0066FF]/30 mb-2">
            <Mail size={13} /> Multi-Brand Transactional Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Email Template Gallery & Test Console
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            21 responsive HTML templates with plain-text parity, deduplication key enforcement, and test allowlisting.
          </p>
        </div>

        <EmailPreviewClient
          previews={previews}
          emailLogs={emailLogs}
          senderConfig={senderConfig}
        />
      </main>
    </div>
  );
}
