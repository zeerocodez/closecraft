'use server'

/**
 * Modular SaaS Server Actions
 * 
 * Domain-partitioned actions:
 * - leadActions: Lead creation, claiming, assignment, handoff, fast enquiry, follow-ups
 * - dealActions: Deal creation, stage transition, commissions, payouts
 * - appointmentActions: Appointment booking, scheduling, Google Calendar integration
 * - revenueEngineActions: AI qualification, action claiming, policy updates, action overrides
 * - teamActions: Team member management, availability, routing, organization identity & approval
 * - pilotActions: Sales support, client blockers, pilot efforts, terms acceptance, Bachs checkout
 * - workspaceActions: Demo workspace seeding and cleanup
 */

import * as leads from './actions/leadActions';
import * as deals from './actions/dealActions';
import * as appointments from './actions/appointmentActions';
import * as revEngine from './actions/revenueEngineActions';
import * as team from './actions/teamActions';
import * as pilot from './actions/pilotActions';
import * as workspace from './actions/workspaceActions';

// Lead Actions
export async function addManualLead(...args: Parameters<typeof leads.addManualLead>) {
  return leads.addManualLead(...args);
}

export async function claimLead(...args: Parameters<typeof leads.claimLead>) {
  return leads.claimLead(...args);
}

export async function assignLeadToUser(...args: Parameters<typeof leads.assignLeadToUser>) {
  return leads.assignLeadToUser(...args);
}

export async function handoffLeadToCloser(...args: Parameters<typeof leads.handoffLeadToCloser>) {
  return leads.handoffLeadToCloser(...args);
}

export async function recordFastEnquiry(...args: Parameters<typeof leads.recordFastEnquiry>) {
  return leads.recordFastEnquiry(...args);
}

export async function updateLeadFollowUp(...args: Parameters<typeof leads.updateLeadFollowUp>) {
  return leads.updateLeadFollowUp(...args);
}

// Deal Actions
export async function createDeal(...args: Parameters<typeof deals.createDeal>) {
  return deals.createDeal(...args);
}

export async function updateDealStage(...args: Parameters<typeof deals.updateDealStage>) {
  return deals.updateDealStage(...args);
}

export async function updateMemberCommission(...args: Parameters<typeof deals.updateMemberCommission>) {
  return deals.updateMemberCommission(...args);
}

export async function updateCommissionPayoutStatus(...args: Parameters<typeof deals.updateCommissionPayoutStatus>) {
  return deals.updateCommissionPayoutStatus(...args);
}

// Appointment Actions
export async function createAppointment(...args: Parameters<typeof appointments.createAppointment>) {
  return appointments.createAppointment(...args);
}

export async function updateGoogleCalendarIntegration(...args: Parameters<typeof appointments.updateGoogleCalendarIntegration>) {
  return appointments.updateGoogleCalendarIntegration(...args);
}

export async function bookOrUpdateAppointment(...args: Parameters<typeof appointments.bookOrUpdateAppointment>) {
  return appointments.bookOrUpdateAppointment(...args);
}

export async function updateAppointmentStatus(...args: Parameters<typeof appointments.updateAppointmentStatus>) {
  return appointments.updateAppointmentStatus(...args);
}

// Revenue Engine Actions
export async function runAIQualification(...args: Parameters<typeof revEngine.runAIQualification>) {
  return revEngine.runAIQualification(...args);
}

export async function claimRevenueAction(...args: Parameters<typeof revEngine.claimRevenueAction>) {
  return revEngine.claimRevenueAction(...args);
}

export async function updateQualificationPolicy(...args: Parameters<typeof revEngine.updateQualificationPolicy>) {
  return revEngine.updateQualificationPolicy(...args);
}

export async function overrideNextBestAction(...args: Parameters<typeof revEngine.overrideNextBestAction>) {
  return revEngine.overrideNextBestAction(...args);
}

// Team Actions
export async function setOrganizationStatus(...args: Parameters<typeof team.setOrganizationStatus>) {
  return team.setOrganizationStatus(...args);
}

export async function addTenantTeamMember(...args: Parameters<typeof team.addTenantTeamMember>) {
  return team.addTenantTeamMember(...args);
}

export async function removeTenantTeamMember(...args: Parameters<typeof team.removeTenantTeamMember>) {
  return team.removeTenantTeamMember(...args);
}

export async function toggleMemberAvailability(...args: Parameters<typeof team.toggleMemberAvailability>) {
  return team.toggleMemberAvailability(...args);
}

export async function updateTenantRoutingMode(...args: Parameters<typeof team.updateTenantRoutingMode>) {
  return team.updateTenantRoutingMode(...args);
}

export async function updateOrganizationIdentity(...args: Parameters<typeof team.updateOrganizationIdentity>) {
  return team.updateOrganizationIdentity(...args);
}

// Pilot Actions
export async function submitSalesSupportRequest(...args: Parameters<typeof pilot.submitSalesSupportRequest>) {
  return pilot.submitSalesSupportRequest(...args);
}

export async function saveClientBlocker(...args: Parameters<typeof pilot.saveClientBlocker>) {
  return pilot.saveClientBlocker(...args);
}

export async function resolveBlockerAction(...args: Parameters<typeof pilot.resolveBlockerAction>) {
  return pilot.resolveBlockerAction(...args);
}

export async function logPilotEffort(...args: Parameters<typeof pilot.logPilotEffort>) {
  return pilot.logPilotEffort(...args);
}

export async function acceptPilotTermsAction(...args: Parameters<typeof pilot.acceptPilotTermsAction>) {
  return pilot.acceptPilotTermsAction(...args);
}

export async function createBachsCheckoutAction(...args: Parameters<typeof pilot.createBachsCheckoutAction>) {
  return pilot.createBachsCheckoutAction(...args);
}

// Workspace Actions
export async function seedSampleWorkspaceAction(...args: Parameters<typeof workspace.seedSampleWorkspaceAction>) {
  return workspace.seedSampleWorkspaceAction(...args);
}

export async function clearSampleWorkspaceAction(...args: Parameters<typeof workspace.clearSampleWorkspaceAction>) {
  return workspace.clearSampleWorkspaceAction(...args);
}
