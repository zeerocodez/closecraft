import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { z } from 'zod';

const LeadIngestionSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(80).default('Marketing Website'),
  organizationId: z.string().min(1),
});

export async function POST(req: Request) {
  // Rate limit: max 30 leads per 10 minutes per IP
  const ip = clientIp(req);
  const limiter = await rateLimit(`leads-webhook:${ip}`, 30, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const apiKey = req.headers.get('x-closecraft-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const validSecret = process.env.LEADS_WEBHOOK_SECRET || process.env.AUTH_SECRET;
    if (validSecret) {
      const { timingSafeEqualString } = await import('@/lib/apiSecurity');
      if (!apiKey || !timingSafeEqualString(apiKey, validSecret)) {
        return NextResponse.json({ error: 'Unauthorized: Valid webhook authorization key required.' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Server misconfiguration: Webhook secret unconfigured.' }, { status: 500 });
    }

    const body = await req.json();

    // Validate the incoming payload
    const validation = LeadIngestionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const validatedData = validation.data;

    // Verify the organization exists
    const organization = await db.organization.findUnique({
      where: { id: validatedData.organizationId },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    // 1. Ingest the Lead into the core Revenue Engine
    const lead = await db.lead.create({
      data: {
        name: validatedData.name.trim(),
        email: validatedData.email.toLowerCase().trim(),
        phone: validatedData.phone?.trim() || null,
        message: validatedData.message?.trim() || null,
        source: validatedData.source,
        status: 'NEW', // All ingested leads start as NEW
        organizationId: validatedData.organizationId,
      },
    });

    // 2. Fire the Background Event (Decouples web request from AI qualification)
    await inngest.send({
      name: 'revenue/lead.created',
      data: {
        leadId: lead.id,
        name: lead.name,
        email: lead.email,
        source: lead.source || 'Unknown',
        organizationId: lead.organizationId,
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Error ingesting lead:', error);
    return NextResponse.json({ error: 'Failed to ingest lead' }, { status: 500 });
  }
}
