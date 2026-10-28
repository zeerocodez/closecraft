import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoice = await db.bachsInvoice.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            subscription: {
              select: {
                status: true,
                paidThroughDate: true,
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Tenant check: Verify user is a member of the organization that owns this invoice
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organizationId: invoice.organizationId,
      }
    });

    const isPlatformAdmin = (session.user as any).role === 'SUPER_ADMIN' || (session.user as any).role === 'OPERATOR';

    if (!membership && !isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this invoice' }, { status: 403 });
    }

    const isPaid = ['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(invoice.status);

    return NextResponse.json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      isPaid,
      amount: invoice.amount,
      currency: invoice.currency,
      paidAt: invoice.paidAt,
      paidThroughDate: invoice.organization?.subscription?.paidThroughDate || null,
      subscriptionStatus: invoice.organization?.subscription?.status || null,
      checkoutId: invoice.bachsCheckoutId,
      checkoutUrl: invoice.bachsCheckoutUrl,
      createdAt: invoice.createdAt,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API /api/billing/invoices/[id]/status] Error fetching status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
