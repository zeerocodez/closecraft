import { NextResponse } from 'next/server';
import { recordEnquiry } from '@/lib/dss/affiliate-store';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 10 enquiry submissions per 10 minutes per IP
  const ip = clientIp(req);
  const limiter = await rateLimit(`dss-enquiry:${ip}`, 10, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { name, email, phone, goal, route, referral, consent, website } = body;

    // Honeypot spam trap
    if (website) {
      return NextResponse.json({ success: true, message: 'Received' });
    }

    if (!name || !email || !goal) {
      return NextResponse.json({ error: 'Name, email, and learning goal are required' }, { status: 400 });
    }

    if (consent === false) {
      return NextResponse.json({ error: 'Consent to admissions processing is required' }, { status: 400 });
    }

    const enquiry = await recordEnquiry({
      name,
      email,
      phone,
      goal,
      route,
      referral: referral || undefined,
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error: unknown) {
    console.error('DSS enquiry submission error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit enquiry';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
