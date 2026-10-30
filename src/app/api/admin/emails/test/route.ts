import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { sendTransactionalEmailEvent } from '@/lib/email/service';
import { ClosecraftTemplateId, DSSTemplateId } from '@/lib/email/types';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`admin-email-test:${ip}`, 10, 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Too many test emails requested. Please wait a minute.' }, { status: 429 });
  }

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { templateId, recipientEmail } = body;

    const cleanEmail = typeof recipientEmail === 'string' ? recipientEmail.trim().toLowerCase() : '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Valid recipient email address is required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.closecrafthq.com';

    // Synthetic test data payload
    const testData: Record<string, any> = {
      firstName: session.user.name?.split(' ')[0] || 'Tester',
      workspaceName: 'Demo Workspace',
      programmeName: 'Setters Route',
      cohortName: 'Cohort 001',
      originalFee: '₦100,000',
      earlyBirdApplied: true,
      discountAmount: '₦50,000',
      amountPaid: '₦50,000',
      amountDue: '₦20,000',
      planName: 'Starter',
      billingPeriod: 'Monthly',
      paymentReference: `TEST-PAY-${Date.now()}`,
      orderReference: `TEST-ORD-${Date.now()}`,
      verificationUrl: `${baseUrl}/verify?token=demo_test_token`,
      resetUrl: `${baseUrl}/reset-password?token=demo_test_token`,
      dashboardUrl: `${baseUrl}/dashboard`,
      billingUrl: `${baseUrl}/billing`,
      supportUrl: `${baseUrl}/support`,
      applicationUrl: `${baseUrl}/dss/apply`,
      applicationReference: `DSS-TEST-${Date.now()}`,
      offerUrl: `${baseUrl}/dss/checkout`,
      receiptUrl: `${baseUrl}/dss/dashboard`,
      scheduleUrl: `${baseUrl}/dss/dashboard`,
      sessionUrl: `${baseUrl}/dss/dashboard`,
      sessionTitle: 'Workshop 1: Calibrated 60-Second Value Pitch',
      sessionDatetime: 'Monday at 19:00 WAT',
      displayTimezone: 'West Africa Time (WAT)',
      assignmentTitle: 'Sprint Group 1 Submission',
      feedbackUrl: `${baseUrl}/dss/dashboard`,
      completionReviewUrl: `${baseUrl}/dss/dashboard`,
      certificateUrl: `${baseUrl}/dss/verify/CERT-TEST-DEMO`,
      orderUrl: `${baseUrl}/dss/dashboard`,
      refundReference: `REF-TEST-${Date.now()}`,
      refundAmount: '₦50,000',
      refundProcessedDatetime: new Date().toLocaleDateString('en-GB'),
      refundDetailsUrl: `${baseUrl}/dss/dashboard`,
      trialEndDatetime: 'in 7 days at 18:00 WAT',
      securityEventDatetime: new Date().toLocaleDateString('en-GB'),
      accountRecoveryUrl: `${baseUrl}/security/recover`,
      inviterName: session.user.name || 'Admin',
      invitedRoleLabel: 'Member',
      invitationUrl: `${baseUrl}/invite/accept?token=demo`,
      invitationExpiryDatetime: 'in 7 days',
    };

    const result = await sendTransactionalEmailEvent({
      templateId: templateId as ClosecraftTemplateId | DSSTemplateId,
      recipientEmail: cleanEmail,
      recipientName: session.user.name || 'Test User',
      data: testData,
      deduplicationKey: `test-${templateId}-${cleanEmail}-${Date.now()}`,
      sourceEvent: 'ADMIN_TEST_DISPATCH',
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Admin Email Test Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to dispatch test email' }, { status: 500 });
  }
}
