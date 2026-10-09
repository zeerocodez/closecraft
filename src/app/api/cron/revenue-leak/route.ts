import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('[RevenueLeak Cron] Scanning for SLA breaches...');

    // Threshold: 48 hours ago
    const thresholdDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // 1. Find Pending Actions older than 48 hours
    const stalledActions = await db.revenueAction.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: thresholdDate
        }
      },
      include: {
        lead: true,
        organization: true
      }
    });

    if (stalledActions.length === 0) {
      return NextResponse.json({ success: true, message: 'No stalled actions found' });
    }

    console.log(`[RevenueLeak Cron] Found ${stalledActions.length} stalled actions`);

    let newLeaks = 0;

    for (const action of stalledActions) {
      // Check if a leak already exists for this action/lead to avoid duplicates
      const existingLeak = await db.revenueLeak.findFirst({
        where: {
          leadId: action.leadId,
          status: 'OPEN',
          description: {
            contains: action.type
          }
        }
      });

      if (!existingLeak) {
        await db.revenueLeak.create({
          data: {
            type: 'SLA_BREACHED',
            severity: 'HIGH',
            status: 'OPEN',
            description: `Action ${action.type} has been pending for over 48 hours. Reason: ${action.reason}`,
            organizationId: action.organizationId,
            leadId: action.leadId
          }
        });
        newLeaks++;
      }
    }

    return NextResponse.json({ success: true, newLeaksCreated: newLeaks });
  } catch (error) {
    console.error('[RevenueLeak Cron] Tick failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
