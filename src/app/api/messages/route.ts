import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: max 60 messages per minute per user
    const limiter = await rateLimit(`msg-send:${session.user.id}`, 60, 60 * 1000);
    if (!limiter.allowed) {
      return NextResponse.json({ error: 'Too many messages sent. Please slow down.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { conversationId, leadId, content, senderType = 'HUMAN' } = body;

    if ((!conversationId && !leadId) || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing required fields: valid conversationId or leadId, and content are required' }, { status: 400 });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0 || trimmedContent.length > 4000) {
      return NextResponse.json({ error: 'Message content must be between 1 and 4000 characters.' }, { status: 400 });
    }

    // Only allow human or prospect messages from client endpoints (AI & SYSTEM messages originate server-side)
    const validSenderTypes = ['HUMAN', 'PROSPECT'];
    const safeSenderType = (validSenderTypes.includes(senderType) ? senderType : 'HUMAN') as 'HUMAN' | 'PROSPECT';

    let effectiveConversationId = conversationId;

    // If conversationId wasn't passed directly, find or initialize the conversation for this lead
    if (!effectiveConversationId && leadId) {
      let conv = await db.conversation.findFirst({
        where: { leadId, organizationId: session.organizationId }
      });
      if (!conv) {
        conv = await db.conversation.create({
          data: {
            leadId,
            organizationId: session.organizationId,
            channel: 'WHATSAPP',
            status: 'OPEN'
          }
        });
      }
      effectiveConversationId = conv.id;
    }

    // Verify conversation belongs to this organization
    const conversation = await db.conversation.findUnique({
      where: { id: effectiveConversationId },
      include: { lead: true }
    });

    if (!conversation || conversation.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
    }

    // Dispatch live via WhatsApp Cloud API when replying on a WhatsApp conversation
    const phoneNumber = conversation.lead.phone;
    if (safeSenderType === 'HUMAN' && conversation.channel === 'WHATSAPP' && phoneNumber) {
      const dispatch = await sendWhatsAppMessage({
        organizationId: session.organizationId,
        leadId: conversation.leadId,
        recipientPhone: phoneNumber,
        messageType: 'text',
        text: trimmedContent,
        conversationId: effectiveConversationId,
        senderType: 'HUMAN',
      });

      return NextResponse.json(
        {
          success: dispatch.success,
          message: dispatch.messageRecord || null,
          dispatch: {
            deliveryStatus: dispatch.deliveryStatus,
            providerMessageId: dispatch.providerMessageId,
            dryRun: dispatch.dryRun,
            error: dispatch.error,
          },
        },
        { status: dispatch.success ? 201 : 200 }
      );
    }

    // Non-WhatsApp or phone-less conversations: persist internal message record cleanly
    const message = await db.message.create({
      data: {
        conversationId: effectiveConversationId,
        content: trimmedContent,
        senderType: safeSenderType
      }
    });

    await Promise.all([
      db.conversation.update({
        where: { id: effectiveConversationId },
        data: { updatedAt: new Date() }
      }),
      db.lead.update({
        where: { id: conversation.leadId },
        data: { updatedAt: new Date() }
      }),
    ]);

    return NextResponse.json({ success: true, message }, { status: 201 });
 } catch (error) {
 console.error('Failed to send message:', error);
 return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
 }
}
