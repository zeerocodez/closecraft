import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createCustomerOrder, recordOrderPayment } from '@/lib/commitments/orderService';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db.customerOrder.findMany({
      where: { organizationId },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        commitments: {
          select: { id: true, title: true, status: true, dueDate: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch orders' }, { status: 500 });
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
    if (!body || !body.title || !body.agreedAmount) {
      return NextResponse.json({ error: 'title and agreedAmount are required' }, { status: 400 });
    }

    const order = await createCustomerOrder({
      organizationId,
      title: body.title,
      agreedAmount: Number(body.agreedAmount),
      amountPaid: Number(body.amountPaid || 0),
      currency: body.currency || 'NGN',
      deadline: body.deadline ? new Date(body.deadline) : null,
      leadId: body.leadId || null,
      dealId: body.dealId || null,
      assignedUserId: body.assignedUserId || session.user.id,
      fulfilmentNotes: body.fulfilmentNotes || null,
      userId: session.user.id
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('[API /orders POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.orderId || body.paymentAmount === undefined) {
      return NextResponse.json({ error: 'orderId and paymentAmount are required' }, { status: 400 });
    }

    const order = await recordOrderPayment({
      orderId: body.orderId,
      organizationId,
      paymentAmount: Number(body.paymentAmount),
      userId: session.user.id
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order payment' }, { status: 500 });
  }
}
