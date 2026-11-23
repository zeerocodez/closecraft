import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createProjectProposal, CreateProposalInput } from '@/lib/growth/proposals';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectRequestId = searchParams.get('projectRequestId');

    const userOrgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;
    const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);

    const whereClause: any = {};

    if (projectRequestId) {
      whereClause.projectRequestId = projectRequestId;
    }

    if (!isPlatformStaff) {
      // Must filter by tenant organization
      if (!userOrgId) {
        return NextResponse.json({ proposals: [] });
      }
      whereClause.projectRequest = {
        organizationId: userOrgId,
      };
    }

    const proposals = await db.projectProposal.findMany({
      where: whereClause,
      include: {
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        projectRequest: {
          select: {
            id: true,
            reference: true,
            status: true,
            organizationId: true,
          },
        },
        projectInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
            currency: true,
            bachsCheckoutUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ proposals });
  } catch (err: any) {
    console.error('[Growth Proposals GET Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch proposals.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);

    const body = await req.json().catch(() => ({}));
    const { projectRequestId, title, scopeSummary, estimatedDays, validDays, lineItems } = body;

    if (!projectRequestId || typeof projectRequestId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: projectRequestId' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'A proposal must contain at least one line item deliverable.' },
        { status: 400 }
      );
    }

    // Verify permission: operator/admin OR assigned partner
    const projectRequest = await db.projectRequest.findUnique({
      where: { id: projectRequestId },
      include: { assignedPartner: true },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found.' }, { status: 404 });
    }

    const isAssignedPartner = projectRequest.assignedPartner?.userId === session.user.id;

    if (!isPlatformStaff && !isAssignedPartner) {
      return NextResponse.json(
        { error: 'Forbidden: Only the assigned partner or CloseCraft operator can author proposals.' },
        { status: 403 }
      );
    }

    const proposal = await createProjectProposal({
      projectRequestId,
      createdById: session.user.id,
      title,
      scopeSummary: scopeSummary || 'Custom growth implementation proposal based on client brief.',
      estimatedDays: estimatedDays ? Number(estimatedDays) : 14,
      validDays: validDays ? Number(validDays) : 14,
      lineItems,
    });

    return NextResponse.json({
      success: true,
      message: `Proposal ${proposal.proposalNumber} created and sent to client.`,
      proposal,
    });
  } catch (err: any) {
    console.error('[Growth Proposal POST Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create proposal.' },
      { status: 500 }
    );
  }
}

