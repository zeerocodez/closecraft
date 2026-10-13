import { NextResponse } from 'next/server';
import { recordEnquiry } from '@/lib/dss/affiliate-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, goal, referral, consent, website } = body;

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
      referral: referral || undefined,
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    console.error('DSS enquiry submission error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to submit enquiry' }, { status: 500 });
  }
}
