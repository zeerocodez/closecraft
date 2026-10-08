import { db } from '@/lib/db';

export const RevenueEngine = {
  
  /**
   * Evaluates a newly created lead.
   * Derives signals, calculates priority, and sets the Next Best Action.
   */
  async processNewLead(leadId: string) {
    console.log(`[RevenueEngine] Processing new lead: ${leadId}`);
    
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { qualificationData: true }
    });

    if (!lead) {
      console.error(`[RevenueEngine] Lead ${leadId} not found`);
      return;
    }

    // 1. Generate Signals using AI Extractor
    const { extractLeadQualificationData } = await import('@/lib/ai/extractor');
    const aiData = await extractLeadQualificationData(
      lead.message || '', 
      lead.qualificationData?.customData
    );

    await db.revenueSignal.create({
      data: {
        organizationId: lead.organizationId!,
        leadId: lead.id,
        type: 'INTENT',
        value: aiData.intentScore,
        source: 'AI',
        evidence: 'Derived from lead source and message using AI'
      }
    });
    
    // Update Qualification Data
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
    }

    // 2. Calculate Priority
    const priority = aiData.priority;

    // 3. Determine Next Best Action
    await db.revenueAction.create({
      data: {
        organizationId: lead.organizationId!,
        leadId: lead.id,
        type: aiData.nextActionType,
        reason: aiData.actionReason,
        priority: priority,
        recommendedActor: aiData.recommendedActor,
        status: 'PENDING',
        source: 'REVENUE_ENGINE',
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
  }

};
