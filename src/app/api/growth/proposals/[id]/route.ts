import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { respondToProjectProposal } from '@/lib/growth/proposals';

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
    const proposal = await db.projectProposal.findUnique({
      where: { id },
      include: {
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        projectRequest: {
          include: {
            brief: true,
            assignedPartner: {
              select: {
                id: true,
                fullName: true,
                bio: true,
                experienceSummary: true,
              },
            },
            requestedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        projectInvoice: true,
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Tenant check
    const userOrgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;
    const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const isOwnerOrg = userOrgId && userOrgId === proposal.projectRequest.organizationId;
    const isAuthor = proposal.createdById === session.user.id;

    if (!isPlatformStaff && !isOwnerOrg && !isAuthor) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to access this proposal.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ proposal });
  } catch (err: any) {
    console.error('[Growth Proposal Detail GET Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve proposal.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userOrgId = (session.user as any).organizationId;

    if (!userOrgId) {
      return NextResponse.json(
        { error: 'Forbidden: Only workspace members can accept or reject proposals.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, revisionNotes } = body;

    if (!action || !['ACCEPT', 'REVISE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of 'ACCEPT', 'REVISE', or 'REJECT'." },
        { status: 400 }
      );
    }

    const result = await respondToProjectProposal({
      proposalId: id,
      userId: session.user.id,
      organizationId: userOrgId,
      action,
      revisionNotes,
      appUrl: req.nextUrl.origin,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Growth Proposal Response Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process proposal response.' },
      { status: 500 }
    );
  }
}
