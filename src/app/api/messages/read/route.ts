import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * Marks a conversation's inbound (PROSPECT) messages as read by the team.
 *
 * Read-state for inbound messages lives on Message.readAt: for PROSPECT
 * messages that column is otherwise unused (WhatsApp delivery receipts only
 * ever set it on outbound HUMAN/AI messages), so no schema change is
 * needed. The organisation always comes from the session and the
 * conversation must belong to it — a workspace can only mark its own
 * conversations read.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const conversationId = body?.conversationId;
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'Missing required field: conversationId' }, { status: 400 });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, organizationId: true },
    });

    if (!conversation || conversation.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
    }

    const result = await db.message.updateMany({
      where: { conversationId, senderType: 'PROSPECT', readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('Failed to mark messages read:', error);
    return NextResponse.json({ error: 'Failed to mark messages read' }, { status: 500 });
  }
}
