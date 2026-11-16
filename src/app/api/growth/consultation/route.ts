import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { buildWhatsAppConsultationLink, GrowthServiceKey } from '@/lib/growth/services';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectRequestId = searchParams.get('projectRequestId');

    if (!projectRequestId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: projectRequestId' },
        { status: 400 }
      );
    }

    const projectRequest = await db.projectRequest.findUnique({
      where: { id: projectRequestId },
      include: {
        brief: true,
        assignedPartner: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            bio: true,
            experienceSummary: true,
            status: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 });
    }

    // Tenant Isolation Check:
    // User must belong to the requesting Organization, OR be the assigned partner, OR be an operator/admin
    const userOrgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;
    const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const isOwnerOrg = userOrgId && userOrgId === projectRequest.organizationId;
    const isAssignedPartner = projectRequest.assignedPartner?.userId === session.user.id;

    if (!isPlatformStaff && !isOwnerOrg && !isAssignedPartner) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view this consultation.' },
        { status: 403 }
      );
    }

    // Build fresh WhatsApp link if assigned partner is present
    const contactName = projectRequest.requestedBy?.name || 'Client';
    const businessName = projectRequest.brief?.businessName || 'Client';
    const whatsappUrl = buildWhatsAppConsultationLink(
      projectRequest.reference,
      businessName,
      projectRequest.services as GrowthServiceKey[],
      contactName,
      projectRequest.assignedPartner?.fullName
    );

    return NextResponse.json({
      projectRequestId: projectRequest.id,
      reference: projectRequest.reference,
      status: projectRequest.status,
      services: projectRequest.services,
      whatsappThreadUrl: whatsappUrl,
      consultationNotes: projectRequest.consultationNotes,
      consultedAt: projectRequest.consultedAt,
      slaBreachedAt: projectRequest.slaBreachedAt,
      assignedPartner: projectRequest.assignedPartner,
      brief: projectRequest.brief
        ? {
            businessName: projectRequest.brief.businessName,
            industry: projectRequest.brief.industry,
            primaryGoal: projectRequest.brief.primaryGoal,
            targetAudience: projectRequest.brief.targetAudience,
            urgency: projectRequest.brief.urgency,
            targetLaunchDate: projectRequest.brief.targetLaunchDate,
          }
        : null,
    });
  } catch (err: any) {
    console.error('[Growth Consultation GET Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve consultation details.' },
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

    const body = await req.json().catch(() => ({}));
    const { projectRequestId, status, notes, action } = body;

    if (!projectRequestId || typeof projectRequestId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: projectRequestId' },
        { status: 400 }
      );
    }

    const projectRequest = await db.projectRequest.findUnique({
      where: { id: projectRequestId },
      include: {
        assignedPartner: true,
        brief: true,
        requestedBy: true,
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 });
    }

    const userOrgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;
    const isPlatformStaff = ['OPERATOR', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const isOwnerOrg = userOrgId && userOrgId === projectRequest.organizationId;
    const isAssignedPartner = projectRequest.assignedPartner?.userId === session.user.id;

    if (!isPlatformStaff && !isOwnerOrg && !isAssignedPartner) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this consultation.' },
        { status: 403 }
      );
    }

    // Handle Actions:
    // 'INITIATE': Client or Partner clicked WhatsApp link, transitioning status from ASSIGNED -> CONSULTING
    // 'LOG_NOTES': Partner or Operator recording consultation notes and scope alignment
    // 'COMPLETE': Consultation complete, ready for proposal creation
    let newStatus = projectRequest.status;
    let consultedAt = projectRequest.consultedAt;
    let newNotes = projectRequest.consultationNotes;

    if (action === 'INITIATE' || status === 'CONSULTING') {
      if (projectRequest.status === 'ASSIGNED' || projectRequest.status === 'PENDING_ASSIGNMENT') {
        newStatus = 'CONSULTING';
      }
    }

    if (notes && typeof notes === 'string') {
      newNotes = notes.trim();
    }

    if (action === 'COMPLETE') {
      consultedAt = new Date();
      if (newStatus === 'PENDING_ASSIGNMENT' || newStatus === 'ASSIGNED') {
        newStatus = 'CONSULTING';
      }
    }

    const updated = await db.$transaction(async (tx) => {
      const pr = await tx.projectRequest.update({
        where: { id: projectRequestId },
        data: {
          status: newStatus,
          consultationNotes: newNotes,
          consultedAt: consultedAt || (action === 'COMPLETE' ? new Date() : undefined),
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: projectRequest.organizationId,
          actorId: session.user.id,
          actorType: 'USER',
          action: action === 'COMPLETE' ? 'CONSULTATION_COMPLETED' : 'CONSULTATION_UPDATED',
          resourceType: 'PROJECT_REQUEST',
          resourceId: projectRequestId,
          metadata: JSON.stringify({
            previousStatus: projectRequest.status,
            newStatus,
            action: action || 'UPDATE',
            consultedAt: pr.consultedAt,
          }),
        },
      });

      return pr;
    });

    return NextResponse.json({
      success: true,
      message: 'Consultation record updated successfully.',
      projectRequest: {
        id: updated.id,
        reference: updated.reference,
        status: updated.status,
        consultationNotes: updated.consultationNotes,
        consultedAt: updated.consultedAt,
      },
    });
  } catch (err: any) {
    console.error('[Growth Consultation POST Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update consultation.' },
      { status: 500 }
    );
  }
}
