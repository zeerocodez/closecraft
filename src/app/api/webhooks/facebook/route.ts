import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

interface MetaFieldData {
  name: string;
  values: string[];
}

interface MetaLeadDetails {
  id: string;
  created_time?: string;
  field_data?: MetaFieldData[];
}

/**
 * Fetches real lead details from Meta Graph API using the page or system access token.
 */
async function fetchMetaLeadDetails(
  leadgenId: string,
  accessToken?: string | null
): Promise<{
  name: string;
  email: string;
  phone: string | null;
  responses: Record<string, string>;
} | null> {
  const token = accessToken || process.env.META_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN;
  if (!token) {
    return null;
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.warn(`[Meta Graph API] Failed to fetch lead ${leadgenId}: HTTP ${res.status}`);
      return null;
    }

    const data: MetaLeadDetails = await res.json();
    let name = 'Meta Lead';
    let email = `lead_${leadgenId}@facebook.closecraft.com`;
    let phone: string | null = null;
    const responses: Record<string, string> = {};

    if (Array.isArray(data.field_data)) {
      for (const field of data.field_data) {
        const val = field.values?.[0] || '';
        const fieldName = field.name.toLowerCase();

        if (fieldName === 'full_name' || fieldName === 'name') {
          if (val) name = val;
        } else if (fieldName === 'first_name') {
          name = val;
        } else if (fieldName === 'last_name' && name) {
          name = `${name} ${val}`.trim();
        } else if (fieldName === 'email') {
          if (val && val.includes('@')) email = val.trim().toLowerCase();
        } else if (fieldName === 'phone_number' || fieldName === 'phone') {
          if (val) phone = val.trim();
        } else {
          responses[field.name] = val;
        }
      }
    }

    return { name, email, phone, responses };
  } catch (err: any) {
    console.error(`[Meta Graph API] Error retrieving lead ${leadgenId}:`, err.message);
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
  if (!verifyToken) {
    console.error('[Facebook Webhook] FACEBOOK_VERIFY_TOKEN is unconfigured.');
    return new NextResponse('Configuration error', { status: 500 });
  }

  if (mode === 'subscribe' && token && timingSafeEqualString(token, verifyToken)) {
    console.log('[Facebook Webhook] Verified successfully with Meta');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const limiter = await rateLimit(`fb-webhook:${ip}`, 120, 60 * 1000);
    if (!limiter.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');
    const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET;

    if (appSecret) {
      if (!signature) {
        console.warn('[Facebook Webhook] Missing x-hub-signature');
        return new NextResponse('Missing signature', { status: 401 });
      }
      const expected256 = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const expected1 = 'sha1=' + crypto.createHmac('sha1', appSecret).update(rawBody).digest('hex');
      const isValid = timingSafeEqualString(signature, expected256) || timingSafeEqualString(signature, expected1);
      if (!isValid) {
        console.warn('[Facebook Webhook] Invalid signature rejected');
        return new NextResponse('Invalid signature', { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[Facebook Webhook] FACEBOOK_APP_SECRET / META_APP_SECRET unconfigured in production');
      return new NextResponse('Configuration error', { status: 500 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    if (body.object !== 'page' || !Array.isArray(body.entry)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Process each entry
    for (const entry of body.entry) {
      const pageId = String(entry.id || entry.page_id || '');

      // Identify tenant organization by facebookPageId or active pilot engagement
      let org = null;
      if (pageId) {
        org = await db.organization.findFirst({
          where: { facebookPageId: pageId },
        });
      }

      if (!org) {
        // Fallback: check if there's a managed lead generation pilot engagement
        const pilot = await db.pilotEngagement.findFirst({
          where: {
            serviceType: 'MANAGED_LEAD_GENERATION',
            status: { in: ['ACTIVE', 'ONBOARDING'] },
          },
          include: { organization: true },
        });
        org = pilot?.organization || null;
      }

      if (!org) {
        // Fallback to primary workspace
        org = await db.organization.findFirst({
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (!org) {
        console.warn(`[Facebook Webhook] No target organization found for page ${pageId}`);
        continue;
      }

      if (!Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadData = change.value;
          const leadgenId = String(leadData.leadgen_id);

          // Attempt Graph API fetch to get real prospect data
          const graphDetails = await fetchMetaLeadDetails(leadgenId, org.metaAccessToken);

          const leadName = graphDetails?.name || 'Meta Ad Enquiry';
          const leadEmail = graphDetails?.email || `fb_lead_${leadgenId}@facebook.closecraft.com`;
          const leadPhone = graphDetails?.phone || null;
          const responseSummary = graphDetails?.responses && Object.keys(graphDetails.responses).length > 0
            ? Object.entries(graphDetails.responses).map(([k, v]) => `${k}: ${v}`).join('\n')
            : null;

          const notes = [
            `Meta Lead Form: ${leadData.form_id || 'Instant Form'}`,
            `Ad ID: ${leadData.ad_id || 'Not specified'}`,
            `Campaign / Adset: ${leadData.adgroup_id || 'Standard'}`,
            responseSummary ? `\nResponses:\n${responseSummary}` : '',
          ].filter(Boolean).join('\n');

          // Upsert lead in organization workspace CRM
          const lead = await db.lead.upsert({
            where: {
              id: `fb_${leadgenId}`,
            },
            update: {
              name: leadName,
              email: leadEmail,
              phone: leadPhone,
              message: notes,
            },
            create: {
              id: `fb_${leadgenId}`,
              organizationId: org.id,
              type: 'SALES_LEAD',
              name: leadName,
              email: leadEmail,
              phone: leadPhone,
              source: 'FACEBOOK_LEAD_AD',
              status: 'NEW',
              nextAction: 'First response via WhatsApp or call',
              nextActionDueAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour first response SLA
              message: notes,
            },
          });

          // Dispatch domain event to background engine for notifications / routing
          await inngest.send({
            name: 'revenue/lead.created',
            data: {
              leadId: lead.id,
              organizationId: org.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              source: 'FACEBOOK_LEAD_AD',
              message: notes,
            },
          });

          console.log(`[Facebook Webhook] Created lead ${lead.id} (${lead.name}) for organization ${org.name}`);
        }
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error: any) {
    console.error('[Facebook Webhook] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
