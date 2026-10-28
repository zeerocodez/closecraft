import { ManagedServiceAnswers, ManagedServiceRecommendation } from './types';

export const DEFAULT_CLOSER_THRESHOLD = 20;

export interface ManagedServiceEvaluationResult {
  recommendation: ManagedServiceRecommendation;
  reason: string;
  isDedicatedCloserRequest: boolean;
  estimatedWorkloadHours?: number | null;
  requiresOperatorDocumentedWorkload: boolean;
  rulesVersion: string;
}

/**
 * Pure domain rules engine for managed service screening and routing.
 * Evaluates requested service type, qualified conversation velocity, and appointment-setting workload.
 * Enforces human-in-the-loop: An operator must always approve proposals.
 */
export function evaluateManagedServiceScreening(
  answers: ManagedServiceAnswers,
  closerThreshold: number = DEFAULT_CLOSER_THRESHOLD
): ManagedServiceEvaluationResult {
  const isDedicatedCloser = answers.managedServiceNeed === 'CONDUCTING_CONVERSATIONS';
  
  // 1. Dedicated Closer Screening Workflow
  if (isDedicatedCloser) {
    let pastConversations = 0;
    let isPastUnknown = false;

    if (typeof answers.qualifiedConversations30dExact === 'number') {
      pastConversations = answers.qualifiedConversations30dExact;
    } else if (answers.qualifiedConversations30dRange) {
      if (answers.qualifiedConversations30dRange === 'NOT_SURE') {
        isPastUnknown = true;
      } else if (answers.qualifiedConversations30dRange === '40+') {
        pastConversations = 40;
      } else if (answers.qualifiedConversations30dRange === '20-39') {
        pastConversations = 20;
      } else if (answers.qualifiedConversations30dRange === '10-19') {
        pastConversations = 10;
      } else {
        pastConversations = 5;
      }
    } else {
      isPastUnknown = true;
    }

    const hasSuitablePipeline = (answers.pipelineSuitableCount || 0) > 0 || (answers.pipelineAgreedNextCallCount || 0) > 0;

    // Condition 1: Unknown past conversations or sparse history
    if (isPastUnknown) {
      return {
        recommendation: 'BOUNDED_PILOT_RECOMMENDED',
        reason: 'Historical conversation volume is currently unverified. A bounded 30-day pilot testing closer performance on initial opportunities is recommended.',
        isDedicatedCloserRequest: true,
        requiresOperatorDocumentedWorkload: true,
        rulesVersion: '2026.1',
      };
    }

    // Condition 2: Meets or exceeds 20 qualified conversations
    if (pastConversations >= closerThreshold) {
      return {
        recommendation: 'READY_FOR_SERVICE_REVIEW',
        reason: `Reports approximately ${pastConversations} qualified sales conversations in the last 30 days (meeting the ~${closerThreshold} target). Request can proceed to operator proposal assessment.`,
        isDedicatedCloserRequest: true,
        requiresOperatorDocumentedWorkload: false,
        rulesVersion: '2026.1',
      };
    }

    // Condition 3: Under 20 conversations, but suitable pipeline exists
    if (hasSuitablePipeline) {
      return {
        recommendation: 'WORKLOAD_OR_ECONOMICS_NEED_REVIEW',
        reason: `Reports ${pastConversations} recent conversations (below the ~${closerThreshold} threshold), but holds an active pipeline of suitable opportunities. Operator must document equivalent workload basis before proposal.`,
        isDedicatedCloserRequest: true,
        requiresOperatorDocumentedWorkload: true,
        rulesVersion: '2026.1',
      };
    }

    // Condition 4: Low volume and no verified pipeline
    return {
      recommendation: 'ALTERNATIVE_SUPPORT_MAY_FIT',
      reason: `Conversation volume (${pastConversations}/mo) is below the threshold for a full dedicated closer. Appointment setting or follow-up support to build conversation volume is recommended first.`,
      isDedicatedCloserRequest: true,
      requiresOperatorDocumentedWorkload: false,
      rulesVersion: '2026.1',
    };
  }

  // 2. Appointment Setting & Follow-up Workload Capacity (Do NOT apply closer conversation threshold)
  if (answers.managedServiceNeed === 'QUALIFYING_APPOINTMENTS' || answers.managedServiceNeed === 'FOLLOWING_UP_EXISTING' || answers.managedServiceNeed === 'RESPONDING_NEW') {
    const tasksPerOpp = answers.workloadTasksPerOpportunity || 3;
    const avgDurationMin = answers.workloadAvgTaskDurationMinutes || 15;
    const estOpportunities = 30; // base monthly baseline if unknown
    
    // Workload calculation in hours (pure estimate, preserved as estimate)
    const estimatedWorkloadHours = Math.round((estOpportunities * tasksPerOpp * avgDurationMin) / 60);

    return {
      recommendation: 'READY_FOR_SERVICE_REVIEW',
      reason: `Appointment setting and follow-up support scoped on workload basis (approx. ${estimatedWorkloadHours} estimated hours/month across ${answers.workloadChannels?.join(', ') || 'WhatsApp & Email'}). Ready for service package scoping.`,
      isDedicatedCloserRequest: false,
      estimatedWorkloadHours,
      requiresOperatorDocumentedWorkload: false,
      rulesVersion: '2026.1',
    };
  }

  // 3. Help Deciding
  return {
    recommendation: 'BOUNDED_PILOT_RECOMMENDED',
    reason: 'Client requested advisory guidance to determine appropriate sales support scope. Operator exploratory review recommended.',
    isDedicatedCloserRequest: false,
    requiresOperatorDocumentedWorkload: false,
    rulesVersion: '2026.1',
  };
}
