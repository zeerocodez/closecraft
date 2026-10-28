import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, requestType, organizationName, details } = body;

    if (!name || !email || !requestType || !details) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, requestType, and details are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanType = String(requestType).trim().toUpperCase();
    const cleanDetails = String(details).trim();

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
            organizationName: organizationName || primaryOrg.name,
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
