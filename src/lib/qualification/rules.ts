import { SoftwareAnswers, SoftwareFitCategory } from './types';

export const CURRENT_RULES_VERSION = '2026.1';
export const DEFAULT_ENQUIRY_THRESHOLD = 20;

export interface SoftwareEvaluationResult {
  category: SoftwareFitCategory;
  reason: string;
  recommendedAction: string;
  rulesVersion: string;
  thresholdUsed: number;
  hasConfirmedDifficulty: boolean;
  isHighVolume: boolean;
  hasOlderPipeline: boolean;
  isUnknownOrIncomplete: boolean;
}

/**
 * Pure domain rules engine for software qualification.
 * Evaluates reported new enquiry volume, older pipeline workload, and explicit follow-up friction.
 * Transparent, explainable, and free of opaque scoring.
 */
export function evaluateSoftwareFit(
  answers: SoftwareAnswers,
  threshold: number = DEFAULT_ENQUIRY_THRESHOLD
): SoftwareEvaluationResult {
  // 1. Determine volume classification
  let isHighVolume = false;
  let isLowVolume = false;
  let isVolumeUnknown = false;

  if (answers.newEnquiries30dType === 'EXACT' && typeof answers.newEnquiries30dExact === 'number') {
    if (answers.newEnquiries30dExact >= threshold) {
      isHighVolume = true;
    } else {
      isLowVolume = true;
    }
  } else if (answers.newEnquiries30dRange) {
    if (answers.newEnquiries30dRange === 'NOT_SURE') {
      isVolumeUnknown = true;
    } else if (['20-49', '50-99', '100+'].includes(answers.newEnquiries30dRange)) {
      isHighVolume = true;
    } else {
      isLowVolume = true;
    }
  } else {
    isVolumeUnknown = true;
  }

  // 2. Determine older pipeline presence (without adding to new monthly volume)
  let hasOlderPipeline = false;
  if (answers.olderOpportunitiesType === 'EXACT' && typeof answers.olderOpportunitiesCount === 'number') {
    hasOlderPipeline = answers.olderOpportunitiesCount > 0;
  } else if (answers.olderOpportunitiesRange) {
    hasOlderPipeline = ['10-19', '20-49', '50-99', '100+'].includes(answers.olderOpportunitiesRange);
  }

  // 3. Determine confirmed difficulty
  const difficulties = answers.difficulties || [];
  const hasNoDifficulty = difficulties.length === 0 || difficulties.includes('NONE');
  const hasConfirmedDifficulty = !hasNoDifficulty && difficulties.some(d => 
    ['REMEMBERING_WHEN', 'KNOWING_WHO', 'FINDING_UPDATE', 'COORDINATING_PEOPLE', 'MANAGING_OLDER_OPPORTUNITIES', 'OTHER'].includes(d)
  );

  // 4. Incomplete or unknown context check
  const isUnknownOrIncomplete = isVolumeUnknown || (
    answers.newEnquiries30dType === 'UNKNOWN' && (!answers.newEnquiries30dRange || answers.newEnquiries30dRange === 'NOT_SURE')
  );

  // RULE EVALUATION:
  // Rule A: Important answers are unknown or incomplete
  if (isUnknownOrIncomplete) {
    return {
      category: 'NEEDS_MORE_CONTEXT',
      reason: 'Enquiry volume or workload is currently unestimated. Missing information is never treated as a negative score or converted to zero.',
      recommendedAction: 'Allow use of the product and offer a short optional conversation to clarify your workflow.',
      rulesVersion: CURRENT_RULES_VERSION,
      thresholdUsed: threshold,
      hasConfirmedDifficulty,
      isHighVolume,
      hasOlderPipeline,
      isUnknownOrIncomplete: true,
    };
  }

  // Rule B: Priority Software Fit
  // Business reports at least 20 monthly enquiries AND confirms a follow-up difficulty
  if (isHighVolume && hasConfirmedDifficulty) {
    return {
      category: 'PRIORITY_SOFTWARE_FIT',
      reason: `Reports at least ${threshold} new monthly enquiries with confirmed follow-up difficulty (${difficulties.join(', ').toLowerCase()}). Priority assisted activation recommended.`,
      recommendedAction: 'Start by adding your current enquiries and assigning the next follow-up. We can help your team get this set up with assisted customer-success activation.',
      rulesVersion: CURRENT_RULES_VERSION,
      thresholdUsed: threshold,
      hasConfirmedDifficulty: true,
      isHighVolume: true,
      hasOlderPipeline,
      isUnknownOrIncomplete: false,
    };
  }

  // Rule C: High volume reporting NO difficulty must NOT automatically be marked priority fit
  if (isHighVolume && !hasConfirmedDifficulty) {
    return {
      category: 'EXPLORE_SOFTWARE_FIT',
      reason: `Reports ${threshold}+ monthly enquiries but currently reports no active follow-up friction. Self-service exploration recommended without manufactured urgency.`,
      recommendedAction: 'Try the workspace with a real enquiry and see whether it makes the next step easier to coordinate across your team.',
      rulesVersion: CURRENT_RULES_VERSION,
      thresholdUsed: threshold,
      hasConfirmedDifficulty: false,
      isHighVolume: true,
      hasOlderPipeline,
      isUnknownOrIncomplete: false,
    };
  }

  // Rule D: Potential Software Fit
  // Lower enquiry volume (< 20) but reports active older pipeline OR coordination difficulty
  if (isLowVolume && (hasOlderPipeline || hasConfirmedDifficulty)) {
    return {
      category: 'POTENTIAL_SOFTWARE_FIT',
      reason: hasOlderPipeline
        ? 'Lower monthly new enquiry volume, but maintains an active pipeline of older opportunities awaiting decision. Immediate visibility benefits established.'
        : 'Lower enquiry volume with reported team coordination difficulty. Establishing clear ownership will stop opportunities from slipping through the cracks.',
      recommendedAction: 'You can start with the opportunities already awaiting a decision. Give each one an owner and a next action.',
      rulesVersion: CURRENT_RULES_VERSION,
      thresholdUsed: threshold,
      hasConfirmedDifficulty,
      isHighVolume: false,
      hasOlderPipeline,
      isUnknownOrIncomplete: false,
    };
  }

  // Rule E: Explore Software Fit
  // Low volume and reports no current follow-up problem
  return {
    category: 'EXPLORE_SOFTWARE_FIT',
    reason: 'Modest enquiry volume and steady existing handling. Simple self-service starting path provided without pressure.',
    recommendedAction: 'Try the workspace with a real enquiry and see whether it makes the next step easier to manage.',
    rulesVersion: CURRENT_RULES_VERSION,
    thresholdUsed: threshold,
    hasConfirmedDifficulty: false,
    isHighVolume: false,
    hasOlderPipeline: false,
    isUnknownOrIncomplete: false,
  };
}
