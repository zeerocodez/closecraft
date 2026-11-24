import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    // If specific lead requested, export that lead's full data
    if (leadId) {
      const lead = await db.lead.findFirst({
        where: { id: leadId, organizationId },
        include: {
          conversations: { include: { messages: true } },
          deals: true,
          commitments: true,
          revenueActions: true,
          revenueSignals: true,
          intelligence: true
        }
      });

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found in this organization' }, { status: 404 });
      }

      await db.auditLog.create({
        data: {
          organizationId,
          actorId: session.user.id,
          actorType: 'USER',
          action: 'DATA_SUBJECT_EXPORT_SINGLE',
          resourceType: 'Lead',
          resourceId: leadId,
          reason: 'NDPA / GDPR individual data export request'
        }
      });

      return NextResponse.json({ success: true, leadData: lead });
    }

    // Otherwise export organization's customer archive
    const leads = await db.lead.findMany({
      where: { organizationId },
      include: {
        deals: true,
        commitments: true,
        intelligence: true
      },
      take: 200
    });

    await db.auditLog.create({
      data: {
        organizationId,
        actorId: session.user.id,
        actorType: 'USER',
        action: 'DATA_SUBJECT_EXPORT_ALL',
        resourceType: 'Organization',
        resourceId: organizationId,
        reason: 'Organization complete data export archive'
      }
    });

    return NextResponse.json({
      success: true,
      exportTimestamp: new Date().toISOString(),
      recordCount: leads.length,
      data: leads
    });
  } catch (err: any) {
    console.error('[Privacy Export Error]:', err);
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}
