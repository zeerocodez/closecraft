import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateSubscriberPreference } from '@/lib/marketing/welcomeSequence';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const subscriber = await db.marketingSubscriber.findUnique({
      where: { email },
      select: {
        email: true,
        status: true,
        trackPreference: true,
        activeTrack: true,
        confirmedAt: true,
      },
    });

    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({
      subscriber,
      options: [
        { value: 'BUSINESS', label: 'Business Track: Lead follow-up & Next Best Action' },
        { value: 'LEARNING', label: 'Learning Track (DSS): Remote appointment setting & closing' },
        { value: 'BOTH', label: 'Both (Defaults to Business track first)' },
      ],
    });
  } catch (error: any) {
    console.error('[Marketing Preferences GET Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, preference } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!['BUSINESS', 'LEARNING', 'BOTH'].includes(preference)) {
      return NextResponse.json(
        { error: 'Invalid preference. Must be BUSINESS, LEARNING, or BOTH.' },
        { status: 400 }
      );
    }

    const result = await updateSubscriberPreference(email, preference);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[Marketing Preferences POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

