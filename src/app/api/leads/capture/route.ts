import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkDuplicateLead } from '@/lib/dal/lead';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { rateLimit, clientIp } from '@/lib/rateLimit';

/**
 * Public Lead Capture Endpoint
 * Receives public enquiries from marketing website forms or embedded widgets.
 * Validates syntax, prevents workspace ID spoofing, enforces rate limits,
 * and detects workspace duplicates without silent merging.
 */
export async function POST(req: NextRequest) {
  // Rate limit: max 20 captures per 10 minutes per IP
  const ip = clientIp(req);
  const limiter = await rateLimit(`lead-capture:${ip}`, 20, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot spam check - silent success for automated bots
    if (body.website || body.hpField || body.company_fax) {
      return NextResponse.json({
        success: true,
        message: 'Enquiry received successfully.',
      });
    }

    const {
      workspaceSlug,
      name,
      email,
      phone,
      message,
      source,
      estimatedValue,
      currency,
    } = body;

    // 1. Mandatory workspace validation via public slug (never trust arbitrary organizationId)
    if (!workspaceSlug || typeof workspaceSlug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing workspace identifier.' },
        { status: 400 }
      );
    }

    const org = await db.organization.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true, name: true, status: true, leadRoutingMode: true, whatsappNumber: true }
    });

    if (!org || org.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Workspace not found or temporarily inactive.' },
        { status: 404 }
      );
    }

    // 2. Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Contact or business name is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : null;
    const cleanPhone = phone && typeof phone === 'string' ? phone.trim() : null;

    if (!cleanEmail && !cleanPhone) {
      return NextResponse.json(
        { error: 'At least one contact method (email or phone) is required.' },
        { status: 400 }
      );
    }

    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json(
          { error: 'Invalid email syntax (does not claim mailbox deliverability).' },
          { status: 400 }
        );
      }
    }

    // 3. Format international phone
    let formattedPhone = cleanPhone;
    if (cleanPhone) {
      const normalized = normalizeWhatsAppNumber(cleanPhone);
      formattedPhone = normalized ? '+' + normalized : cleanPhone;
    }

    // 4. Duplicate Check (returns duplicate warning without silent merge)
    const duplicateCheck = await checkDuplicateLead(org.id, cleanEmail || undefined, formattedPhone || undefined);

    // 5. Create Contact and Lead records
    const contact = await db.contact.create({
      data: {
        organizationId: org.id,
        name: name.trim(),
        email: cleanEmail,
        phone: formattedPhone,
        source: source || 'PUBLIC_FORM',
      }
    });

    const lead = await db.lead.create({
      data: {
        organizationId: org.id,
        contactId: contact.id,
        name: name.trim(),
        email: cleanEmail || '',
        phone: formattedPhone,
        message: message ? String(message).slice(0, 2000) : null,
        source: source || 'PUBLIC_WEBSITE',
        status: 'NEW',
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        currency: currency || 'NGN',
        nextAction: 'Initial inquiry review and follow-up outreach',
        nextActionDueAt: new Date(Date.now() + 86400000), // Default 24h SLA
      }
    });

    const isLikelyDuplicate = Boolean(duplicateCheck);
    const duplicateWarning = duplicateCheck 
      ? `Likely duplicate of existing enquiry for ${duplicateCheck.name}`
      : null;

    // 6. Write outbox event for async notifications
    await db.outboxMessage.create({
      data: {
        organizationId: org.id,
        topic: 'lead.created',
        payload: JSON.stringify({
          leadId: lead.id,
          contactId: contact.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          isLikelyDuplicate,
        })
      }
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      duplicateWarning,
      organizationWhatsApp: org.whatsappNumber,
      message: 'Enquiry received successfully.',
    });
  } catch (error: any) {
    console.error('[Public Lead Capture Error]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting your enquiry.' },
      { status: 500 }
    );
  }
}
