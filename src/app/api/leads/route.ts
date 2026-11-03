import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import { dispatchNotificationAlert } from '@/lib/notifications/router';
import { z } from 'zod';
import { inngest } from '@/lib/inngest/client';
import { rateLimit, clientIp } from '@/lib/rateLimit';

const leadFormSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  business: z.string().min(2, "Business name is required").max(120),
  email: z.string().email("Invalid email address").max(180),
  phone: z.string().max(40).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
  formType: z.string().optional().nullable(),
  monthlyLeadVolume: z.string().max(100).optional().nullable(),
  biggestSalesBottleneck: z.string().max(300).optional().nullable(),
  serviceInterest: z.string().max(100).optional().nullable(),
  needDescription: z.string().max(1000).optional().nullable(),
  teamSize: z.string().max(100).optional().nullable(),
  trainingObjective: z.string().max(300).optional().nullable(),
  whatYouSell: z.string().max(300).optional().nullable(),
  workloadVolume: z.string().max(100).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.formType === 'SERVICE_ENQUIRY') {
    if (!data.serviceInterest || data.serviceInterest.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['serviceInterest'],
        message: 'Please select a service interest',
      });
    }
    if (!data.needDescription || data.needDescription.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['needDescription'],
        message: 'Please provide a brief description of your need',
      });
    }
  } else {
    if (!data.monthlyLeadVolume || data.monthlyLeadVolume.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monthlyLeadVolume'],
        message: 'Lead volume is required',
      });
    }
    if (!data.biggestSalesBottleneck || data.biggestSalesBottleneck.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['biggestSalesBottleneck'],
        message: 'Bottleneck is required',
      });
    }
  }
});

export async function POST(request: Request) {
  // Rate limit: max 10 requests per 10 minutes per IP to prevent spam and resource exhaustion
  const ip = clientIp(request);
  const limiter = await rateLimit(`marketing-leads-form:${ip}`, 10, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions from this address. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    // Honeypot spam check
    if (body.hpField || body.company_fax) {
      return NextResponse.json({ success: true, message: 'Enquiry received successfully.' }, { status: 201 });
    }

    // Validate with Zod
    const result = leadFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      name,
      business,
      email,
      phone,
      website,
      monthlyLeadVolume,
      biggestSalesBottleneck,
      formType,
      serviceInterest,
      needDescription,
      teamSize,
      trainingObjective,
      whatYouSell,
      workloadVolume,
    } = result.data;

    // Server-bound tenant isolation: authenticate caller or resolve explicit workspace slug
    const { auth } = await import('@/lib/auth');
    const session = await auth().catch(() => null);
    let targetOrgId = session?.organizationId;

    if (!targetOrgId && (body.workspaceSlug || body.organizationSlug)) {
      const targetSlug = String(body.workspaceSlug || body.organizationSlug).trim();
      const matchedOrg = await db.organization.findUnique({
        where: { slug: targetSlug },
        select: { id: true }
      });
      if (matchedOrg) targetOrgId = matchedOrg.id;
    }

    if (!targetOrgId) {
      // Find dedicated platform acquisition tenant, never randomly fall back to customer workspaces
      const platformOrg = await db.organization.findFirst({
        where: { slug: { in: ['zeerocodes', 'closecraft', 'closecraft-hq', 'main', 'default'] } },
        select: { id: true }
      }) || await db.organization.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true }
      });
      targetOrgId = platformOrg?.id;
    }

    if (!targetOrgId) {
      return NextResponse.json(
        { error: 'Tenant routing required. Please specify a verified workspaceSlug or submit leads from your authenticated workspace.' },
        { status: 400 }
      );
    }

    // Determine submission type and structured metadata
    let submissionType = 'REVENUE_AUDIT';
    let leadSource = 'Website Revenue Audit Form';
    let leadMessage = '';

    if (formType === 'SERVICE_ENQUIRY') {
      const sanitizedInterest = serviceInterest?.trim() || 'General';
      submissionType = `SERVICE_ENQUIRY_${sanitizedInterest.toUpperCase().replace(/\s+/g, '_')}`;
      leadSource = `Website Service Enquiry (${sanitizedInterest})`;
      leadMessage = `Service Enquiry: ${sanitizedInterest} from ${business.trim()}.\nNeed: ${needDescription?.trim() || 'N/A'}${
        teamSize ? `\nTeam Size: ${teamSize}` : ''
      }${
        trainingObjective ? `\nTraining Objective: ${trainingObjective}` : ''
      }${
        whatYouSell ? `\nBusiness Offer / Sells: ${whatYouSell}` : ''
      }${
        workloadVolume ? `\nEstimated Workload: ${workloadVolume}` : ''
      }`;
    } else if (formType === 'MANAGED_SALES') {
      submissionType = 'MANAGED_SALES_PROPOSAL';
      leadSource = 'Managed Sales Proposal Request';
      leadMessage = `Managed Sales Proposal Request from ${business.trim()}. Volume: ${monthlyLeadVolume || 'N/A'}. Follow-up problem: ${biggestSalesBottleneck || 'N/A'}`;
    } else {
      submissionType = 'REVENUE_AUDIT';
      leadSource = 'Website Revenue Audit Form';
      leadMessage = `Revenue Audit Request from ${business.trim()}. Volume: ${monthlyLeadVolume || 'N/A'}. Follow-up problem: ${biggestSalesBottleneck || 'N/A'}`;
    }

    const customData = JSON.stringify({
      business: business.trim(),
      website: website?.trim() || null,
      phone: phone ? phone.trim() : null,
      submissionType,
      formType: formType || 'REVENUE_AUDIT',
      serviceInterest: serviceInterest || null,
      needDescription: needDescription || null,
      teamSize: teamSize || null,
      trainingObjective: trainingObjective || null,
      whatYouSell: whatYouSell || null,
      workloadVolume: workloadVolume || null,
      monthlyLeadVolume: monthlyLeadVolume || null,
      biggestSalesBottleneck: biggestSalesBottleneck || null,
    });

    // Directly persist lead to the database (Single Source of Truth)
    const lead = await db.lead.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        source: leadSource,
        message: leadMessage,
        status: 'NEW',
        organizationId: targetOrgId,
      },
    });

    // Directly evaluate via RevenueEngine for immediate intelligence
    try {
      const { RevenueEngine } = await import('@/lib/revenue-engine/engine');
      await RevenueEngine.processNewLead(lead.id);
    } catch (engineErr) {
      console.warn('[Leads API] RevenueEngine evaluation notice:', engineErr);
    }

    // If this is an active service enquiry, pause conflicting marketing promotional messages
    if (formType === 'SERVICE_ENQUIRY') {
      try {
        const { pauseForServiceEnquiry } = await import('@/lib/marketing/welcomeSequence');
        await pauseForServiceEnquiry(email.toLowerCase().trim(), 'Service Enquiry Submitted');
      } catch {
        // Non-blocking
      }
    }

    // Fire event to Inngest background bus if available
    try {
      await inngest.send({
        name: 'revenue/lead.created',
        data: {
          leadId: lead.id,
          organizationId: targetOrgId,
          name: lead.name,
          email: lead.email,
          source: lead.source,
          message: lead.message,
          customData,
        },
      });
    } catch (inngestErr) {
      console.warn('[Leads API] Inngest event dispatch failed (lead safely persisted to DB):', inngestErr);
    }

    // Send a transactional email welcoming the new applicant
    try {
      const isServiceEnquiry = formType === 'SERVICE_ENQUIRY';
      const emailSubject = isServiceEnquiry
        ? `Service Enquiry Received - Closecraft (${serviceInterest || 'Sales Support'})`
        : 'Revenue Audit Request Received - Closecraft';

      const emailHtml = isServiceEnquiry
        ? `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #248277;">Service Enquiry Received</h2>
            <p>Hi ${name.trim().split(' ')[0]},</p>
            <p>We've received your enquiry regarding <strong>${serviceInterest || 'Sales Support'}</strong> for <strong>${business.trim()}</strong>.</p>
            <p>Our sales solutions team is reviewing your requirements and will reach out to discuss working arrangements, scope, and next steps.</p>
            <p style="font-size: 12px; color: #666; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
              Submitting this enquiry does not commit you to a paid plan or managed service. Scope and commercial terms are confirmed before any engagement begins.
            </p>
            <p>Best regards,<br>Closecraft Team</p>
          </div>
        `
        : `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #248277;">Audit Request Received</h2>
            <p>Hi ${name.trim().split(' ')[0]},</p>
            <p>We've received your request for a Revenue Audit for <strong>${business.trim()}</strong>.</p>
            <p>Our team is reviewing your details regarding your current lead volume (${monthlyLeadVolume || 'N/A'}) and the bottleneck you're experiencing (${biggestSalesBottleneck || 'N/A'}).</p>
            <p>You will hear from us shortly to schedule your audit call.</p>
            <p>Best regards,<br>Closecraft Team</p>
          </div>
        `;

      await sendTransactionalEmail({
        to: email.toLowerCase().trim(),
        subject: emailSubject,
        html: emailHtml,
      });

      // Dispatch alert to Sales & Admin inboxes (sales@closecrafthq.com, info@closecrafthq.com)
      const leadNotes = needDescription || biggestSalesBottleneck || 'None provided';
      await dispatchNotificationAlert({
        category: 'SALES',
        subject: `🔔 New Lead / Audit Request: ${name} (${business})`,
        text: `New Lead Submitted!\n\nName: ${name}\nBusiness: ${business}\nEmail: ${email}\nPhone: ${phone || 'None'}\nDetails: ${leadNotes}\n\nView in Closecraft: https://www.closecrafthq.com/leads`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #248277;">🔔 New Lead / Revenue Audit Enquiry</h2>
          <div style="background: #f4f6f8; border-left: 4px solid #248277; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${name} (${business})</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #444;">Email: <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #444;">Phone: <strong>${phone || 'Not provided'}</strong></p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #555;">Details / Bottleneck: ${leadNotes}</p>
          </div>
          <p><a href="https://www.closecrafthq.com/leads" style="background: #248277; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View Leads in CRM &rarr;</a></p>
        </div>`,
      });
    } catch (emailErr) {
      console.warn('[Leads API] Email dispatch failed:', emailErr);
    }

    return NextResponse.json({ success: true, lead: { id: lead.id, name: lead.name } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
