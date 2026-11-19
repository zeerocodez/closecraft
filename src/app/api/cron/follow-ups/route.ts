import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCronAuth } from '@/lib/apiSecurity';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

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
    // 1. Process explicit scheduled follow-up tasks
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

    let executedTaskCount = 0;

    for (const task of scheduledTasks) {
      if (task.lead.optedOutOfMarketing) {
        await db.followUpTask.update({
          where: { id: task.id },
          data: { status: 'CANCELLED', reason: 'Prospect opted out of communications' }
        });
        continue;
      }

      let deliveryStatus = 'EXECUTED';

      if (task.actionType === 'SEND_WHATSAPP' && task.lead.phone) {
        const dispatchResult = await sendWhatsAppMessage({
          organizationId: task.organizationId,
          leadId: task.leadId,
          recipientPhone: task.lead.phone,
          text: task.reason || 'Following up on your commercial sales inquiry with CloseCraft.',
        });
        deliveryStatus = dispatchResult.deliveryStatus;
      }

      await db.followUpTask.update({
        where: { id: task.id },
        data: { status: deliveryStatus }
      });
      executedTaskCount++;
    }

    // 2. Identify active conversations requiring follow-up outreach
    if (process.env.PILOT_AUTOPILOT_CRON_ENABLED !== 'true' && !isTest) {
      return NextResponse.json({
        success: true,
        message: 'Unattended background follow-up delivery is in Pilot Safe Mode. Outreach logged to audit trail.',
        pilotMode: true,
        processedTasks: executedTaskCount,
      });
    }

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
          },
          optedOutOfMarketing: false,
        }
      },
      include: {
        lead: true
      }
    });

    console.log(`[Follow-Up Engine] Found ${staleConversations.length} active conversations for follow-up evaluation.`);

    let processedCount = 0;

    for (const conversation of staleConversations) {
      const lead = conversation.lead;

      if (!lead.organizationId || !lead.phone) {
        continue;
      }

      // Check workspace operational subscription status (expired trials cannot dispatch messages)
      const { getOrCreateWorkspaceSubscription } = await import('@/lib/payments/subscription');
      const sub = await getOrCreateWorkspaceSubscription(lead.organizationId);
      if (!sub.isOperational) {
        continue;
      }

      // Determine prescriptive next outreach text
      let followUpText = "Hi there, following up to see if you had any questions regarding your inquiry with CloseCraft?";
      
      if (lead.buyingIntent && lead.buyingIntent >= 80) {
        followUpText = `Hi ${lead.name.split(' ')[0]}, checking in on your project requirements. Would you like our sales specialist to connect with you today for a brief walkthrough?`;
      } else if (lead.status === 'NEW') {
        followUpText = `Hi ${lead.name.split(' ')[0]}, we received your note. Could you share what primary outcome you are looking to achieve so we can prepare the right solution?`;
      }

      // Dispatch via WhatsApp Outbound Engine (enforces window, consent, and explicit delivery state)
      const dispatchResult = await sendWhatsAppMessage({
        organizationId: lead.organizationId,
        leadId: lead.id,
        recipientPhone: lead.phone,
        text: followUpText,
        conversationId: conversation.id,
      });

      // Update timestamps to reset the inactivity clock
      await db.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      await db.lead.update({
        where: { id: lead.id },
        data: { updatedAt: new Date() }
      });

      console.log(`[Follow-Up Engine] Evaluated follow-up for ${lead.phone}: DeliveryStatus = ${dispatchResult.deliveryStatus}`);
      processedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      processedConversations: processedCount, 
      processedTasks: executedTaskCount 
    }, { status: 200 });

  } catch (error) {
    console.error('[Follow-Up Engine] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
