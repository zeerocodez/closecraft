import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';
import { createBachsCheckoutSession } from '@/lib/payments/bachs';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    // Rate limit checkout generation (max 10 checkout sessions per 5 min per user)
    const limiter = await rateLimit(`billing-checkout:${session.user.id}`, 10, 5 * 60 * 1000);
    if (!limiter.allowed) {
      return NextResponse.json({ error: 'Too many checkout requests. Please wait a moment before trying again.' }, { status: 429 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body can be empty if triggering default workspace checkout
    }

    const organizationId = body.organizationId || (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    // Verify workspace membership and billing:manage permission
    try {
      await assertWorkspacePermission(organizationId, session.user.id, 'billing:manage');
    } catch (permError: any) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to manage billing for this workspace' },
        { status: 403 }
      );
    }

    let invoice: any = null;

    if (body.invoiceId) {
      invoice = await db.bachsInvoice.findUnique({
        where: { id: body.invoiceId }
      });

      if (!invoice || invoice.organizationId !== organizationId) {
        return NextResponse.json({ error: 'Invoice not found or unauthorized' }, { status: 404 });
      }

      if (['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(invoice.status)) {
        return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
      }

      if (invoice.status !== 'APPROVED' && invoice.status !== 'ISSUED') {
        return NextResponse.json({ error: 'Invoice is not approved for payment' }, { status: 400 });
      }
    } else {
      // Find latest approved unpaid workspace invoice or create standard one-time NGN 15,000 invoice
      invoice = await db.bachsInvoice.findFirst({
        where: {
          organizationId,
          type: 'WORKSPACE_INVOICE',
          status: { in: ['APPROVED', 'ISSUED'] },
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!invoice) {
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        invoice = await db.bachsInvoice.create({
          data: {
            organizationId,
            invoiceNumber,
            type: 'WORKSPACE_INVOICE',
            amount: 15000.0,
            currency: 'NGN',
            status: 'APPROVED',
            customerEmail: session.user.email || null,
            customerName: session.user.name || null,
            metadata: JSON.stringify({
              description: 'One-time NGN 15,000 Workspace Invoice',
              plan: 'STARTER',
            }),
          }
        });
      }
    }

    // Origin resolution for redirects: Bachs strictly requires a publicly accessible HTTPS URL
    let origin = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL;

    const forwardedHost = req.headers.get('x-forwarded-host');
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
    const headerOrigin = req.headers.get('origin') || req.headers.get('referer');

    if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
      origin = `${forwardedProto}://${forwardedHost}`;
    } else if (headerOrigin && !headerOrigin.includes('localhost') && !headerOrigin.includes('127.0.0.1')) {
      try {
        origin = new URL(headerOrigin).origin;
      } catch (_) {}
    }

    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      origin = 'https://www.closecrafthq.com';
    }

    const successUrl = `${origin}/billing/return`;
    const cancelUrl = `${origin}/billing`;

    // Create Bachs checkout session with server-derived amount & raw pricing
    const result = await createBachsCheckoutSession({
      organizationId,
      invoiceId: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      customerEmail: session.user.email || invoice.customerEmail || undefined,
      customerName: session.user.name || invoice.customerName || undefined,
      successUrl,
      cancelUrl,
      metadata: {
        invoiceId: invoice.id,
        organizationId,
        invoiceNumber: invoice.invoiceNumber,
      }
    });

    return NextResponse.json({
      checkout_url: result.checkoutUrl,
      checkout_id: result.checkoutId,
      invoice_id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      status: result.status,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API /api/billing/checkout] Error creating checkout:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
