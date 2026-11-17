import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rateLimit';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP-level rate limit: max 50 submissions per IP per hour
    const ip = clientIp(req);
    const ipLimiter = await rateLimit(`embed-leads-ip:${ip}`, 50, 60 * 60 * 1000);
    if (!ipLimiter.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions from this network. Please try again in an hour.' },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const {
      workspaceSlug,
      name,
      email,
      phone,
      message,
      estimatedValue,
    } = body;

    // 2. Input validation and string bounds
    if (!workspaceSlug || typeof workspaceSlug !== 'string' || workspaceSlug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workspace identifier (workspaceSlug) is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (workspaceSlug.length > 100) {
      return NextResponse.json(
        { error: 'Workspace identifier exceeds maximum length of 100 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Contact name is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (name.trim().length > 150) {
      return NextResponse.json(
        { error: 'Contact name exceeds maximum length of 150 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'At least one contact method (email or phone) is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (email && (typeof email !== 'string' || email.trim().length > 255)) {
      return NextResponse.json(
        { error: 'Email exceeds maximum length of 255 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (phone && (typeof phone !== 'string' || phone.trim().length > 50)) {
      return NextResponse.json(
        { error: 'Phone number exceeds maximum length of 50 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (message && typeof message === 'string' && message.trim().length > 3000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 3000 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Look up workspace by slug or id
    const org = await db.organization.findFirst({
      where: {
        OR: [
          { slug: workspaceSlug.toLowerCase().trim() },
          { id: workspaceSlug.trim() },
        ]
      },
      select: { id: true, name: true, slug: true }
    });

    if (!org) {
      return NextResponse.json(
        { error: `Workspace not found for identifier: ${workspaceSlug}` },
        { status: 404, headers: corsHeaders }
      );
    }

    // 4. Workspace-level rate limit: max 200 submissions per workspace per hour
    const orgLimiter = await rateLimit(`embed-leads-org:${org.id}`, 200, 60 * 60 * 1000);
    if (!orgLimiter.allowed) {
      return NextResponse.json(
        { error: 'Workspace intake capacity reached. Please try again later.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Parse and sanitize payload
    const cleanName = name.trim();
    const cleanEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : null;
    const cleanPhone = phone && typeof phone === 'string' ? phone.trim() : null;
    const cleanMessage = message && typeof message === 'string' ? message.trim() : 'Inbound enquiry via website embed widget.';
    const parsedValue = estimatedValue ? parseFloat(String(estimatedValue)) : null;

    // Create lead in Revenue Engine
    const lead = await db.lead.create({
      data: {
        organizationId: org.id,
        name: cleanName,
        email: cleanEmail || `${cleanPhone?.replace(/[^0-9]/g, '') || Date.now()}@inbound.closecraft.internal`,
        phone: cleanPhone,
        message: cleanMessage,
        source: 'WEBSITE_WIDGET',
        status: 'NEW',
        estimatedValue: parsedValue && !isNaN(parsedValue) ? parsedValue : null,
        currency: 'NGN',
        buyingIntent: 70, // Baseline inbound intent
        nextAction: 'Triage Inbound Website Lead',
        nextActionDueAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2-hour SLA
      }
    });

    return NextResponse.json(
      {
        success: true,
        leadId: lead.id,
        workspace: org.slug,
        message: 'Lead captured and registered with Revenue Engine successfully.',
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Lead ingestion error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing lead submission.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
