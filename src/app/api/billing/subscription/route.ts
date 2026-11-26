import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';
import { getOrCreateWorkspaceSubscription } from '@/lib/payments/subscription';
import { cancelWorkspaceSubscription, reactivateWorkspaceSubscription } from '@/lib/billing/stateMachine';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    const [subscription, events, invoices, credits] = await Promise.all([
      getOrCreateWorkspaceSubscription(organizationId),
      db.subscriptionEvent.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
      db.bachsInvoice.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.usageCredit.findMany({
        where: { organizationId, remainingUnits: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      subscription,
      events,
      invoices,
      credits,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load subscription' }, { status: 500 });
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

    await assertWorkspacePermission(organizationId, session.user.id, 'billing:manage');

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '').toUpperCase();

    if (action === 'CANCEL') {
      const updated = await cancelWorkspaceSubscription({
        organizationId,
        actorId: session.user.id,
        immediate: Boolean(body.immediate),
        reason: body.reason ? String(body.reason) : undefined,
      });
      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === 'REACTIVATE') {
      const updated = await reactivateWorkspaceSubscription({
        organizationId,
        actorId: session.user.id,
      });
      return NextResponse.json({ success: true, subscription: updated });
    }

    return NextResponse.json({ error: 'Unsupported subscription action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Subscription update failed' }, { status: 400 });
  }
}
