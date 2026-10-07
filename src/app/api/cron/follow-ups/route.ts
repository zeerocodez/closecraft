import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { secretMatches } from '@/lib/security';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isTest = process.env.NODE_ENV !== 'production' && url.searchParams.get('test') === 'true';

  const secret = process.env.CRON_SECRET;
  if (!secret?.trim()) return new NextResponse('Service unavailable', { status: 503 });
  if (!secretMatches(request.headers.get('Authorization'), `Bearer ${secret}`)) {
    return new NextResponse('Unauthorized', { status: 401 });
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
