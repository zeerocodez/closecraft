import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import { z } from 'zod';
import { inngest } from '@/lib/inngest/client';

const auditFormSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  business: z.string().min(2, "Business name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().optional(),
  monthlyLeadVolume: z.string().min(1, "Lead volume is required"),
  biggestSalesBottleneck: z.string().min(1, "Bottleneck is required")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const result = auditFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: result.error.issues 
      }, { status: 400 });
    }

    const { name, business, email, phone, website, monthlyLeadVolume, biggestSalesBottleneck } = result.data;

    // A Lead must belong to an organization. 
    let org = await db.organization.findFirst({
      where: { slug: 'acme-corp' } // fallback to demo org
    });
    
    if (!org) {
      org = await db.organization.findFirst();
    }
    
    if (!org) {
      console.error('[Leads API] Cannot create lead: No organization exists in the system to own this lead.');
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    // Store custom data
    const customData = JSON.stringify({
      business,
      website,
      monthlyLeadVolume,
      biggestSalesBottleneck
    });

    // Fire event to Inngest background bus. 
    // The background job will create the lead via the DAL and trigger AI qualification.
    await inngest.send({
      name: 'revenue/lead.created',
      data: {
        organizationId: org.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        source: 'Website Revenue Audit Form',
        message: `Revenue Audit Request from ${business}. Volume: ${monthlyLeadVolume}. Bottleneck: ${biggestSalesBottleneck}`,
        customData
      }
    });

    // Send a transactional email welcoming the new applicant
    await sendTransactionalEmail({
      to: email.toLowerCase().trim(),
      subject: 'Revenue Audit Request Received - Zeerocodes',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #789d2e;">Audit Request Received</h2>
          <p>Hi ${name.trim().split(' ')[0]},</p>
          <p>We've received your request for a Revenue Audit for <strong>${business.trim()}</strong>.</p>
          <p>Our team is reviewing your details regarding your current lead volume (${monthlyLeadVolume}) and the bottleneck you're experiencing (${biggestSalesBottleneck}).</p>
          <p>You will hear from us shortly to schedule your audit call.</p>
          <p>Best,<br>Zeerocodes Revenue Engine</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, lead: { name: name.trim() } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
