import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sharedRateLimit, clientIp } from '@/lib/rateLimit';
import { z } from 'zod';

const payloadSchema = z.object({
  workspaceSlug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().min(1).max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  estimatedValue: z.coerce.number().finite().nonnegative().max(1e12).optional(),
}).refine(data => data.email || data.phone, 'A contact method is required');

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
    const ipLimit = await sharedRateLimit(`widget-ip:${clientIp(req)}`, 50, 60 * 60 * 1000);
    if (!ipLimit.allowed) return NextResponse.json({ error: 'Too many submissions.' }, { status: 429, headers: corsHeaders });
    const reader = req.body?.getReader();
    if (!reader) return NextResponse.json({ error: 'Missing body.' }, { status: 400, headers: corsHeaders });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        return NextResponse.json({ error: 'Payload too large.' }, { status: 413, headers: corsHeaders });
      }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    const parsed = payloadSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400, headers: corsHeaders });
    const body = parsed.data;

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

    const workspaceLimit = await sharedRateLimit(`widget-org:${org.id}`, 500, 60 * 60 * 1000);
    if (!workspaceLimit.allowed) return NextResponse.json({ error: 'Too many submissions.' }, { status: 429, headers: corsHeaders });

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
      { error: 'Unable to process submission.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
