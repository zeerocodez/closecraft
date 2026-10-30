import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCronAuth } from '@/lib/apiSecurity';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isTest = url.searchParams.get('test') === 'true' && process.env.NODE_ENV !== 'production';

  // Secure this endpoint by verifying the cron secret
  if (!isTest) {
    const cronCheck = verifyCronAuth(request);
    if (!cronCheck.authorized) {
      return cronCheck.response || new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    // Audit Requirement: Unattended automated message delivery is disabled in the pilot
    // to guarantee all customer communications are verified and sent via authentic business channels.
    if (process.env.PILOT_AUTOPILOT_CRON_ENABLED !== 'true') {
      return NextResponse.json({
        success: true,
        message: 'Unattended background delivery is disabled during the pilot. Outreach must be verified via authentic business channels (wa.me / manual dispatch).',
        pilotMode: true
      });
    }
    const scheduledTasks = await db.followUpTask.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: new Date()
        }
      },
      include: {
        lead: true
      }
    });

    for (const task of scheduledTasks) {
      if (task.actionType === 'SEND_POST_CLINIC_PROMPT') {
        console.log(`[Follow-Up Engine] Sending post-clinic prompt to ${task.lead.email}`);
        // Email or SMS logic would go here
      }

      await db.followUpTask.update({
        where: { id: task.id },
        data: { status: 'EXECUTED' }
      });
    }

    // 2. Find all active conversations (Stale AI conversations)
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

      if (!lead.organizationId) {
        continue;
      }

      // Check subscription operational status per Section 6 (expired trials cannot dispatch automated messages)
      const { getOrCreateWorkspaceSubscription } = await import('@/lib/payments/subscription');
      const sub = await getOrCreateWorkspaceSubscription(lead.organizationId);
      if (!sub.isOperational) {
        continue;
      }

      // 3. Determine "Next Best Action"
      let followUpText = "Hi there, just checking in to see if you had any more questions about CloseCraft?";
      
      if (lead.buyingIntent && lead.buyingIntent >= 80) {
        followUpText = `Hi ${lead.name.split(' ')[0]}, you mentioned you were very interested. Did you want me to go ahead and get a specialist to call you today?`;
      } else if (lead.status === 'NEW') {
        followUpText = `Hi ${lead.name.split(' ')[0]}, I noticed you reached out but we haven't properly connected yet. What's the main goal you are trying to achieve?`;
      }

      // 4. Save AI message
      await db.message.create({
        data: {
          conversationId: conversation.id,
          content: followUpText,
          senderType: 'AI'
        }
      });

      // 5. Update timestamps to reset the inactivity clock
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

    return NextResponse.json({ success: true, processedConversations: processedCount, processedTasks: scheduledTasks.length }, { status: 200 });

  } catch (error) {
    console.error('[Follow-Up Engine] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
