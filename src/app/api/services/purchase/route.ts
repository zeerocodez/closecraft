import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServiceCatalogue } from '@/lib/services/catalogue';
import { createBachsCheckoutSession } from '@/lib/payments/bachs';
import { rateLimit } from '@/lib/rateLimit';

export async function GET() {
  try {
    const packages = await getServiceCatalogue();
    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    console.error('[Service Catalogue GET] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve service catalogue' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing active organization context' }, { status: 400 });
    }

    // Rate limit purchase attempts: 10 per 5 mins per user
    const limiter = await rateLimit(`service-purchase:${session.user.id}`, 10, 5 * 60 * 1000);
    if (!limiter.allowed) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please try again shortly.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { packageSlug, packageId } = body;

    if (!packageSlug && !packageId) {
      return NextResponse.json({ error: 'Package identifier (packageSlug or packageId) is required' }, { status: 400 });
    }

    // Lookup service package
    const pkg = await db.servicePackage.findFirst({
      where: {
        OR: [
          ...(packageSlug ? [{ slug: packageSlug }] : []),
          ...(packageId ? [{ id: packageId }] : []),
        ],
        isActive: true,
      }
    });

    if (!pkg) {
      return NextResponse.json({ error: 'Selected service package is not available' }, { status: 404 });
    }

    // Parse deliverables/activities for the checklist
    let deliverablesList: any[] = [];
    try {
      const activities = typeof pkg.activitiesIncluded === 'string' 
        ? JSON.parse(pkg.activitiesIncluded || '[]') 
        : (pkg.activitiesIncluded || []);
      deliverablesList = activities.map((item: string, idx: number) => ({
        id: `deliv-${idx + 1}`,
        title: item,
        completed: false,
      }));
    } catch {
      deliverablesList = [];
    }

    // Create client service record
    const clientService = await db.clientService.create({
      data: {
        organizationId,
        servicePackageId: pkg.id,
        category: pkg.category,
        name: pkg.title,
        description: pkg.description,
        tier: pkg.title.split(' ')[0],
        status: 'PENDING_SETUP',
        pricePaid: pkg.defaultBasePrice,
        currency: pkg.currency,
        billingFrequency: pkg.billingFrequency,
        progressPercent: 10,
        deliverables: JSON.stringify(deliverablesList),
        assignedTeamMember: 'CloseCraft Service Delivery Specialist',
        accountManagerEmail: 'sales@closecrafthq.com',
      }
    });

    // Create Bachs Invoice & Checkout Session
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.closecrafthq.com';
    const successUrl = `${origin}/services?purchased=true&service_id=${clientService.id}`;
    const cancelUrl = `${origin}/services?canceled=true`;

    const checkout = await createBachsCheckoutSession({
      amount: pkg.defaultBasePrice,
      currency: pkg.currency,
      organizationId,
      customerEmail: session.user.email || undefined,
      customerName: session.user.name || undefined,
      type: 'WORKSPACE_INVOICE',
      successUrl,
      cancelUrl,
      metadata: {
        type: 'SERVICE_PURCHASE',
        clientServiceId: clientService.id,
        packageSlug: pkg.slug || '',
        category: pkg.category,
        packageName: pkg.title,
      }
    });

    return NextResponse.json({
      success: true,
      clientServiceId: clientService.id,
      checkoutUrl: checkout.checkoutUrl,
      invoiceNumber: checkout.invoiceNumber,
      invoiceId: checkout.invoiceId,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Service Purchase POST] Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to initialize service purchase' }, { status: 500 });
  }
}
