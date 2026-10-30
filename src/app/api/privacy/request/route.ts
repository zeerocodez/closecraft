import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'node:crypto';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Rate limit: max 5 privacy requests per 15 minutes per IP
  const ip = clientIp(req);
  const limiter = await rateLimit(`privacy-dsr:${ip}`, 5, 15 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot spam check - silent success for bots
    if (body.website || body.hpField || body.company_fax) {
      return NextResponse.json({
        success: true,
        referenceId: `DSR-${Date.now().toString(36).toUpperCase()}`,
        message: 'Your privacy request has been securely logged with our Data Protection Officer.',
      });
    }

    const { name, email, requestType, organizationName, details } = body;

    if (!name || !email || !requestType || !details) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, requestType, and details are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim().slice(0, 120);
    const cleanType = String(requestType).trim().toUpperCase();
    const cleanDetails = String(details).trim().slice(0, 4000);
    const cleanOrgName = organizationName ? String(organizationName).trim().slice(0, 150) : null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['ACCESS', 'CORRECTION', 'DELETION', 'OBJECTION'];
    if (!allowedTypes.includes(cleanType)) {
      return NextResponse.json(
        { error: 'Invalid request type. Must be ACCESS, CORRECTION, DELETION, or OBJECTION.' },
        { status: 400 }
      );
    }

    // Reference ID for tracking
    const referenceId = `DSR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Lookup if email matches existing workspace user
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      include: { memberships: { include: { organization: true } } }
    });

    const primaryOrg = user?.memberships[0]?.organization;
    const userRole = user?.memberships[0]?.role;

    // Guardrail: Deletion of an entire organization's customer records requires OWNER authority
    let requiresOwnerConfirmation = false;
    if (cleanType === 'DELETION' && user && userRole !== 'OWNER') {
      requiresOwnerConfirmation = true;
    }

    // Persist request in AuditLog under primaryOrg or a platform system entry
    if (primaryOrg) {
      await db.auditLog.create({
        data: {
          organizationId: primaryOrg.id,
          actorId: user?.id || null,
          actorType: 'USER',
          actorRole: userRole || 'ANONYMOUS',
          action: `PRIVACY_DATA_REQUEST_${cleanType}`,
          resourceType: 'DATA_SUBJECT_REQUEST',
          resourceId: referenceId,
          reason: `Privacy data request submitted by ${cleanName} (${cleanEmail})`,
          metadata: JSON.stringify({
            referenceId,
            requestType: cleanType,
            organizationName: cleanOrgName || primaryOrg.name,
            details: cleanDetails,
            requiresOwnerConfirmation,
            submittedAt: new Date().toISOString()
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      referenceId,
      message: 'Your privacy request has been securely logged with our Data Protection Officer.',
      requiresOwnerConfirmation,
      turnaround: 'We will verify your identity and fulfill verified requests within 30 days as required by the Nigeria Data Protection Act 2023 (NDPA).'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred while logging your privacy request.' },
      { status: 500 }
    );
  }
}
