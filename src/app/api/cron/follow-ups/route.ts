import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
 const url = new URL(request.url);
 const isTest = url.searchParams.get('test') === 'true';

 // Secure this endpoint by verifying the Vercel cron secret
 // Bypass only if running locally in test mode
 if (!isTest || process.env.NODE_ENV === 'production') {
 const authHeader = request.headers.get('Authorization');
 if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 console.warn('[Follow-Up Engine] Unauthorized cron execution attempt');
 return new NextResponse('Unauthorized', { status: 401 });
 }
 }

 try {
 // 1. Find all active conversations
 // For real production, threshold is usually 24 hours. For testing, we might ignore time or use 1 minute.
 const thresholdDate = new Date(Date.now() - (isTest ? 60 * 1000 : 24 * 60 * 60 * 1000));

 const staleConversations = await db.conversation.findMany({
 where: {
 status: 'ACTIVE',
 updatedAt: {
 lt: thresholdDate
 },
 lead: {
 status: {
 in: ['NEW', 'ENGAGED', 'QUALIFYING']
 }
 }
 },
 include: {
 lead: true
 }
 });

 console.log(`[Follow-Up Engine] Found ${staleConversations.length} stale conversations to follow up.`);

 let processedCount = 0;

 for (const conversation of staleConversations) {
 const lead = conversation.lead;

 // 2. Determine "Next Best Action"
 let followUpText = "Hi there, just checking in to see if you had any more questions about CloseCraft?";
 
 if (lead.buyingIntent && lead.buyingIntent >= 80) {
 followUpText = `Hi ${lead.name.split(' ')[0]}, you mentioned you were very interested. Did you want me to go ahead and get a specialist to call you today?`;
 } else if (lead.status === 'NEW') {
 followUpText = `Hi ${lead.name.split(' ')[0]}, I noticed you reached out but we haven't properly connected yet. What's the main goal you are trying to achieve?`;
 }

 // 3. Save AI message
 await db.message.create({
 data: {
 conversationId: conversation.id,
 content: followUpText,
 senderType: 'AI'
 }
 });

 // 4. Update timestamps to reset the inactivity clock
 await db.conversation.update({
 where: { id: conversation.id },
 data: { updatedAt: new Date() }
 });

 await db.lead.update({
 where: { id: lead.id },
 data: { updatedAt: new Date() }
 });

 console.log(`[WhatsApp API Mock] Sending Automated Follow-Up to ${lead.phone}: "${followUpText}"`);
 processedCount++;
 }

 return NextResponse.json({ success: true, processed: processedCount }, { status: 200 });

 } catch (error) {
 console.error('[Follow-Up Engine] Error:', error);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
