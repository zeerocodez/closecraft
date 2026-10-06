import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processLeadWithAI } from '@/lib/ai/qualificationEngine';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Verify the webhook with Meta
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp Webhook verified!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
          const phoneNumberId = metadata.phone_number_id || 'UNKNOWN';
          
          for (const message of messages) {
            console.log('Received WhatsApp message:', message);
            const contactName = contacts.find((c: any) => c.wa_id === message.from)?.profile?.name || message.from;
            // Process message (create Lead if new, append to Conversation)
            await processWhatsAppMessage(message, contactName, phoneNumberId);
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

async function processWhatsAppMessage(message: any, contactName: string, phoneNumberId: string) {
  // Extract details
  const fromPhone = message.from;
  const content = message.text?.body || '';
  
  if (!content) return; // Only processing text for now

  // In a production multi-tenant system, we must resolve the Organization
  // based on the phone_number_id (which tenant owns this WhatsApp number).
  // For the MVP, we fallback to the primary tenant if none specified.
  let org = await db.organization.findFirst({
    where: { slug: 'acme-corp' } // Try to find a specific demo org
  });
  
  if (!org) {
    org = await db.organization.findFirst();
  }

  if (!org) {
    console.error(`[Webhook Error] No organization found to attach lead for WhatsApp number: ${phoneNumberId}`);
    return;
  }

  // Find or create lead
  let lead = await db.lead.findFirst({
    where: { 
      phone: fromPhone,
      organizationId: org.id 
    }
  });

  if (!lead) {
    lead = await db.lead.create({
      data: {
        organizationId: org.id,
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
      channel: 'WHATSAPP'
    }
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        leadId: lead.id,
        organizationId: org.id,
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
