import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import {
  enrolConfirmedSubscriber,
  suppressSubscriber,
  TrackPreference,
} from '@/lib/marketing/welcomeSequence';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Optional webhook signature / token verification
    const secret = process.env.BREVO_WEBHOOK_SECRET;
    const authHeader = req.headers.get('authorization') || req.headers.get('x-sib-signature');
    if (!secret) return NextResponse.json({ error: 'Webhook secret unconfigured' }, { status: 503 });
    if (secret) {
      if (authHeader !== secret && authHeader !== `Bearer ${secret}`) {
        console.warn('[Brevo Webhook] Webhook authorization mismatch');
        return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
      }
    }

    const event = body.event || body.type;
    const email = body.email || body.email_address || body.contact?.email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ received: true, ignored: true, reason: 'Missing email' }, { status: 200 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Subscription Confirmation (Double Opt-In Confirmed)
    if (
      event === 'subscribed' ||
      event === 'double_opt_in_confirmed' ||
      event === 'subscription_confirmed' ||
      event === 'contact_created'
    ) {
      // Extract preferred track from custom attributes if supplied
      const rawTrack =
        body.attributes?.TRACK ||
        body.attributes?.PREFERENCE ||
        body.attributes?.INTEREST ||
        body.track;

      let trackPreference: TrackPreference = 'UNSPECIFIED';
      if (rawTrack) {
        const upper = String(rawTrack).toUpperCase();
        if (upper.includes('BIZ') || upper.includes('BUSINESS')) trackPreference = 'BUSINESS';
        else if (upper.includes('DSS') || upper.includes('LEARN') || upper.includes('SKILL')) trackPreference = 'LEARNING';
        else if (upper.includes('BOTH')) trackPreference = 'BOTH';
      }

      const timezone = body.attributes?.TIMEZONE || body.timezone || 'Africa/Lagos';

      const enrolment = await enrolConfirmedSubscriber({
        email: cleanEmail,
        name: body.attributes?.FIRSTNAME || body.name || undefined,
        triggerSource: 'CONFIRMED_NEWSLETTER_SUBSCRIPTION',
        trackPreference,
        timezone,
        metadata: {
          brevoId: body.id,
          listId: body.list_id,
          receivedAt: new Date().toISOString(),
        },
      });

      if (enrolment.enrolled && !enrolment.isExisting && enrolment.subscriberId) {
        // Trigger Inngest workflow for the newly enrolled subscriber
        await inngest.send({
          name: 'marketing/welcome_sequence.start',
          data: {
            subscriberId: enrolment.subscriberId,
            email: cleanEmail,
            activeTrack: enrolment.activeTrack,
          },
        });
      }

      return NextResponse.json({
        received: true,
        event: 'SUBSCRIPTION_PROCESSED',
        enrolment,
      });
    }

    // 2. Unsubscribe Event
    if (event === 'unsubscribe' || event === 'unsubscribed') {
      await suppressSubscriber(cleanEmail, 'UNSUBSCRIBED', body.reason || 'User clicked unsubscribe in Brevo');
      await inngest.send({
        name: 'marketing/subscriber.suppressed',
        data: { email: cleanEmail, reason: 'UNSUBSCRIBED' },
      });
      return NextResponse.json({ received: true, event: 'UNSUBSCRIBE_PROCESSED' });
    }

    // 3. Hard Bounce Event
    if (event === 'hard_bounce' || event === 'bounce') {
      await suppressSubscriber(cleanEmail, 'BOUNCED', body.reason || 'Delivery hard bounce');
      await inngest.send({
        name: 'marketing/subscriber.suppressed',
        data: { email: cleanEmail, reason: 'HARD_BOUNCE' },
      });
      return NextResponse.json({ received: true, event: 'BOUNCE_PROCESSED' });
    }

    // 4. Spam Complaint Event
    if (event === 'spam' || event === 'complaint') {
      await suppressSubscriber(cleanEmail, 'COMPLAINED', body.reason || 'Spam complaint recorded');
      await inngest.send({
        name: 'marketing/subscriber.suppressed',
        data: { email: cleanEmail, reason: 'SPAM_COMPLAINT' },
      });
      return NextResponse.json({ received: true, event: 'COMPLAINT_PROCESSED' });
    }

    return NextResponse.json({ received: true, unhandledEvent: event });
  } catch (error: any) {
    console.error('[Brevo Webhook Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error processing Brevo webhook' },
      { status: 500 }
    );
  }
}

