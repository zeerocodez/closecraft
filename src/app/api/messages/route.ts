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
    const safeSenderType = validSenderTypes.includes(senderType) ? senderType : 'HUMAN';

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

    // ==========================================
    // WHATSAPP conversations: dispatch the reply through the real Cloud
    // API engine (src/lib/whatsapp.ts). The engine enforces the 24-hour
    // customer service window, opt-out consent, and the
    // WHATSAPP_LIVE_DISPATCH_ENABLED pilot gate, uses the organization's
    // own encrypted credentials, and persists the message row itself with
    // the truthful delivery status (SENT / FAILED / DRY_RUN_LOGGED) and
    // the Meta provider message id — so this route must not also insert.
    // ==========================================
    if (conversation.channel === 'WHATSAPP' && safeSenderType === 'HUMAN' && conversation.lead.phone) {
      const requestStartedAt = new Date();
      const dispatch = await sendWhatsAppMessage({
        organizationId: session.organizationId,
        leadId: conversation.leadId,
        recipientPhone: conversation.lead.phone,
        messageType: 'text',
        text: trimmedContent,
        conversationId: effectiveConversationId,
        senderType: 'HUMAN',
      });

      // Fetch the row the engine persisted. A dispatch blocked before any
      // persistence (e.g. the lead opted out) leaves no row — record the
      // blocked attempt so it stays visible and auditable in the thread.
      let message = await db.message.findFirst({
        where: {
          conversationId: effectiveConversationId,
          content: trimmedContent,
          createdAt: { gte: requestStartedAt },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!message) {
        message = await db.message.create({
          data: {
            conversationId: effectiveConversationId,
            content: trimmedContent,
            senderType: safeSenderType,
            status: 'FAILED',
            errorMessage: dispatch.error || 'WhatsApp dispatch was blocked before sending.',
          },
        });
      }

      // Update conversation's updatedAt timestamp to bubble it up in the inbox
      await db.conversation.update({
        where: { id: effectiveConversationId },
        data: { updatedAt: new Date() }
      });

      // Update lead's updatedAt timestamp too
      await db.lead.update({
        where: { id: conversation.leadId },
        data: { updatedAt: new Date() }
      });

      return NextResponse.json(
        {
          success: true,
          message,
          dispatch: {
            deliveryStatus: dispatch.deliveryStatus,
            dryRun: Boolean(dispatch.dryRun),
            error: dispatch.error || null,
          },
        },
        { status: 201 }
      );
    }

    // Non-WhatsApp channels (and prospect simulation): record the message only.
    const message = await db.message.create({
      data: {
        conversationId: effectiveConversationId,
        content: trimmedContent,
        senderType: safeSenderType
      }
    });

    // Update conversation's updatedAt timestamp to bubble it up in the inbox
    await db.conversation.update({
      where: { id: effectiveConversationId },
      data: { updatedAt: new Date() }
    });

    // Update lead's updatedAt timestamp too
    await db.lead.update({
      where: { id: conversation.leadId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
