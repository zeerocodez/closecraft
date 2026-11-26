import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordVerifiedSaleCommission, transitionCommissionStatus } from '@/lib/sales/commissionEngine';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const organizationId = (session as any).organizationId;
    const dbUser = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'OPERATOR';

    const commissions = await db.salesCommissionRecord.findMany({
      where: isSuperAdmin
        ? {}
        : {
            OR: [
              { organizationId },
              { representativeUserId: session.user.id },
            ],
          },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        agreement: { select: { serviceType: true, commissionModel: true } },
      },
    });

    return NextResponse.json({ commissions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load commissions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'OPERATOR';
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (body.action === 'TRANSITION') {
      if (!isSuperAdmin && body.nextStatus !== 'DISPUTED') {
        return NextResponse.json({ error: 'Forbidden: Superadmin required for commission approval or payout' }, { status: 403 });
      }
      const updated = await transitionCommissionStatus({
        commissionId: body.commissionId,
        actorId: session.user.id,
        nextStatus: body.nextStatus,
        payoutReference: body.payoutReference,
        reason: body.reason,
      });
      return NextResponse.json({ success: true, commission: updated });
    }

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only authorized admins can propose verified commissions' }, { status: 403 });
    }

    const record = await recordVerifiedSaleCommission({
      organizationId: body.organizationId,
      agreementId: body.agreementId,
      representativeUserId: body.representativeUserId,
      leadId: body.leadId,
      dealId: body.dealId,
      invoiceId: body.invoiceId,
      commissionType: body.commissionType || 'CLOSING',
      verifiedPaymentAmount: Number(body.verifiedPaymentAmount),
      proposedById: session.user.id,
      splitSharePercent: body.splitSharePercent,
    });

    return NextResponse.json({ success: true, commission: record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Commission action failed' }, { status: 400 });
  }
}
