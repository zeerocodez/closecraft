import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const invoice: any = await db.projectInvoice.findUnique({
      where: { id },
      include: {
        proposal: {
          include: {
            lineItems: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        projectRequest: {
          include: {
            brief: true,
            requestedBy: {
              select: { id: true, name: true, email: true },
            },
            assignedPartner: {
              select: { id: true, fullName: true, bio: true },
            },
          },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Tenant check
    const userOrgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;
    const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const isOwnerOrg = userOrgId && userOrgId === invoice.organizationId;
    const isPartner = invoice.projectRequest.assignedPartner?.id && (invoice.projectRequest.assignedPartner as any).userId === session.user.id;

    if (!isPlatformStaff && !isOwnerOrg && !isPartner) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to access this invoice.' },
        { status: 403 }
      );
    }

    const isPaid = invoice.status === 'PAID' && !!invoice.paidAt;
    const receiptNumber = isPaid
      ? `CC-REC-${invoice.invoiceNumber.replace(/^CC-INV-(?:PR-)?/, '')}`
      : null;

    const receipt = isPaid
      ? {
          receiptNumber,
          relatedInvoiceNumber: invoice.invoiceNumber,
          customerName: invoice.projectRequest.requestedBy?.name || invoice.projectRequest.brief?.businessName || 'Valued Client',
          customerEmail: invoice.projectRequest.requestedBy?.email || null,
          businessName: invoice.projectRequest.brief?.businessName || invoice.organization.name,
          projectReference: invoice.projectRequest.reference,
          amountReceived: invoice.totalAmount,
          currency: invoice.currency,
          paymentDate: invoice.paidAt,
          paymentMethod: 'Bachs Verified Collection (Bank Transfer / Card)',
          transactionReference: invoice.bachsChargeId || invoice.bachsCheckoutId,
          paymentStatus: 'PAID',
          itemisedDeliverables: invoice.proposal?.lineItems.map((li: any) => ({
            serviceType: li.serviceType,
            title: li.title,
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            totalPrice: li.totalPrice,
            deliverables: li.deliverables,
          })) || [],
        }
      : null;

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        status: invoice.status,
        paidAt: invoice.paidAt,
        bachsCheckoutId: invoice.bachsCheckoutId,
        bachsCheckoutUrl: invoice.bachsCheckoutUrl,
        createdAt: invoice.createdAt,
      },
      projectReference: invoice.projectRequest.reference,
      businessName: invoice.projectRequest.brief?.businessName || invoice.organization.name,
      proposal: invoice.proposal
        ? {
            id: invoice.proposal.id,
            proposalNumber: invoice.proposal.proposalNumber,
            title: invoice.proposal.title,
            scopeSummary: invoice.proposal.scopeSummary,
            lineItems: invoice.proposal.lineItems,
          }
        : null,
      receipt,
    });
  } catch (err: any) {
    console.error('[Growth Invoice GET Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve invoice details.' },
      { status: 500 }
    );
  }
}
