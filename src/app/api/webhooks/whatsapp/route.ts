import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processLeadWithAI } from '@/lib/ai/qualificationEngine';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    console.error('[WhatsApp Webhook] WHATSAPP_VERIFY_TOKEN is unconfigured.');
    return new NextResponse('Configuration error', { status: 500 });
  }

  // Verify the webhook with Meta
  if (mode === 'subscribe' && token && timingSafeEqualString(token, verifyToken)) {
    console.log('WhatsApp Webhook verified!');
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

 // Resolve the Organization by phone_number_id or dedicated pilot slug
 let org = await db.organization.findFirst({
 where: { slug: 'zeerocodes' }
 });
 
 if (!org) {
 org = await db.organization.findFirst({
 where: { plan: 'FREE_PILOT', status: 'APPROVED' }
 });
 }

 if (!org) {
 console.warn(`[WhatsApp Webhook] Unmapped phone number ID ${phoneNumberId}. Dropping to prevent cross-tenant contamination.`);
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
 email: '', // Genuine phone-first record, no fabricated email
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
