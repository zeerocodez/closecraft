import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const { leadId, optedOut, reason } = body || {};

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const lead = await db.lead.findFirst({
      where: { id: leadId, organizationId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found in this organization' }, { status: 404 });
    }

    const isOptedOut = Boolean(optedOut);

    const updated = await db.lead.update({
      where: { id: leadId },
      data: {
        optedOutOfMarketing: isOptedOut,
        optedOutAt: isOptedOut ? new Date() : null
      }
    });

    await db.auditLog.create({
      data: {
        organizationId,
        actorId: session.user.id,
        actorType: 'USER',
        action: isOptedOut ? 'CONSENT_OPT_OUT_RECORDED' : 'CONSENT_RECONFIRMED',
        resourceType: 'Lead',
        resourceId: leadId,
        reason: reason || (isOptedOut ? 'User requested marketing opt-out suppression' : 'Consent restored by administrator')
      }
    });

    return NextResponse.json({
      success: true,
      leadId,
      optedOutOfMarketing: updated.optedOutOfMarketing
    });
  } catch (err: any) {
    console.error('[Privacy Consent Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to update consent' }, { status: 500 });
  }
}
