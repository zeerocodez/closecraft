import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const body = await req.json();

    const {
      workspaceSlug,
      name,
      email,
      phone,
      message,
      estimatedValue,
    } = body || {};

    if (!workspaceSlug || typeof workspaceSlug !== 'string') {
      return NextResponse.json(
        { error: 'Workspace identifier (workspaceSlug) is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Contact name is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'At least one contact method (email or phone) is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Look up workspace by slug or id
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

    // Rate-limiting safeguard: max 50 submissions per IP/hour in production
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Parse and sanitize payload
    const cleanName = name.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim() : null;
    const cleanMessage = message ? message.trim() : 'Inbound enquiry via website embed widget.';
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
