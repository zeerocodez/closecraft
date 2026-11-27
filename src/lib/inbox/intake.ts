import { db } from '@/lib/db';
import { RevenueEngine } from '@/lib/revenue-engine/engine';
import type { InboxChannel } from './channel';

/**
 * Triggers Revenue Engine qualification + Unified Inbox thread creation for a newly
 * ingested lead, falling back to an active conversation + initial prospect message
 * so public Web Capture or Meta Ads leads never go missing from /inbox.
 */
export async function triggerInboxIngestionForLead(params: {
  organizationId: string;
  leadId: string;
  channel: InboxChannel;
  initialMessage: string;
}) {
  try {
    await RevenueEngine.processNewLead(params.leadId);
  } catch (err: any) {
    console.warn('[InboxIntake] RevenueEngine fallback creating conversation:', err?.message);
    const existingConv = await db.conversation.findFirst({ where: { leadId: params.leadId } });
    if (!existingConv) {
      const conv = await db.conversation.create({
        data: {
          organizationId: params.organizationId,
          leadId: params.leadId,
          channel: params.channel,
          status: 'ACTIVE',
        },
      });
      await db.message.create({
        data: {
          conversationId: conv.id,
          senderType: 'PROSPECT',
          content: params.initialMessage,
        },
      });
    }
  }
}
