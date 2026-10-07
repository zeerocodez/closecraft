import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import { z } from 'zod';
import { escapeHtml } from '@/lib/security';

const auditFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  business: z.string().trim().min(2, "Business name is required").max(200),
  email: z.string().trim().max(254).email("Invalid email address"),
  phone: z.string().max(40).optional(),
  website: z.string().max(500).optional(),
  monthlyLeadVolume: z.string().trim().min(1, "Lead volume is required").max(100),
  biggestSalesBottleneck: z.string().trim().min(1, "Bottleneck is required").max(2000)
});

export async function POST(request: Request) {
  try {
    // Shared database budget cannot be evaded by spoofing proxy/IP headers.
    const bucket = Math.floor(Date.now() / 60000);
    const budget = await db.publicFormRateLimit.upsert({
      where: { key: `marketing:${bucket}` },
      create: { key: `marketing:${bucket}`, expiresAt: new Date((bucket + 1) * 60000) },
      update: { count: { increment: 1 } },
    });
    if (budget.count > 20) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 16000) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    // Validate with Zod
    const result = auditFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: result.error.issues
      }, { status: 400 });
    }

    const { name, business, email, phone, website, monthlyLeadVolume, biggestSalesBottleneck } = result.data;

    // Store custom data
    const customData = JSON.stringify({
      business,
      website,
      monthlyLeadVolume,
      biggestSalesBottleneck
    });

    await db.lead.create({
      data: {
        organizationId: null,
        type: 'MARKETING_LEAD',
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        message: `Revenue Audit Request from ${business}. Volume: ${monthlyLeadVolume}. Bottleneck: ${biggestSalesBottleneck}`,
        source: 'Website Revenue Audit Form',
        status: 'NEW',
        buyingIntent: 85, // High intent if they request an audit
        qualificationData: {
          create: {
            customData
          }
        }
      },
    });

    // Send a transactional email welcoming the new applicant
    await sendTransactionalEmail({
      to: email.toLowerCase().trim(),
      subject: 'Revenue Audit Request Received - Zeerocodes',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #789d2e;">Audit Request Received</h2>
          <p>Hi ${escapeHtml(name.trim().split(' ')[0])},</p>
          <p>We've received your request for a Revenue Audit for <strong>${escapeHtml(business.trim())}</strong>.</p>
          <p>Our team is reviewing your details regarding your current lead volume (${escapeHtml(monthlyLeadVolume)}) and the bottleneck you're experiencing (${escapeHtml(biggestSalesBottleneck)}).</p>
          <p>You will hear from us shortly to schedule your audit call.</p>
          <p>Best,<br>Zeerocodes Revenue Engine</p>
        </div>
      `
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
