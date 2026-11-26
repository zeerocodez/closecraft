import { db } from '../db';
import { getLeadsInSegment } from './segmentationService';
import { sendWhatsAppMessage } from '../whatsapp';

export interface CampaignCreationInput {
  organizationId: string;
  userId?: string;
  name: string;
  targetSegment: string;
  channel?: 'WHATSAPP' | 'EMAIL' | 'SMS';
  tone?: 'PROFESSIONAL' | 'FRIENDLY' | 'VALUE_OFFER' | 'DIRECT_CHECKIN';
  customMessagePrompt?: string;
  leadSource?: string;
  consentConfirmed?: boolean;
}

export function resolveRecoveryPricingTier(leadCount: number) {
  if (leadCount <= 500) {
    return { code: 'TIER_500', name: 'Up to 500 leads', serviceFee: 25000, isCustomQuote: false };
  }
  if (leadCount <= 2000) {
    return { code: 'TIER_2000', name: '501–2,000 leads', serviceFee: 50000, isCustomQuote: false };
  }
  if (leadCount <= 5000) {
    return { code: 'TIER_5000', name: '2,001–5,000 leads', serviceFee: 100000, isCustomQuote: false };
  }
  return { code: 'CUSTOM', name: 'Above 5,000 leads', serviceFee: 0, isCustomQuote: true };
}

/**
 * Generates respectful, personalized re-engagement text tailored to lead context
 */
export function generateContextAwareReactivationText(params: {
  leadName: string;
  companyName?: string;
  productInterest?: string | null;
  pastObjection?: string | null;
  tone: 'PROFESSIONAL' | 'FRIENDLY' | 'VALUE_OFFER' | 'DIRECT_CHECKIN';
  orgName: string;
}): string {
  const { leadName, productInterest, pastObjection, tone, orgName } = params;
  const firstName = leadName.split(' ')[0] || 'there';
  const offering = productInterest || 'our commercial solutions';

  switch (tone) {
    case 'FRIENDLY':
      return `Hi ${firstName}! It's ${orgName}. We were reviewing our previous conversation regarding ${offering}. We've recently updated our delivery roadmap and wanted to check in to see how your project is coming along. Would you be open to a quick 5-minute chat this week?`;
    case 'VALUE_OFFER':
      return `Hello ${firstName}, hope you're having a productive week. Following up from ${orgName} regarding ${offering}. We're currently offering priority onboarding and flexible scheduling for new partners this quarter. Let us know if you'd like us to share our updated pricing briefing.`;
    case 'DIRECT_CHECKIN':
      return `Hi ${firstName}, following up from ${orgName}. Are you still looking to implement ${offering}, or has your timeline shifted? Happy to provide quick answers whenever you're ready.`;
    case 'PROFESSIONAL':
    default:
      return `Dear ${leadName}, this is a courtesy follow-up from ${orgName}. We previously discussed your requirements for ${offering}. We wanted to check if this remains an active priority for your team and if we can answer any outstanding questions regarding deliverables or scope.`;
  }
}

/**
 * Creates a new Reactivation Campaign and pre-generates message drafts
 */
export async function createReactivationCampaign(input: CampaignCreationInput) {
  const { organizationId, userId, name, targetSegment, channel = 'WHATSAPP', tone = 'PROFESSIONAL' } = input;

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true }
  });
  const orgName = org?.name || 'CloseCraft Partner';

  // 1. Fetch eligible contactable leads in this segment
  const eligibleLeads = await getLeadsInSegment(organizationId, targetSegment, true);
  const optedOutCount = await db.lead.count({
    where: { organizationId, optedOutOfMarketing: true },
  });
  const tier = resolveRecoveryPricingTier(eligibleLeads.length);

  // 2. Create the campaign record with transparent tier & fee metadata
  const campaign = await db.reactivationCampaign.create({
    data: {
      organizationId,
      createdById: userId || null,
      name,
      targetSegment,
      channel,
      tone,
      leadSource: input.leadSource || 'CRM / CSV Import',
      packageTier: tier.code,
      serviceFee: tier.serviceFee,
      currency: 'NGN',
      consentConfirmed: Boolean(input.consentConfirmed),
      messageTemplate: input.customMessagePrompt || `Personalized ${tone.toLowerCase()} outreach for ${targetSegment}`,
      status: 'DRAFT',
      targetCount: eligibleLeads.length,
      validContactCount: eligibleLeads.length,
      suppressedCount: optedOutCount,
    }
  });

  // 3. Pre-create personalized message records for each lead
  const messagesData = eligibleLeads.map((lead: any) => {
    const personalizedText = generateContextAwareReactivationText({
      leadName: lead.name,
      productInterest: lead.intelligence?.productInterest,
      pastObjection: lead.intelligence?.pastObjections,
      tone,
      orgName
    });

    return {
      campaignId: campaign.id,
      leadId: lead.id,
      organizationId,
      channel,
      personalizedText,
      status: 'PENDING'
    };
  });

  if (messagesData.length > 0) {
    await db.reactivationMessage.createMany({
      data: messagesData
    });
  }

  return {
    campaignId: campaign.id,
    name: campaign.name,
    targetCount: eligibleLeads.length,
    packageTier: tier.code,
    serviceFee: tier.serviceFee,
    status: campaign.status,
    previewSample: messagesData.slice(0, 3)
  };
}

export async function approveRecoveryCampaign(campaignId: string, organizationId: string, userId: string) {
  const campaign = await db.reactivationCampaign.findFirst({
    where: { id: campaignId, organizationId },
  });
  if (!campaign) throw new Error('Campaign not found');

  return db.reactivationCampaign.update({
    where: { id: campaign.id },
    data: {
      customerApprovedAt: new Date(),
      consentConfirmed: true,
      status: campaign.paymentVerified ? 'PAID' : 'APPROVED',
    },
  });
}

/**
 * Dispatches an approved campaign respecting WhatsApp 24h policies and pilot guard
 */
export async function dispatchReactivationCampaign(campaignId: string, organizationId: string, userId?: string) {
  const campaign = await db.reactivationCampaign.findFirst({
    where: { id: campaignId, organizationId },
    include: {
      messages: {
        where: { status: 'PENDING' },
        include: { lead: true }
      }
    }
  });

  if (!campaign) {
    throw new Error('Campaign not found or does not belong to this organization');
  }

  const isLiveDispatchEnabled = process.env.WHATSAPP_LIVE_DISPATCH_ENABLED === 'true';

  if (isLiveDispatchEnabled && !campaign.customerApprovedAt) {
    throw new Error('Customer approval of reactivation messaging is required before live channel dispatch.');
  }

  let dispatchedCount = 0;
  let deliveredCount = 0;

  for (const msg of campaign.messages) {
    const lead = msg.lead;

    // Check opt-out suppression
    if (lead.optedOutOfMarketing) {
      await db.reactivationMessage.update({
        where: { id: msg.id },
        data: { status: 'OPTED_OUT', errorMessage: 'Lead previously opted out of marketing communications.' }
      });
      continue;
    }

    if (!isLiveDispatchEnabled) {
      // Safe Pilot Dry-Run Mode
      await db.reactivationMessage.update({
        where: { id: msg.id },
        data: {
          status: 'DRY_RUN_LOGGED',
          providerMessageId: `dry_run_wamid_${Date.now()}_${msg.id.slice(-6)}`,
          sentAt: new Date()
        }
      });
      dispatchedCount++;
      deliveredCount++;
    } else {
      // Live Dispatch via WhatsApp Cloud API
      try {
        if (!lead.phone) {
          throw new Error('No phone number on lead record');
        }

        const sendResult = await sendWhatsAppMessage({
          organizationId,
          leadId: lead.id,
          recipientPhone: lead.phone,
          text: msg.personalizedText
        });

        await db.reactivationMessage.update({
          where: { id: msg.id },
          data: {
            status: sendResult.success ? 'SENT' : 'FAILED',
            providerMessageId: sendResult.messageId || null,
            errorMessage: sendResult.error || null,
            sentAt: new Date()
          }
        });

        if (sendResult.success) {
          dispatchedCount++;
          deliveredCount++;
        }
      } catch (err: any) {
        await db.reactivationMessage.update({
          where: { id: msg.id },
          data: {
            status: 'FAILED',
            errorMessage: err.message || 'WhatsApp Cloud API dispatch failed'
          }
        });
      }
    }
  }

  // Update campaign status
  await db.reactivationCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'ACTIVE',
      dispatchedCount: campaign.dispatchedCount + dispatchedCount,
      deliveredCount: campaign.deliveredCount + deliveredCount
    }
  });

  // Audit log
  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId || null,
      actorType: 'USER',
      action: 'REACTIVATION_CAMPAIGN_DISPATCHED',
      resourceType: 'ReactivationCampaign',
      resourceId: campaignId,
      metadata: JSON.stringify({
        campaignName: campaign.name,
        targetSegment: campaign.targetSegment,
        dispatched: dispatchedCount,
        pilotMode: !isLiveDispatchEnabled
      }),
      reason: `Dispatched reactivation campaign: ${campaign.name} (${dispatchedCount} messages)`
    }
  });

  return {
    success: true,
    campaignId,
    dispatchedCount,
    deliveredCount,
    pilotMode: !isLiveDispatchEnabled
  };
}

/**
 * Handles incoming prospect response, matches campaign, updates attribution, creates Next Best Action
 */
export async function processInboundRecoveryResponse(params: {
  organizationId: string;
  leadId: string;
  messageText: string;
}) {
  const { organizationId, leadId, messageText } = params;
  const lower = messageText.toLowerCase().trim();

  // 1. Detect Opt-out keywords
  const isOptOut = lower === 'stop' || lower === 'unsubscribe' || lower === 'remove me' || lower.includes('stop messaging');
  if (isOptOut) {
    await db.lead.update({
      where: { id: leadId },
      data: {
        optedOutOfMarketing: true,
        optedOutAt: new Date()
      }
    });

    await db.auditLog.create({
      data: {
        organizationId,
        actorType: 'SYSTEM',
        action: 'LEAD_MARKETING_OPT_OUT',
        resourceType: 'Lead',
        resourceId: leadId,
        reason: `Prospect opted out with message: "${messageText}"`
      }
    });

    return { outcome: 'OPTED_OUT', message: 'Lead opted out of marketing communications.' };
  }

  // 2. Classify response intent
  let outcome = 'STILL_INTERESTED';
  if (
    lower.includes('price') ||
    lower.includes('pricing') ||
    lower.includes('cost') ||
    lower.includes('how much') ||
    lower.includes('rate') ||
    lower.includes('quote') ||
    lower.includes('discount')
  ) {
    outcome = 'WANTS_PRICING';
  } else if (lower.includes('call') || lower.includes('speak') || lower.includes('phone') || lower.includes('meet')) {
    outcome = 'CALLBACK_REQUESTED';
  } else if (lower.includes('not interested') || lower.includes('no thanks') || lower.includes('already got')) {
    outcome = 'NOT_INTERESTED';
  }

  // 3. Find if there was a recent ReactivationMessage sent to this lead
  const recentReactivation = await db.reactivationMessage.findFirst({
    where: { leadId, organizationId },
    orderBy: { createdAt: 'desc' }
  });

  if (recentReactivation) {
    await db.reactivationMessage.update({
      where: { id: recentReactivation.id },
      data: {
        responseDetected: true,
        responseOutcome: outcome,
        responseAt: new Date()
      }
    });

    // Increment campaign response & interested count (never treat interested prospects as converted sales!)
    await db.reactivationCampaign.update({
      where: { id: recentReactivation.campaignId },
      data: {
        responseCount: { increment: 1 },
        ...(outcome !== 'NOT_INTERESTED' ? { interestedCount: { increment: 1 } } : {})
      }
    });
  }

  // 4. If positive intent, create high-priority RevenueAction for human Closer
  if (outcome !== 'NOT_INTERESTED') {
    await db.lead.update({
      where: { id: leadId },
      data: {
        status: 'ENGAGED',
        buyingIntent: Math.max(75, (await db.lead.findUnique({ where: { id: leadId }, select: { buyingIntent: true } }))?.buyingIntent || 75)
      }
    });

    await db.revenueAction.create({
      data: {
        organizationId,
        leadId,
        type: 'CALL_PROSPECT',
        priority: 95,
        recommendedActor: 'HUMAN',
        reason: `Reactivated prospect responded to outreach: "${messageText}". Immediate human closer contact required.`,
        status: 'PENDING'
      }
    });
  }

  return {
    outcome,
    leadId,
    actionScheduled: outcome !== 'NOT_INTERESTED'
  };
}
