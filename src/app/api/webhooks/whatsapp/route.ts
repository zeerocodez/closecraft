import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validSignature, secretMatches } from '@/lib/security';
import { z } from 'zod';

const payloadSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({ changes: z.array(z.object({ value: z.object({
    metadata: z.object({ phone_number_id: z.string().min(1) }),
    messages: z.array(z.object({ from: z.string().regex(/^\d{5,20}$/), text: z.object({ body: z.string().max(10000) }).optional() })).optional(),
    contacts: z.array(z.object({ wa_id: z.string(), profile: z.object({ name: z.string().max(200) }).optional() })).optional(),
  }) })) })),
});
type IncomingMessage = z.infer<typeof payloadSchema>['entry'][number]['changes'][number]['value']['messages'];

import { processLeadWithAI } from '@/lib/ai/qualificationEngine';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Verify the webhook with Meta
  if (mode === 'subscribe' && challenge && secretMatches(token, process.env.WHATSAPP_VERIFY_TOKEN)) {
    console.log('WhatsApp Webhook verified!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const secret = process.env.WHATSAPP_APP_SECRET;
    if (!secret?.trim()) return new NextResponse('Service unavailable', { status: 503 });
    const raw = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature?.startsWith('sha256=') || !validSignature(raw, signature.slice(7), secret, 'sha256')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }
    const result = payloadSchema.safeParse(parsed);
    if (!result.success) return new NextResponse('Invalid payload', { status: 400 });
    const body = result.data;
    // Resolve every number before any writes to prevent partial cross-tenant processing.
    const organizations = new Map<string, string>();
    for (const entry of body.entry) for (const change of entry.changes) {
      if (!change.value.messages?.length) continue;
      const phoneId = change.value.metadata.phone_number_id;
      const org = await db.organization.findUnique({ where: { whatsappPhoneNumberId: phoneId }, select: { id: true } });
      if (!org) return new NextResponse('Unknown phone number', { status: 403 });
      organizations.set(phoneId, org.id);
    }

    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Acknowledge receipt to Meta quickly
    // In production, we would queue this processing (e.g. Inngest) to guarantee we return 200 OK fast
    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.value && change.value.messages) {
          const messages = change.value.messages;
          const contacts = change.value.contacts || [];
          const metadata = change.value.metadata || {};
          const phoneNumberId = metadata.phone_number_id;

          for (const message of messages) {
            const contactName = contacts.find((c) => c.wa_id === message.from)?.profile?.name || message.from;
            // Process message (create Lead if new, append to Conversation)
            await processWhatsAppMessage(message, contactName, organizations.get(phoneNumberId)!);
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processWhatsAppMessage(message: NonNullable<IncomingMessage>[number], contactName: string, organizationId: string) {
  // Extract details
  const fromPhone = message.from;
  const content = message.text?.body || '';

  if (!content) return; // Only processing text for now

  // Find or create lead
  let lead = await db.lead.findFirst({
    where: {
      phone: fromPhone,
      organizationId: organizationId
    }
  });

  if (!lead) {
    lead = await db.lead.create({
      data: {
        organizationId: organizationId,
        type: 'SALES_LEAD',
        name: contactName,
        email: `${fromPhone}@whatsapp.local`, // Dummy email since it's required in schema
        phone: fromPhone,
        source: 'WhatsApp',
        status: 'NEW',
        buyingIntent: 50,
      }
    });
  }

  // Find or create conversation
  let conversation = await db.conversation.findFirst({
    where: {
      leadId: lead.id,
      channel: 'WHATSAPP',
      organizationId,
    }
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        leadId: lead.id,
        organizationId: organizationId,
        channel: 'WHATSAPP',
        status: 'ACTIVE'
      }
    });
  }

  // Create message
  await db.message.create({
    data: {
      conversationId: conversation.id,
      content: content,
      senderType: 'PROSPECT'
    }
  });

  console.log(`Saved incoming message from ${contactName} to Lead ID: ${lead.id}`);

  // Trigger AI Qualification / Response
  const aiResult = await processLeadWithAI(lead.id, content);

  if (aiResult.shouldReply && aiResult.draftReply) {
    // Save AI response
    await db.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResult.draftReply,
        senderType: 'AI'
      }
    });

    // Mock sending via WhatsApp API
    console.log(`[WhatsApp API Mock] Sending AI reply to ${fromPhone}: "${aiResult.draftReply}"`);
  } else if (!aiResult.shouldReply && aiResult.handoffReason) {
    console.log(`[AI Engine] Halted auto-reply for lead ${lead.id}. Reason: ${aiResult.handoffReason}`);
  }
}
