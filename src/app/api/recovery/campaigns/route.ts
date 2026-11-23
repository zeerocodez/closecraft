import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createReactivationCampaign } from '@/lib/recovery/campaignService';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await db.reactivationCampaign.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.name || !body.targetSegment) {
      return NextResponse.json({ error: 'Campaign name and targetSegment are required' }, { status: 400 });
    }

    const result = await createReactivationCampaign({
      organizationId,
      userId: session.user.id,
      name: body.name,
      targetSegment: body.targetSegment,
      channel: body.channel || 'WHATSAPP',
      tone: body.tone || 'PROFESSIONAL',
      customMessagePrompt: body.customMessagePrompt
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[API /recovery/campaigns Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to create campaign' }, { status: 500 });
  }
}
