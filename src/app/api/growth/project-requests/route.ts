import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import {
  ProjectBriefSubmissionSchema,
  generateProjectReference,
  buildWhatsAppConsultationLink,
  GrowthServiceKey,
} from '@/lib/growth/services';
import crypto from 'node:crypto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`growth-project-request:${ip}`, 10, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a few minutes before trying again.' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json().catch(() => ({}));

    // Honeypot check
    if (rawBody.hpField) {
      return NextResponse.json(
        {
          success: true,
          reference: generateProjectReference(),
          message: 'Project request received successfully.',
        },
        { status: 201 }
      );
    }

    const parseResult = ProjectBriefSubmissionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? `${issue.path.join('.')}: ${issue.message}` : 'Validation error.' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check existing session
    const session = await auth();

    let targetOrgId: string;
    let targetUserId: string;

    if (session?.user?.id && (session.user as any).organizationId) {
      targetUserId = session.user.id;
      targetOrgId = (session.user as any).organizationId;
    } else {
      // Find or provision lead user and organization
      const cleanEmail = data.contactEmail.toLowerCase().trim();
      let user = await db.user.findUnique({
        where: { email: cleanEmail },
        include: { memberships: true },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email: cleanEmail,
            name: data.contactName.trim(),
            role: 'USER',
          },
          include: { memberships: true },
        });
      }

      targetUserId = user.id;

      if (user.memberships && user.memberships.length > 0) {
        targetOrgId = user.memberships[0].organizationId;
      } else {
        // Create an organization for the business
        const baseSlug = slugify(data.businessName) || 'client-org';
        const randomSuffix = crypto.randomBytes(3).toString('hex');
        const orgSlug = `${baseSlug}-${randomSuffix}`;

        const org = await db.organization.create({
          data: {
            name: data.businessName.trim(),
            slug: orgSlug,
            plan: 'STARTER',
            whatsappNumber: data.contactPhone.trim(),
            members: {
              create: {
                userId: user.id,
                role: 'OWNER',
              },
            },
          },
        });

        targetOrgId = org.id;
      }
    }

    // Generate unique reference
    let reference = generateProjectReference();
    let collision = await db.projectRequest.findUnique({ where: { reference } });
    let attempts = 0;
    while (collision && attempts < 5) {
      reference = generateProjectReference();
      collision = await db.projectRequest.findUnique({ where: { reference } });
      attempts++;
    }

    // Parse launch date if provided
    let parsedLaunchDate: Date | null = null;
    if (data.targetLaunchDate) {
      const d = new Date(data.targetLaunchDate);
      if (!isNaN(d.getTime())) {
        parsedLaunchDate = d;
      }
    }

    // Create the ProjectRequest and ProjectBrief atomically
    const projectRequest = await db.$transaction(async (tx) => {
      const pr = await tx.projectRequest.create({
        data: {
          reference,
          organizationId: targetOrgId,
          requestedById: targetUserId,
          services: data.services as any,
          status: 'PENDING_ASSIGNMENT',
          brief: {
            create: {
              businessName: data.businessName.trim(),
              industry: data.industry.trim(),
              businessOverview: data.businessOverview.trim(),
              websiteUrl: data.websiteUrl?.trim() || null,
              socialLinks: data.socialLinks || [],
              primaryGoal: data.primaryGoal.trim(),
              currentBottleneck: data.currentBottleneck.trim(),
              targetAudience: data.targetAudience.trim(),
              promotedProducts: data.promotedProducts.trim(),
              successDefinition: data.successDefinition.trim(),
              serviceParameters: data.serviceParameters || {},
              urgency: data.urgency as any,
              targetLaunchDate: parsedLaunchDate,
              preferredContactMethod: data.preferredContactMethod,
              availabilityWindow: data.availabilityWindow?.trim() || null,
            },
          },
        },
        include: {
          brief: true,
        },
      });

      return pr;
    });

    const whatsappUrl = buildWhatsAppConsultationLink(
      reference,
      data.businessName,
      data.services as GrowthServiceKey[],
      data.contactName
    );

    // Save WhatsApp thread URL on record
    await db.projectRequest.update({
      where: { id: projectRequest.id },
      data: { whatsappThreadUrl: whatsappUrl },
    });

    return NextResponse.json(
      {
        success: true,
        reference,
        projectRequestId: projectRequest.id,
        whatsappUrl,
        message:
          'Your project brief has been received. A CloseCraft Growth Advisor will review your requirements and reach out via WhatsApp for your consultation.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[Growth Project Request Error]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;
    const isOperator =
      userRole === 'OPERATOR' ||
      userRole === 'SUPER_ADMIN' ||
      userRole === 'ADMIN';

    if (!orgId && !isOperator) {
      return NextResponse.json({ error: 'No organization linked' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (reference) {
      const pr = await db.projectRequest.findFirst({
        where: {
          reference,
          ...(isOperator ? {} : { organizationId: orgId }),
        },
        include: {
          brief: true,
          proposals: {
            include: { lineItems: true },
          },
          milestones: {
            orderBy: { sequenceOrder: 'asc' },
          },
          assignedPartner: true,
        },
      });

      if (!pr) {
        return NextResponse.json({ error: 'Project request not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, projectRequest: pr });
    }

    // List requests
    const requests = await db.projectRequest.findMany({
      where: isOperator ? {} : { organizationId: orgId },
      include: {
        brief: true,
        proposals: {
          include: { lineItems: true },
        },
        milestones: true,
        assignedPartner: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error('[Growth Project Request GET Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve project requests.' }, { status: 500 });
  }
}
