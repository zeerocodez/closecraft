import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, business, email, phone, website, monthlyLeadVolume, biggestSalesBottleneck } = body;

    // Strict input validation
    if (!name || typeof name !== 'string' || 
        !email || typeof email !== 'string' || !email.includes('@') ||
        !business || typeof business !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

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

    const lead = await db.lead.create({
      data: {
        organizationId: org.id,
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
          <p>Hi ${name.trim().split(' ')[0]},</p>
          <p>We've received your request for a Revenue Audit for <strong>${business.trim()}</strong>.</p>
          <p>Our team is reviewing your details regarding your current lead volume (${monthlyLeadVolume}) and the bottleneck you're experiencing (${biggestSalesBottleneck}).</p>
          <p>You will hear from us shortly to schedule your audit call.</p>
          <p>Best,<br>Zeerocodes Revenue Engine</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
