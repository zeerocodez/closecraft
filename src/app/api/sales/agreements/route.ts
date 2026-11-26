import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSalesEngagementAgreement } from '@/lib/sales/commissionEngine';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const organizationId = (session as any).organizationId;
    const dbUser = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'OPERATOR';

    const agreements = await db.salesEngagementAgreement.findMany({
      where: isSuperAdmin ? {} : { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { commissions: true } },
      },
    });

    return NextResponse.json({ agreements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load agreements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const agreement = await createSalesEngagementAgreement(session.user.id, {
      ...body,
      organizationId,
    });

    return NextResponse.json({ success: true, agreement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create sales engagement agreement' }, { status: 400 });
  }
}
