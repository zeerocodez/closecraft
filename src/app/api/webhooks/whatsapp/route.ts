import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RevenueEngine } from '@/lib/revenue-engine/engine';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Both product webhooks (Pages/Lead Ads and WhatsApp) belong to the same
  // Meta app, and operators commonly configure a single verify token in the
  // dashboard. Accept the shared app verify token as a fallback so a missing
  // WhatsApp-specific variable cannot silently block webhook verification.
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || process.env.FACEBOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN;
  if (!verifyToken) {
    console.error('[WhatsApp Webhook] No webhook verify token configured (WHATSAPP_VERIFY_TOKEN / FACEBOOK_VERIFY_TOKEN).');
    return new NextResponse('Configuration error', { status: 500 });
  }

  // Verify the webhook subscription with Meta
  if (mode === 'subscribe' && token && timingSafeEqualString(token, verifyToken)) {
    console.log('[WhatsApp Webhook] Verified successfully with Meta');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limiter = await rateLimit(`wa-webhook:${ip}`, 120, 60 * 1000);
    if (!limiter.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

    // Cryptographic signature verification per AGENTS.md
    if (appSecret) {
      if (!signature) {
        console.warn('[WhatsApp Webhook] Missing x-hub-signature-256');
        return new NextResponse('Missing signature', { status: 401 });
      }
      const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      if (!timingSafeEqualString(signature, expected)) {
        console.warn('[WhatsApp Webhook] Invalid signature rejected');
        return new NextResponse('Invalid signature', { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[WhatsApp Webhook] WHATSAPP_APP_SECRET / META_APP_SECRET unconfigured in production');
      return new NextResponse('Configuration error', { status: 500 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Invalid JSON', { status: 400 });
    }

    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('Not Found', { status: 404 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const val = change.value;
        if (!val) continue;

        // 1. Process delivery & read status updates from WhatsApp Cloud API
        if (Array.isArray(val.statuses)) {
          for (const st of val.statuses) {
            const providerMsgId = st.id;
            const rawStatus = (st.status || '').toUpperCase();
            if (providerMsgId && rawStatus) {
              const mappedStatus = rawStatus === 'READ' ? 'DELIVERED' : rawStatus;
              await db.message.updateMany({
                where: { providerMessageId: providerMsgId },
                data: {
                  status: mappedStatus,
                  deliveredAt: rawStatus === 'DELIVERED' || rawStatus === 'READ' ? new Date() : undefined,
                  readAt: rawStatus === 'READ' ? new Date() : undefined,
                  errorMessage: st.errors ? JSON.stringify(st.errors) : undefined,
                },
              }).catch(() => null);
            }
          }
        }

        // 2. Process incoming messages
        if (Array.isArray(val.messages)) {
          const messages = val.messages;
          const contacts = val.contacts || [];
          const metadata = val.metadata || {};
          const phoneNumberId = String(metadata.phone_number_id || '').trim();

          for (const message of messages) {
            const contactName = contacts.find((c: any) => c.wa_id === message.from)?.profile?.name || message.from;
            await processWhatsAppMessage(message, contactName, phoneNumberId);
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processWhatsAppMessage(message: any, contactName: string, phoneNumberId: string) {
  const fromPhone = message.from;
  const content = message.text?.body || message.button?.text || '';
  const messageId = String(message.id || `wa_msg_${fromPhone}_${Date.now()}`);

  if (!content) return; // Only text and button interactions supported currently

  // 1. Duplicate Event Protection & Idempotency
  const existingEvent = await db.webhookEvent.findUnique({
    where: { eventId: messageId },
  });
  if (existingEvent) {
    console.log(`[WhatsApp Webhook] Duplicate message ID ${messageId} already processed. Skipping.`);
    return;
  }

  // 2. Strict Multi-Tenant Organization Resolution by verified Phone Number ID
  // NEVER use a generic fallback or select the first approved organization
  let org = null;
  if (phoneNumberId && phoneNumberId !== 'UNKNOWN') {
    org = await db.organization.findFirst({
      where: {
        OR: [
          { whatsappPhoneNumberId: phoneNumberId },
          { whatsappNumber: { contains: phoneNumberId } },
        ],
        status: { in: ['APPROVED', 'PENDING'] },
      },
    });
  }

  // If unmapped, quarantine immediately to prevent cross-tenant data leakage
  if (!org) {
    console.warn(`[WhatsApp Webhook] Quarantining message: Unmapped WhatsApp Phone Number ID "${phoneNumberId}". Dropping to prevent cross-tenant contamination.`);
    await db.webhookEvent.create({
      data: {
        eventId: messageId,
        provider: 'WHATSAPP',
        eventType: 'messages.quarantined',
        status: 'IGNORED',
        payload: JSON.stringify({
          messageId,
          phoneNumberId,
          fromPhone,
          contactName,
          reason: 'UNMAPPED_WHATSAPP_PHONE_NUMBER_ID',
        }),
      },
    }).catch(() => null);

    return;
  }

  // Record successful event ingestion
  await db.webhookEvent.create({
    data: {
      eventId: messageId,
      provider: 'WHATSAPP',
      eventType: 'messages.received',
      status: 'PROCESSED',
      payload: JSON.stringify({
        organizationId: org.id,
        phoneNumberId,
        fromPhone,
        contactName,
      }),
    },
  }).catch(() => null);

  // 3. Find or create Lead strictly scoped to the resolved organization
  let lead = await db.lead.findFirst({
    where: {
      phone: fromPhone,
      organizationId: org.id,
    },
  });

  const isOptOut = /^(stop|unsubscribe|cancel|opt\s*out)$/i.test(content.trim());

  if (!lead) {
    lead = await db.lead.create({
      data: {
        organizationId: org.id,
        type: 'SALES_LEAD',
        name: contactName,
        email: `${fromPhone.replace(/[^0-9]/g, '')}@inbound.whatsapp.internal`,
        phone: fromPhone,
        message: content,
        source: 'WHATSAPP',
        status: isOptOut ? 'LOST' : 'NEW',
        optedOutOfMarketing: isOptOut,
        optedOutAt: isOptOut ? new Date() : null,
        disqualificationReason: isOptOut ? 'Customer requested opt-out via WhatsApp (STOP)' : null,
        buyingIntent: 50,
        currency: 'NGN',
        nextAction: isOptOut ? 'Opted out - no further outreach' : 'First touch via WhatsApp',
        nextActionDueAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour SLA
      },
    });
  } else if (isOptOut) {
    await db.lead.update({
      where: { id: lead.id },
      data: {
        optedOutOfMarketing: true,
        optedOutAt: new Date(),
        status: 'LOST',
        disqualificationReason: 'Customer requested opt-out via WhatsApp (STOP)',
        nextAction: 'Opted out - no further outreach',
      },
    });
    console.log(`[WhatsApp Webhook] Prospect ${fromPhone} in org ${org.slug} marked as opted-out.`);
    return;
  }

  // 4. Find or create Conversation strictly scoped to the organization
  let conversation = await db.conversation.findFirst({
    where: {
      leadId: lead.id,
      organizationId: org.id,
      channel: 'WHATSAPP',
    },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        leadId: lead.id,
        organizationId: org.id,
        channel: 'WHATSAPP',
        status: 'ACTIVE',
      },
    });
  }

  // 5. Create Message record
  await db.message.create({
    data: {
      conversationId: conversation.id,
      content,
      senderType: 'PROSPECT',
      status: 'DELIVERED',
      providerMessageId: messageId,
      deliveredAt: new Date(),
    },
  });

  console.log(`[WhatsApp Webhook] Ingested message from ${contactName} (${fromPhone}) into org "${org.name}" (Lead ID: ${lead.id})`);

  // 6. Canonical Revenue Engine Evaluation
  // Evaluates intent, fit, urgency, value, assigns sales reps and sets Next Best Action
  try {
    await RevenueEngine.processNewLead(lead.id);
  } catch (err: any) {
    console.error(`[WhatsApp Webhook] RevenueEngine evaluation error for lead ${lead.id}:`, err.message);
  }
}
