import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import { z } from 'zod';
import { inngest } from '@/lib/inngest/client';
import { rateLimit, clientIp } from '@/lib/rateLimit';

const auditFormSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  business: z.string().min(2, "Business name is required").max(120),
  email: z.string().email("Invalid email address").max(180),
  phone: z.string().max(40).optional(),
  website: z.string().max(200).optional(),
  monthlyLeadVolume: z.string().min(1, "Lead volume is required").max(100),
  biggestSalesBottleneck: z.string().min(1, "Bottleneck is required").max(300),
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
    const result = auditFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, business, email, phone, website, monthlyLeadVolume, biggestSalesBottleneck } = result.data;

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
        where: { slug: { in: ['zeerocodes', 'closecraft', 'closecraft-hq'] } },
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

    // Store custom data
    const customData = JSON.stringify({
      business,
      website,
      monthlyLeadVolume,
      biggestSalesBottleneck,
      phone,
    });

    // Directly persist lead to the database (Single Source of Truth)
    const lead = await db.lead.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        source: 'Website Revenue Audit Form',
        message: `Revenue Audit Request from ${business}. Volume: ${monthlyLeadVolume}. Bottleneck: ${biggestSalesBottleneck}`,
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
      await sendTransactionalEmail({
        to: email.toLowerCase().trim(),
        subject: 'Revenue Audit Request Received - Zeerocodes',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #789d2e;">Audit Request Received</h2>
            <p>Hi ${name.trim().split(' ')[0]},</p>
            <p>We've received your request for a Revenue Audit for <strong>${business.trim()}</strong>.</p>
            <p>Our team is reviewing your details regarding your current lead volume (${monthlyLeadVolume}) and the bottleneck you're experiencing (${biggestSalesBottleneck}).</p>
            <p>You will hear from us shortly to schedule your audit call.</p>
            <p>Best,<br>Zeerocodes Revenue Engine</p>
          </div>
        `,
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
