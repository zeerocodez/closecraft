import { db } from '../db';

export interface SegmentSummary {
  id: string;
  name: string;
  description: string;
  leadCount: number;
  contactableCount: number; // Excludes optedOutOfMarketing
  estimatedValue: number;
  currency: string;
  recommendedAction: string;
}

export const RECOVERY_SEGMENTS = [
  {
    id: 'PREVIOUSLY_INTERESTED',
    name: 'Previously Interested',
    description: 'Enquired about services or products in the past but stalled before scheduling a call or proposal.',
    recommendedAction: 'Send friendly check-in highlighting new updates and offering a quick 10-minute briefing.'
  },
  {
    id: 'PRICE_SENSITIVE',
    name: 'Price-Sensitive / Budget Inquiries',
    description: 'Prospects who expressed budget constraints or price objections during previous discussions.',
    recommendedAction: 'Propose flexible payment structures, starter tiers, or an exclusive limited-time package.'
  },
  {
    id: 'ABANDONED',
    name: 'Abandoned Proposals & Quotes',
    description: 'Prospects who received a commercial proposal, quote, or demo but went cold during negotiation.',
    recommendedAction: 'Deliver a direct executive re-engagement message addressing common delivery questions.'
  },
  {
    id: 'REPEAT_BUYER',
    name: 'Past Clients & Repeat Opportunities',
    description: 'Satisfied customers or closed-won accounts eligible for upsell, cross-sell, or annual renewal.',
    recommendedAction: 'Offer priority onboarding or advanced service additions tailored to their prior engagements.'
  },
  {
    id: 'COLD_STALLED',
    name: 'Cold & Inactive (> 30 Days)',
    description: 'Leads with no conversation or activity recorded in the past 30 days.',
    recommendedAction: 'Reactivate with a respectful permission-based inquiry to see if the project remains active.'
  },
  {
    id: 'UNQUALIFIED',
    name: 'Unqualified / Opted Out',
    description: 'Inquiries below minimum qualification thresholds or contacts who opted out of marketing.',
    recommendedAction: 'Self-serve educational resources or maintain passive newsletter updates.'
  }
];

/**
 * Returns aggregated stats for all segments within a tenant workspace
 */
export async function getOrganizationSegmentSummaries(organizationId: string): Promise<SegmentSummary[]> {
  const leads = await db.lead.findMany({
    where: { organizationId },
    select: {
      id: true,
      optedOutOfMarketing: true,
      estimatedValue: true,
      currency: true,
      status: true,
      intelligence: {
        select: { suggestedSegment: true }
      },
      deals: {
        select: { stage: true, amount: true }
      }
    }
  });

  const currency = leads[0]?.currency || 'NGN';

  return RECOVERY_SEGMENTS.map(seg => {
    const matchingLeads = leads.filter(l => {
      const explicitSeg = l.intelligence?.suggestedSegment;
      if (explicitSeg) {
        return explicitSeg === seg.id;
      }

      // Heuristic fallback if intelligence record is not yet generated
      if (seg.id === 'REPEAT_BUYER') {
        return l.deals.some(d => d.stage === 'WON');
      }
      if (seg.id === 'ABANDONED') {
        return l.deals.some(d => d.stage === 'PROPOSAL' || d.stage === 'NEGOTIATION');
      }
      if (seg.id === 'UNQUALIFIED') {
        return l.optedOutOfMarketing || l.status === 'DISQUALIFIED';
      }
      if (seg.id === 'COLD_STALLED') {
        return l.status === 'LOST';
      }
      return seg.id === 'PREVIOUSLY_INTERESTED';
    });

    const contactable = matchingLeads.filter(l => !l.optedOutOfMarketing);
    const totalValue = matchingLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);

    return {
      id: seg.id,
      name: seg.name,
      description: seg.description,
      leadCount: matchingLeads.length,
      contactableCount: contactable.length,
      estimatedValue: totalValue,
      currency,
      recommendedAction: seg.recommendedAction
    };
  });
}

/**
 * Fetches eligible leads for a specific segment ready for reactivation campaign
 */
export async function getLeadsInSegment(organizationId: string, segmentId: string, onlyContactable: boolean = true) {
  const leads = await db.lead.findMany({
    where: {
      organizationId,
      ...(onlyContactable ? { optedOutOfMarketing: false } : {})
    },
    include: {
      intelligence: true,
      deals: true,
      conversations: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return leads.filter(l => {
    if (segmentId === 'ALL') return true;
    if (l.intelligence?.suggestedSegment) {
      return l.intelligence.suggestedSegment === segmentId;
    }
    if (segmentId === 'REPEAT_BUYER') {
      return l.deals.some(d => d.stage === 'WON');
    }
    if (segmentId === 'ABANDONED') {
      return l.deals.some(d => d.stage === 'PROPOSAL' || d.stage === 'NEGOTIATION');
    }
    if (segmentId === 'UNQUALIFIED') {
      return l.optedOutOfMarketing || l.status === 'DISQUALIFIED';
    }
    if (segmentId === 'COLD_STALLED') {
      return l.status === 'LOST';
    }
    return segmentId === 'PREVIOUSLY_INTERESTED';
  });
}
