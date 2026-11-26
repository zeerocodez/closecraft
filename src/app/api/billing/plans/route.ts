import { NextResponse } from 'next/server';
import { getActivePlansWithPricing, USAGE_CREDIT_PACKS, DEFAULT_RECOVERY_TIERS, DEFAULT_COMMISSION_TIERS } from '@/lib/billing/catalog';
import { validatePromotionalCode } from '@/lib/billing/documents';
import { getPlatformBillingPolicy } from '@/lib/billing/stateMachine';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const region = url.searchParams.get('region') || undefined;
    const currency = url.searchParams.get('currency') || undefined;

    const [plans, policy] = await Promise.all([
      getActivePlansWithPricing(region, currency),
      getPlatformBillingPolicy(),
    ]);

    return NextResponse.json({
      plans,
      creditPacks: USAGE_CREDIT_PACKS,
      recoveryTiers: DEFAULT_RECOVERY_TIERS,
      commissionTiers: DEFAULT_COMMISSION_TIERS,
      policy,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load plans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.code || !body.planCode || body.subtotalAmount === undefined) {
      return NextResponse.json({ error: 'code, planCode, and subtotalAmount are required' }, { status: 400 });
    }
    const result = await validatePromotionalCode({
      code: String(body.code),
      planCode: String(body.planCode),
      currency: String(body.currency || 'NGN'),
      subtotalAmount: Number(body.subtotalAmount),
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Promo validation failed' }, { status: 500 });
  }
}
