import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dispatchReactivationCampaign } from '@/lib/recovery/campaignService';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    const result = await dispatchReactivationCampaign(campaignId, organizationId, session.user.id);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API /recovery/campaigns/dispatch Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to dispatch campaign' }, { status: 500 });
  }
}
