import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertWorkspacePermission } from '@/lib/permissions/matrix';
import { createBachsCheckoutSession } from '@/lib/payments/bachs';
import { rateLimit } from '@/lib/rateLimit';
import { resolveServerPlanPrice, USAGE_CREDIT_PACKS } from '@/lib/billing/catalog';
import { validatePromotionalCode } from '@/lib/billing/documents';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const limiter = await rateLimit(`billing-checkout:${session.user.id}`, 10, 5 * 60 * 1000);
    if (!limiter.allowed) {
      return NextResponse.json({ error: 'Too many checkout requests. Please wait a moment before trying again.' }, { status: 429 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body can be empty for default workspace invoice checkout
    }

    const organizationId = body.organizationId || (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    try {
      await assertWorkspacePermission(organizationId, session.user.id, 'billing:manage');
    } catch {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to manage billing for this workspace' },
        { status: 403 }
      );
    }

    let invoice: any = null;
    let checkoutType: any = 'WORKSPACE_INVOICE';
    let targetPlan: any = 'STARTER';
    let billingInterval: 'MONTHLY' | 'ANNUAL' = 'MONTHLY';
    let marketRegion = body.marketRegion || 'NG';

    if (body.invoiceId) {
      invoice = await db.bachsInvoice.findUnique({ where: { id: body.invoiceId } });
      if (!invoice || invoice.organizationId !== organizationId) {
        return NextResponse.json({ error: 'Invoice not found or unauthorized' }, { status: 404 });
      }
      if (['PAID', 'CONFIRMED', 'FUNDS_AVAILABLE'].includes(invoice.status)) {
        return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
      }
      if (invoice.status !== 'APPROVED' && invoice.status !== 'ISSUED') {
        return NextResponse.json({ error: 'Invoice is not approved for payment' }, { status: 400 });
      }
      checkoutType = invoice.type || 'WORKSPACE_INVOICE';
    } else if (body.creditPackId) {
      const pack = USAGE_CREDIT_PACKS.find((p) => p.id === body.creditPackId);
      if (!pack) {
        return NextResponse.json({ error: 'Invalid usage credit pack selected' }, { status: 400 });
      }
      if (!body.consentConfirmed) {
        return NextResponse.json({ error: 'Explicit customer consent is required before purchasing additional usage credits.' }, { status: 400 });
      }
      const currency = (body.currency || 'NGN').toUpperCase() === 'USD' ? 'USD' : 'NGN';
      const amount = currency === 'USD' ? pack.priceUsd : pack.priceNgn;
      const invoiceNumber = `CC-INV-CR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      checkoutType = 'USAGE_CREDIT';

      invoice = await db.bachsInvoice.create({
        data: {
          organizationId,
          invoiceNumber,
          type: 'USAGE_CREDIT',
          subtotalAmount: amount,
          amount,
          currency,
          status: 'APPROVED',
          customerEmail: session.user.email || null,
          customerName: session.user.name || null,
          lineItemsJson: JSON.stringify([
            { description: pack.name, quantity: 1, unitPrice: amount, total: amount },
          ]),
          metadata: JSON.stringify({
            description: pack.name,
            creditPackId: pack.id,
            creditType: pack.creditType,
            units: pack.units,
          }),
        },
      });
    } else if (body.recoveryCampaignId) {
      const campaign = await db.reactivationCampaign.findFirst({
        where: { id: body.recoveryCampaignId, organizationId },
      });
      if (!campaign) {
        return NextResponse.json({ error: 'Lead recovery campaign not found' }, { status: 404 });
      }
      if (campaign.paymentVerified) {
        return NextResponse.json({ error: 'Campaign service fee has already been paid' }, { status: 400 });
      }
      const amount = Number(campaign.serviceFee || 0) + Number(campaign.dataCleaningFee || 0);
      if (amount <= 0) {
        return NextResponse.json({ error: 'This Lead Recovery campaign requires a custom quotation fee before checkout.' }, { status: 400 });
      }
      const currency = campaign.currency || 'NGN';
      const invoiceNumber = `CC-INV-RC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      checkoutType = 'LEAD_RECOVERY';

      invoice = await db.bachsInvoice.create({
        data: {
          organizationId,
          invoiceNumber,
          type: 'LEAD_RECOVERY',
          subtotalAmount: amount,
          amount,
          currency,
          status: 'APPROVED',
          customerEmail: session.user.email || null,
          customerName: session.user.name || null,
          lineItemsJson: JSON.stringify([
            { description: `Lead Recovery Campaign: ${campaign.name} (${campaign.packageTier || 'STANDARD'})`, quantity: 1, unitPrice: campaign.serviceFee, total: campaign.serviceFee },
            ...(campaign.dataCleaningFee > 0 ? [{ description: 'Additional Data Cleaning & Formatting', quantity: 1, unitPrice: campaign.dataCleaningFee, total: campaign.dataCleaningFee }] : []),
          ]),
          metadata: JSON.stringify({
            description: `Lead Recovery Service: ${campaign.name}`,
            recoveryCampaignId: campaign.id,
            packageTier: campaign.packageTier,
          }),
        },
      });
    } else if (body.planCode || body.plan) {
      const resolved = await resolveServerPlanPrice({
        planCode: body.planCode || body.plan,
        marketRegion: body.marketRegion || 'NG',
        currency: body.currency,
        billingInterval: body.billingInterval || 'MONTHLY',
      });

      targetPlan = resolved.plan.code;
      billingInterval = resolved.billingInterval;
      marketRegion = resolved.marketRegion;
      checkoutType = 'SOFTWARE_SUBSCRIPTION';

      let finalAmount = resolved.unitAmount;
      let discountAmount = 0;
      let appliedPromoCode: string | null = null;

      if (body.promoCode && typeof body.promoCode === 'string') {
        const promoResult = await validatePromotionalCode({
          code: body.promoCode,
          planCode: resolved.plan.code,
          currency: resolved.currency,
          subtotalAmount: resolved.unitAmount,
        });
        if (!promoResult.valid) {
          return NextResponse.json({ error: promoResult.reason || 'Invalid promotional code' }, { status: 400 });
        }
        discountAmount = promoResult.discountAmount;
        finalAmount = promoResult.finalAmount;
        appliedPromoCode = promoResult.code || null;
      }

      const invoiceNumber = `CC-INV-SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const desc = `CloseCraft HQ ${resolved.plan.name} Plan (${billingInterval === 'ANNUAL' ? 'Annual · 12 Months' : 'Monthly'})`;

      invoice = await db.bachsInvoice.create({
        data: {
          organizationId,
          invoiceNumber,
          type: 'SOFTWARE_SUBSCRIPTION',
          subtotalAmount: resolved.unitAmount,
          discountAmount,
          amount: finalAmount,
          currency: resolved.currency,
          status: 'APPROVED',
          billingInterval,
          promotionalCode: appliedPromoCode,
          customerEmail: session.user.email || null,
          customerName: session.user.name || null,
          lineItemsJson: JSON.stringify([
            { description: desc, quantity: 1, unitPrice: resolved.unitAmount, total: resolved.unitAmount },
          ]),
          metadata: JSON.stringify({
            description: desc,
            plan: resolved.plan.code,
            billingInterval,
            marketRegion: resolved.marketRegion,
            promotionalCode: appliedPromoCode,
          }),
        },
      });
    } else {
      invoice = await db.bachsInvoice.findFirst({
        where: {
          organizationId,
          type: { in: ['WORKSPACE_INVOICE', 'SOFTWARE_SUBSCRIPTION'] },
          status: { in: ['APPROVED', 'ISSUED'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!invoice) {
        const resolved = await resolveServerPlanPrice({
          planCode: 'STARTER',
          marketRegion: 'NG',
          currency: 'NGN',
          billingInterval: 'MONTHLY',
        });
        const invoiceNumber = `CC-INV-SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        invoice = await db.bachsInvoice.create({
          data: {
            organizationId,
            invoiceNumber,
            type: 'SOFTWARE_SUBSCRIPTION',
            subtotalAmount: resolved.unitAmount,
            amount: resolved.unitAmount,
            currency: resolved.currency,
            status: 'APPROVED',
            billingInterval: 'MONTHLY',
            customerEmail: session.user.email || null,
            customerName: session.user.name || null,
            lineItemsJson: JSON.stringify([
              { description: 'CloseCraft HQ Starter Plan (Monthly)', quantity: 1, unitPrice: resolved.unitAmount, total: resolved.unitAmount },
            ]),
            metadata: JSON.stringify({
              description: 'CloseCraft HQ Starter Plan (Monthly)',
              plan: 'STARTER',
              billingInterval: 'MONTHLY',
              marketRegion: 'NG',
            }),
          },
        });
      }
    }

    let origin = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL;
    const forwardedHost = req.headers.get('x-forwarded-host');
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
    const headerOrigin = req.headers.get('origin') || req.headers.get('referer');

    if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
      origin = `${forwardedProto}://${forwardedHost}`;
    } else if (headerOrigin && !headerOrigin.includes('localhost') && !headerOrigin.includes('127.0.0.1')) {
      try {
        origin = new URL(headerOrigin).origin;
      } catch {}
    }

    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      origin = 'https://www.closecrafthq.com';
    }

    const successUrl = `${origin}/billing/return`;
    const cancelUrl = `${origin}/billing`;

    let parsedMeta: any = {};
    try {
      parsedMeta = typeof invoice.metadata === 'string' ? JSON.parse(invoice.metadata) : (invoice.metadata || {});
    } catch {}

    const result = await createBachsCheckoutSession({
      organizationId,
      invoiceId: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      customerEmail: session.user.email || invoice.customerEmail || undefined,
      customerName: session.user.name || invoice.customerName || undefined,
      type: checkoutType,
      plan: parsedMeta.plan || targetPlan,
      billingInterval: parsedMeta.billingInterval || billingInterval,
      marketRegion: parsedMeta.marketRegion || marketRegion,
      successUrl,
      cancelUrl,
      metadata: {
        ...parsedMeta,
        invoiceId: invoice.id,
        organizationId,
        invoiceNumber: invoice.invoiceNumber,
      },
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
