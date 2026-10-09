import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
 try {
 const session = await auth();
 if (!session?.user || !session.organizationId) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const body = await request.json();
 const { conversationId, content, senderType = 'HUMAN' } = body;

 if (!conversationId || !content) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
 }

 // Verify conversation belongs to this organization
 const conversation = await db.conversation.findUnique({
 where: { id: conversationId },
 include: { lead: true }
 });

 if (!conversation || conversation.organizationId !== session.organizationId) {
 return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
 }

 // Insert the message into the DB
 const message = await db.message.create({
 data: {
 conversationId,
 content,
 senderType
 }
 });

 // Update conversation's updatedAt timestamp to bubble it up in the inbox
 await db.conversation.update({
 where: { id: conversationId },
 data: { updatedAt: new Date() }
 });

 // Update lead's updatedAt timestamp too
 await db.lead.update({
 where: { id: conversation.leadId },
 data: { updatedAt: new Date() }
 });

 // ==========================================
 // SEND TO WHATSAPP META CLOUD API
 // ==========================================
 const phoneNumber = conversation.lead.phone;
 if (phoneNumber) {
 console.log(`[WhatsApp API Mock] Sending message to ${phoneNumber}: "${content}"`);
 
 // In production:
 /*
 await fetch(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 messaging_product: 'whatsapp',
 to: phoneNumber,
 type: 'text',
 text: { body: content }
 })
 });
 */
 }

 return NextResponse.json({ success: true, message }, { status: 201 });
 } catch (error) {
 console.error('Failed to send message:', error);
 return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
 }
}
