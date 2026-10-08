// @ts-nocheck
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";

// Unified inbox Data Access Layer
export async function getConversationsForTenant(organizationId: string) {
  return await db.conversation.findMany({
    where: { organizationId },
    include: {
      lead: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function sendMessageForTenant(data: {
  organizationId: string;
  leadId: string;
  senderId: string;
  content: string;
  channel: string; // 'EMAIL', 'WHATSAPP', 'SMS'
}) {
  // 1. Get or create conversation
  let conversation = await db.conversation.findFirst({
    where: { leadId: data.leadId, organizationId: data.organizationId }
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        leadId: data.leadId,
        organizationId: data.organizationId
      }
    });
  }

  // 2. Save message to DB
  const message = await db.message.create({
    data: {
      conversationId: conversation.id,
      senderId: data.senderId,
      content: data.content,
      isFromLead: false
    }
  });

  // 3. Dispatch to Inngest to handle external delivery (Twilio/SendGrid)
  await inngest.send({
    name: 'communication/message.send',
    data: {
      messageId: message.id,
      channel: data.channel,
      content: data.content,
      leadId: data.leadId,
      organizationId: data.organizationId
    }
  });

  return message;
}
