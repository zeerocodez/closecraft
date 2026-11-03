import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendTransactionalEmail } from '@/lib/email';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'node:crypto';

const VALID_SERVICE_TYPES = [
  'LEAD_GENERATION',
  'SOFTWARE_FOLLOWUP',
  'TEAM_TRAINING',
  'MANAGED_SALES',
] as const;

type ValidServiceType = typeof VALID_SERVICE_TYPES[number];

function getServicePrefix(serviceType: ValidServiceType): string {
  switch (serviceType) {
    case 'LEAD_GENERATION':
      return 'REQ-LG';
    case 'SOFTWARE_FOLLOWUP':
      return 'REQ-SW';
    case 'TEAM_TRAINING':
      return 'REQ-TT';
    case 'MANAGED_SALES':
      return 'REQ-MS';
    default:
      return 'REQ-SR';
  }
}

function generateReference(serviceType: ValidServiceType): string {
  const prefix = getServicePrefix(serviceType);
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars
  return `${prefix}-${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limiter = await rateLimit(`service-request:${ip}`, 15, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot check
    if (body.hpField || body.company_fax || body.botField) {
      return NextResponse.json({
        success: true,
        reference: `REQ-LG-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        message: 'Your service request has been received.',
      }, { status: 201 });
    }

    const {
      contactName,
      contactEmail,
      contactPhone,
      companyName,
      serviceType,
      answers,
      organizationId,
      sourceAttribution,
    } = body;

    // Validation
    if (!contactName || typeof contactName !== 'string' || contactName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid contact name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!contactEmail || typeof contactEmail !== 'string' || !contactEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanServiceType = (serviceType || '').trim().toUpperCase() as ValidServiceType;
    if (!VALID_SERVICE_TYPES.includes(cleanServiceType)) {
      return NextResponse.json(
        { error: `Invalid service type. Must be one of: ${VALID_SERVICE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const cleanEmail = contactEmail.trim().toLowerCase();
    const cleanName = contactName.trim().slice(0, 120);
    const cleanCompany = companyName ? String(companyName).trim().slice(0, 150) : null;
    const cleanPhone = contactPhone ? String(contactPhone).trim().slice(0, 40) : null;
    const cleanAttribution = sourceAttribution ? String(sourceAttribution).trim().slice(0, 200) : 'Website Assessment';

    // Generate unique reference ID
    let reference = generateReference(cleanServiceType);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.serviceRequest.findUnique({ where: { reference } });
      if (!existing) break;
      reference = generateReference(cleanServiceType);
      attempts++;
    }

    const serializedAnswers = typeof answers === 'string' 
      ? answers 
      : JSON.stringify(answers || {});

    const stageHistory = JSON.stringify([
      {
        stage: 'NEW',
        changedAt: new Date().toISOString(),
        note: 'Service request submitted from interactive diagnostic / website form.',
      },
    ]);

    const serviceRequest = await db.serviceRequest.create({
      data: {
        reference,
        organizationId: organizationId || null,
        serviceType: cleanServiceType,
        stage: 'NEW',
        contactName: cleanName,
        contactEmail: cleanEmail,
        contactPhone: cleanPhone,
        companyName: cleanCompany,
        answers: serializedAnswers,
        sourceAttribution: cleanAttribution,
        stageHistory,
      },
    });

    // Send confirmation email asynchronously (ignore failures)
    try {
      const serviceDisplay = cleanServiceType.replace(/_/g, ' ');
      await sendTransactionalEmail({
        to: cleanEmail,
        subject: `Your Closecraft Service Request (${reference})`,
        text: `Hello ${cleanName},\n\nThank you for submitting your request for ${serviceDisplay}. Your request reference is ${reference}.\n\nOur team will review your assessment answers and reach out within 1 business day with next steps.\n\nWarm regards,\nThe Closecraft Team`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
          <h2 style="color: #248277;">Closecraft Service Request Received</h2>
          <p>Hello <strong>${cleanName}</strong>,</p>
          <p>Thank you for submitting your assessment for <strong>${serviceDisplay}</strong>.</p>
          <div style="background: #f4f6f8; border-left: 4px solid #248277; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #555;">Request Reference:</p>
            <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #111;">${reference}</p>
          </div>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will review your answers within 1 business day.</li>
            <li>We will confirm suitability and answer any specific questions.</li>
            <li>If ready, we will schedule a brief discovery call to agree on commercial terms.</li>
          </ul>
          <p style="margin-top: 24px; font-size: 13px; color: #888;">Closecraft · Sales Follow-Up Software & Connected Sales Services</p>
        </div>`,
      });
    } catch {
      // Non-blocking email send
    }

    return NextResponse.json(
      {
        success: true,
        reference,
        serviceRequest: {
          id: serviceRequest.id,
          reference: serviceRequest.reference,
          serviceType: serviceRequest.serviceType,
          stage: serviceRequest.stage,
          contactName: serviceRequest.contactName,
          contactEmail: serviceRequest.contactEmail,
          createdAt: serviceRequest.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating service request:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your service request.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get('stage');
  const serviceType = searchParams.get('serviceType');
  const userOrgId = (session.user as any).organizationId;
  const userRole = (session.user as any).role;

  const whereClause: any = {};

  // Tenant isolation: non-super-admins can only see requests for their own organization or matching their email
  if (userRole !== 'SUPER_ADMIN' && userRole !== 'OPERATOR') {
    if (!userOrgId) {
      whereClause.contactEmail = session.user.email?.toLowerCase();
    } else {
      whereClause.OR = [
        { organizationId: userOrgId },
        { contactEmail: session.user.email?.toLowerCase() },
      ];
    }
  }

  if (stage) whereClause.stage = stage;
  if (serviceType) whereClause.serviceType = serviceType;

  try {
    const requests = await db.serviceRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, serviceRequests: requests });
  } catch (err: any) {
    console.error('Error fetching service requests:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve service requests.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id, stage, nextAction, nextActionDueAt, assignedOwnerId, internalNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing request ID.' }, { status: 400 });
    }

    const existing = await db.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Service request not found.' }, { status: 404 });
    }

    const userOrgId = (session.user as any).organizationId;
    const userRole = (session.user as any).role;

    // Tenant check
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'OPERATOR' && existing.organizationId !== userOrgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build stage history update
    let updatedHistory = existing.stageHistory;
    if (stage && stage !== existing.stage) {
      try {
        const historyArr = existing.stageHistory ? JSON.parse(existing.stageHistory) : [];
        historyArr.push({
          stage,
          previousStage: existing.stage,
          changedAt: new Date().toISOString(),
          changedBy: session.user.email || 'operator',
        });
        updatedHistory = JSON.stringify(historyArr);
      } catch {
        // preserve history format
      }
    }

    const updated = await db.serviceRequest.update({
      where: { id },
      data: {
        ...(stage ? { stage } : {}),
        ...(nextAction !== undefined ? { nextAction } : {}),
        ...(nextActionDueAt !== undefined ? { nextActionDueAt: nextActionDueAt ? new Date(nextActionDueAt) : null } : {}),
        ...(assignedOwnerId !== undefined ? { assignedOwnerId } : {}),
        ...(internalNotes !== undefined ? { internalNotes } : {}),
        stageHistory: updatedHistory,
      },
    });

    return NextResponse.json({ success: true, serviceRequest: updated });
  } catch (err: any) {
    console.error('Error updating service request:', err);
    return NextResponse.json(
      { error: 'Failed to update service request.' },
      { status: 500 }
    );
  }
}

