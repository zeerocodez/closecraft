import { db } from '@/lib/db';

export const RevenueEngine = {
  
  /**
   * Evaluates a newly created lead.
   * Derives standardized signals (Intent, Fit, Urgency, Value),
   * calculates priority, attaches pipeline deal & conversation, and sets the Next Best Action.
   */
  async processNewLead(leadId: string) {
    console.log(`[RevenueEngine] Processing new lead: ${leadId}`);
    
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { 
        qualificationData: true,
        deals: true,
        conversations: true,
        organization: true
      }
    });

    if (!lead || !lead.organizationId) {
      console.error(`[RevenueEngine] Lead ${leadId} not found or missing organizationId`);
      return;
    }

    // 1. Generate Signals using AI Extractor (enforcing tenant qualificationPolicy)
    const { extractLeadQualificationData } = await import('@/lib/ai/extractor');
    const aiData = await extractLeadQualificationData(
      lead.message || '', 
      lead.qualificationData?.customData,
      lead.buyingIntent ?? undefined,
      lead.organization?.qualificationPolicy
    );

    // 2. Persist Standardized Signals in DB
    await db.$transaction([
      // Intent Signal
      db.revenueSignal.create({
        data: {
          organizationId: lead.organizationId,
          leadId: lead.id,
          type: 'INTENT',
          value: aiData.intentScore,
          source: 'AI',
          evidence: aiData.intentEvidence
        }
      }),
      // Fit Signal
      db.revenueSignal.create({
        data: {
          organizationId: lead.organizationId,
          leadId: lead.id,
          type: 'FIT',
          value: aiData.fitScore,
          source: 'AI',
          evidence: aiData.fitEvidence
        }
      }),
      // Urgency Signal
      db.revenueSignal.create({
        data: {
          organizationId: lead.organizationId,
          leadId: lead.id,
          type: 'URGENCY',
          value: aiData.urgencyScore,
          source: 'AI',
          evidence: aiData.urgencyEvidence
        }
      }),
      // Value Signal (0-100 normalized score)
      db.revenueSignal.create({
        data: {
          organizationId: lead.organizationId,
          leadId: lead.id,
          type: 'VALUE',
          value: Math.min(100, Math.max(10, Math.round(aiData.estimatedValue / 150000))),
          source: 'SYSTEM',
          evidence: `Estimated Deal Value: ₦${(aiData.estimatedValue / 1000000).toFixed(1)}M`
        }
      })
    ]);

    // 3. Update Lead Status, AI Assessment & Prescriptive Next Steps
    const updatedStatus = aiData.intentScore >= 80 ? 'OPPORTUNITY' : (aiData.intentScore >= 50 ? 'ENGAGED' : 'NEW');
    
    // Check Team Routing Mode & Availability
    const routingMode = lead.organization?.leadRoutingMode || 'OPEN_POOL';
    let assignedUserId = lead.assignedUserId;
    let assignedRole = lead.assignedRole || aiData.targetRole;
    let claimedAt = lead.claimedAt;

    if (!assignedUserId && routingMode === 'ROUND_ROBIN') {
      // Auto-push qualified lead to next available team member
      const availableMembers = await db.organizationMember.findMany({
        where: {
          organizationId: lead.organizationId,
          isAvailable: true,
          role: { in: ['CLOSER', 'SETTER', 'ADMIN'] }
        }
      });

      if (availableMembers.length > 0) {
        const matched = availableMembers.filter(m => m.role === aiData.targetRole);
        const pool = matched.length > 0 ? matched : availableMembers;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        assignedUserId = chosen.userId;
        assignedRole = chosen.role;
        claimedAt = new Date();
      }
    }

    await db.lead.update({
      where: { id: lead.id },
      data: {
        buyingIntent: aiData.intentScore,
        status: lead.status === 'NEW' ? updatedStatus : lead.status,
        aiAssessment: aiData.aiAssessment,
        nextStepsRecommendation: aiData.nextStepsRecommendation,
        assignedRole,
        assignedUserId,
        claimedAt
      }
    });
    
    // 4. Update or Create Qualification Data
    if (lead.qualificationData) {
      await db.qualificationData.update({
        where: { id: lead.qualificationData.id },
        data: {
          budget: aiData.budget || lead.qualificationData.budget,
          authority: aiData.authority || lead.qualificationData.authority,
          need: aiData.need || lead.qualificationData.need,
          timeline: aiData.timeline || lead.qualificationData.timeline,
        }
      });
    } else {
      await db.qualificationData.create({
        data: {
          leadId: lead.id,
          budget: aiData.budget,
          authority: aiData.authority,
          need: aiData.need,
          timeline: aiData.timeline,
        }
      });
    }

    // 5. Cancel any stale PENDING actions for this lead
    await db.revenueAction.updateMany({
      where: {
        leadId: lead.id,
        status: 'PENDING'
      },
      data: {
        status: 'CANCELLED',
        cancellationReason: 'Superseded by fresh Revenue Engine evaluation'
      }
    });

    // 6. Determine & Create Next Best Action
    const createdAction = await db.revenueAction.create({
      data: {
        organizationId: lead.organizationId,
        leadId: lead.id,
        type: aiData.nextActionType,
        reason: aiData.actionReason,
        priority: aiData.priority,
        recommendedActor: aiData.recommendedActor,
        status: 'PENDING',
        source: 'REVENUE_ENGINE',
      }
    });

    // 7. Ensure Pipeline Opportunity Deal exists
    if (!lead.deals || lead.deals.length === 0) {
      await db.deal.create({
        data: {
          organizationId: lead.organizationId,
          leadId: lead.id,
          amount: aiData.estimatedValue,
          currency: 'USD',
          stage: 'OPPORTUNITY',
        }
      });
    }

    // 8. Ensure Triage Conversation exists for the Inbox
    if (!lead.conversations || lead.conversations.length === 0) {
      const conv = await db.conversation.create({
        data: {
          organizationId: lead.organizationId,
          leadId: lead.id,
          channel: 'WHATSAPP',
          status: 'ACTIVE',
        }
      });

      // Add inbound message from prospect
      await db.message.create({
        data: {
          conversationId: conv.id,
          senderType: 'PROSPECT',
          content: lead.message || 'Inbound inquiry from prospect. Ready to discuss requirements.',
        }
      });
    }

    // 9. Record in Audit Log
    await db.auditLog.create({
      data: {
        organizationId: lead.organizationId,
        leadId: lead.id,
        actorType: 'AI',
        action: 'REVENUE_ENGINE_PROCESSED_LEAD',
        resourceType: 'Lead',
        resourceId: lead.id,
        newState: JSON.stringify({
          intentScore: aiData.intentScore,
          nextActionType: aiData.nextActionType,
          recommendedActor: aiData.recommendedActor,
          priority: aiData.priority,
          dealAmount: aiData.estimatedValue
        })
      }
    });

    console.log(`[RevenueEngine] Completed processing lead: ${leadId}. Generated Action: ${aiData.nextActionType} assigned to ${aiData.recommendedActor}`);
  },

  /**
   * Processes a newly scheduled appointment.
   * Cancels pending human outreach actions and queues a post-meeting action.
   */
  async processAppointmentScheduled(appointmentId: string) {
    console.log(`[RevenueEngine] Processing appointment: ${appointmentId}`);
    
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { lead: true }
    });

    if (!appointment || !appointment.leadId) return;

    // 1. Cancel existing pending outreach actions for this lead
    await db.revenueAction.updateMany({
      where: { 
        leadId: appointment.leadId,
        status: 'PENDING',
        type: { in: ['RESPOND', 'SEND_NURTURE_SEQUENCE'] }
      },
      data: {
        status: 'CANCELLED',
        result: `Superseded by appointment ${appointment.id}`
      }
    });

    // 2. Set lead status to SCHEDULED
    await db.lead.update({
      where: { id: appointment.leadId },
      data: { status: 'SCHEDULED' }
    });

    // 3. Queue a Post-Meeting action assigned to HUMAN
    await db.revenueAction.create({
      data: {
        organizationId: appointment.organizationId,
        leadId: appointment.leadId,
        type: 'SEND_PROPOSAL',
        reason: 'Appointment scheduled. Human must conduct the demo and send proposal.',
        priority: 90,
        recommendedActor: 'HUMAN',
        status: 'PENDING',
        source: 'REVENUE_ENGINE',
      }
    });

    console.log(`[RevenueEngine] Appointment processed. Post-meeting action queued.`);
  },

  /**
   * Reprocesses all leads for an organization using the active Qualification Policy
   */
  async reprocessAllLeads(organizationId: string) {
    console.log(`[RevenueEngine] Reprocessing all leads for organization: ${organizationId}`);
    const leads = await db.lead.findMany({
      where: { organizationId },
      select: { id: true }
    });
    for (const l of leads) {
      try {
        await this.processNewLead(l.id);
      } catch (err) {
        console.error(`[RevenueEngine] Error reprocessing lead ${l.id}:`, err);
      }
    }
    return { count: leads.length };
  }
};
