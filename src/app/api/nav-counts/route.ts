import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Live counts for the sidebar badges. The organisation always comes from
 * the session — never from the request — so a workspace only ever sees its
 * own numbers.
 *
 * - unreadMessages: inbound (PROSPECT) messages nobody on the team has
 *   opened yet (Message.readAt is null). This is the Inbox badge. Phase 1
 *   badged unresponded enquiries because no read-state existed; now that
 *   opening a conversation marks its messages read (POST /api/messages/read),
 *   the badge can mean what inbox badges everywhere mean.
 * - newEnquiries: enquiries still waiting for a first response (status NEW,
 *   the Today page's definition). Still returned for other consumers.
 * - followUpsDue: follow-ups overdue or due today (nextActionDueAt up to
 *   end of today on leads that are not WON/LOST — also the Today page's
 *   definition), so the badge and the page it opens agree.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [newEnquiries, followUpsDue, unreadMessages] = await Promise.all([
      db.lead.count({
        where: { organizationId, status: 'NEW' },
      }),
      db.lead.count({
        where: {
          organizationId,
          status: { notIn: ['WON', 'LOST'] },
          nextActionDueAt: { lte: endOfToday },
        },
      }),
      db.message.count({
        where: {
          senderType: 'PROSPECT',
          readAt: null,
          conversation: { organizationId },
        },
      }),
    ]);

    return NextResponse.json({ newEnquiries, followUpsDue, unreadMessages });
  } catch (error) {
    console.error('[Nav Counts] Failed to load counts:', error);
    return NextResponse.json({ error: 'Failed to load counts' }, { status: 500 });
  }
}
