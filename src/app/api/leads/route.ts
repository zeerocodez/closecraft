import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, experience } = body;

    // Strict input validation
    if (!firstName || typeof firstName !== 'string' || 
        !lastName || typeof lastName !== 'string' || 
        !email || typeof email !== 'string' || !email.includes('@') ||
        !experience || typeof experience !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const name = `${firstName.trim()} ${lastName.trim()}`;
    const message = `Sales Experience: ${experience.trim()}`;

    // A Lead must belong to an organization. 
    // Since this is the public marketing site form, it belongs to the primary CloseCraft tenant.
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

    const lead = await db.lead.create({
      data: {
        organizationId: org.id,
        type: 'MARKETING_LEAD',
        name,
        email: email.toLowerCase().trim(),
        message,
        source: 'Marketing Website Application',
        status: 'NEW',
        buyingIntent: 50,
      },
    });

    // Send a transactional email welcoming the new applicant
    await sendTransactionalEmail({
      to: email.toLowerCase().trim(),
      subject: 'Application Received - CloseCraft Network',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0055FF;">Application Received</h2>
          <p>Hi ${firstName.trim()},</p>
          <p>We've received your application to join the CloseCraft network as a Closer.</p>
          <p>Our AI qualification engine is currently reviewing your profile based on your stated experience level: <strong>${experience.trim()}</strong>.</p>
          <p>You will hear from us shortly with your next steps, including your first assessment in the AI Simulator.</p>
          <p>Best,<br>The CloseCraft Team</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
