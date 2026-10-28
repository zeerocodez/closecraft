import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  props: { params?: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const resolvedParams = props.params ? await Promise.resolve(props.params) : null;
    const url = new URL(req.url);
    const queryId = url.searchParams.get('id') || url.searchParams.get('invoice_id') || url.searchParams.get('checkout_id');
    const targetId = resolvedParams?.id || queryId;

    if (!targetId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    let invoice = await db.bachsInvoice.findUnique({
      where: { id: targetId },
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
      invoice = await db.bachsInvoice.findFirst({
        where: {
          OR: [
            { bachsCheckoutId: targetId },
            { invoiceNumber: targetId },
            { id: targetId }
          ]
        },
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
    }

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
    console.error('[API invoice status] Error fetching status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
