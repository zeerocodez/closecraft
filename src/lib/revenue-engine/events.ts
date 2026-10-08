import { RevenueEngine } from './engine';

export type DomainEvent = 
  | { type: 'LeadCreated', payload: { leadId: string, organizationId: string } }
  | { type: 'MessageReceived', payload: { messageId: string, conversationId: string } }
  | { type: 'OpportunityStageChanged', payload: { dealId: string, newStage: string } }
  | { type: 'AppointmentScheduled', payload: { appointmentId: string } };

export async function dispatchEvent(event: DomainEvent) {
  // In a full production distributed system, this would push to Inngest, BullMQ, or Kafka.
  // For the monolith MVP, we dispatch async without awaiting so we don't block the HTTP response,
  // effectively creating an in-memory event bus.
  
  console.log(`[EventBus] Dispatched event: ${event.type}`);

  // Fire and forget (do not await)
  Promise.resolve().then(async () => {
    try {
      switch (event.type) {
        case 'LeadCreated':
          await RevenueEngine.processNewLead(event.payload.leadId);
          break;
        case 'MessageReceived':
          // await RevenueEngine.processIncomingMessage(event.payload.messageId);
          break;
        case 'OpportunityStageChanged':
          // await RevenueEngine.evaluateOpportunity(event.payload.dealId);
          break;
        case 'AppointmentScheduled':
          await RevenueEngine.processAppointmentScheduled(event.payload.appointmentId);
          break;
      }
    } catch (error) {
      console.error(`[EventBus] Error processing event ${event.type}:`, error);
      // In production, this would go to a Dead Letter Queue or Sentry
    }
  });
}
