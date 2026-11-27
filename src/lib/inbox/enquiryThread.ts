import { db } from '@/lib/db';

/**
 * Ensures an enquiry lead has a visible thread in the Unified Inbox:
 * a conversation plus the enquiry itself as the first prospect message.
 *
 * The conversation channel records the REPLY channel, matching how the
 * inbox already behaves: WhatsApp when the lead has a phone number
 * (inbox replies then dispatch through the WhatsApp Cloud API), WEB
 * otherwise. The enquiry's origin (WhatsApp / Meta Ads / Web Capture)
 * lives on Lead.source and is what the inbox badges and filters use.
 *
 * Idempotent: if the lead already has a conversation, it is returned
 * unchanged and no duplicate message is written.
 */
export async function ensureEnquiryThread(params: {
  organizationId: string;
  leadId: string;
  phone?: string | null;
  enquiryText?: string | null;
  fallbackText: string;
}) {
  const existing = await db.conversation.findFirst({
    where: { leadId: params.leadId, organizationId: params.organizationId },
  });
  if (existing) return existing;

  const conversation = await db.conversation.create({
    data: {
      leadId: params.leadId,
      organizationId: params.organizationId,
      channel: params.phone ? 'WHATSAPP' : 'WEB',
      status: 'ACTIVE',
    },
  });

  const content = params.enquiryText?.trim() || params.fallbackText;
  await db.message.create({
    data: {
      conversationId: conversation.id,
      content,
      senderType: 'PROSPECT',
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });

  return conversation;
}
