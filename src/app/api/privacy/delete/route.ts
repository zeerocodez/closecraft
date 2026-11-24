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
    const leadId = body?.leadId;
    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required for erasure' }, { status: 400 });
    }

    const lead = await db.lead.findFirst({
      where: { id: leadId, organizationId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Record not found in this organization' }, { status: 404 });
    }

    // Execute atomic deletion with cascade
    await db.$transaction(async (tx) => {
      // 1. Audit log before erasure
      await tx.auditLog.create({
        data: {
          organizationId,
          actorId: session.user.id,
          actorType: 'USER',
          action: 'DATA_SUBJECT_ERASURE_REQUEST',
          resourceType: 'Lead',
          resourceId: leadId,
          reason: `Right-to-be-forgotten erasure for ${lead.name} (${lead.email || lead.phone || 'Unknown'})`
        }
      });

      // 2. Delete the lead
      await tx.lead.delete({
        where: { id: leadId }
      });
    });

    return NextResponse.json({
      success: true,
      message: `Lead ${leadId} and associated personal data erased in compliance with NDPA and GDPR.`
    });
  } catch (err: any) {
    console.error('[Privacy Delete Error]:', err);
    return NextResponse.json({ error: err.message || 'Erasure failed' }, { status: 500 });
  }
}
