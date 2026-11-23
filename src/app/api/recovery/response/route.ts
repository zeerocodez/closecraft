import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processInboundRecoveryResponse } from '@/lib/recovery/campaignService';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.leadId || !body.messageText) {
      return NextResponse.json({ error: 'leadId and messageText are required' }, { status: 400 });
    }

    const result = await processInboundRecoveryResponse({
      organizationId,
      leadId: body.leadId,
      messageText: body.messageText
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[API /recovery/response Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to process recovery response' }, { status: 500 });
  }
}
