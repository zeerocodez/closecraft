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

    // Dispatch alert to DSS team (dss@closecrafthq.com, info@closecrafthq.com)
    try {
      const { dispatchNotificationAlert } = await import('@/lib/notifications/router');
      await dispatchNotificationAlert({
        category: 'DSS',
        subject: `🎓 New DSS Enquiry: ${name} (${route || 'General'})`,
        text: `New Digital Sales School Enquiry Received!\n\nName: ${name} (${email})\nPhone: ${phone || 'Not provided'}\nRoute: ${route || 'Unspecified'}\nGoal: ${goal}\nReferral: ${referral || 'None'}\n\nReview Admissions: https://www.closecrafthq.com/dss/admin/students`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #248277;">🎓 New DSS Programme Enquiry</h2>
          <div style="background: #f4f6f8; border-left: 4px solid #248277; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${name}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #444;">Email: <a href="mailto:${email}">${email}</a> | Phone: ${phone || 'Not provided'}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #444;">Route: <strong>${route || 'Unspecified'}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #444;">Goal: <em>${goal}</em></p>
          </div>
          <p><a href="https://www.closecrafthq.com/dss/admin/students" style="background: #248277; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Open Admissions Queue &rarr;</a></p>
        </div>`,
      });
    } catch (alertErr) {
      console.warn('[DSS Enquiry Alert Notice]', alertErr);
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error: unknown) {
    console.error('DSS enquiry submission error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit enquiry';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
