import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Live counts for the sidebar badges: enquiries still waiting for a first
 * response, and follow-ups that are overdue or due today. The organisation
 * always comes from the session — never from the request — so a workspace
 * only ever sees its own numbers. Definitions mirror the Today page
 * (unresponded = status NEW; due = nextActionDueAt up to end of today on
 * leads that are not WON/LOST), so the badge and the page it opens agree.
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

    const [newEnquiries, followUpsDue] = await Promise.all([
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
    ]);

    return NextResponse.json({ newEnquiries, followUpsDue });
  } catch (error) {
    console.error('[Nav Counts] Failed to load counts:', error);
    return NextResponse.json({ error: 'Failed to load counts' }, { status: 500 });
  }
}
