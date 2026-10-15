import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface LeadQualificationResult {
  intentScore: number;
  fitScore: number;
  urgencyScore: number;
  estimatedValue: number;
  budget?: string;
  authority?: string;
  need?: string;
  timeline?: string;
  priority: number;
  nextActionType: 'RESPOND' | 'SEND_NURTURE_SEQUENCE' | 'ASSIGN_HUMAN' | 'SEND_BOOKING_LINK';
  recommendedActor: 'HUMAN' | 'AUTOMATION' | 'AI';
  actionReason: string;
  intentEvidence: string;
  fitEvidence: string;
  urgencyEvidence: string;
  targetRole: 'CLOSER' | 'SETTER';
  aiAssessment: string;
  nextStepsRecommendation: string;
}

/**
 * Parses a numerical amount from a string (handles 500k, 500000, ₦12M, etc.)
 */
function parseAmount(text: string): number | null {
  const mMatch = text.match(/(\d+[\d,.]*)\s*(m|million)/i);
  if (mMatch) {
    const val = parseFloat(mMatch[1].replace(/,/g, ''));
    if (!isNaN(val)) return val * 1000000;
  }
  const kMatch = text.match(/(\d+[\d,.]*)\s*(k|thousand)/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1].replace(/,/g, ''));
    if (!isNaN(val)) return val * 1000;
  }
  const rawMatch = text.match(/(\d{2,}[\d,.]*)/);
  if (rawMatch) {
    const val = parseFloat(rawMatch[1].replace(/,/g, ''));
    if (!isNaN(val)) return val;
  }
  return null;
}

/**
 * Intelligent deterministic qualification analyzer
 * Strictly evaluates incoming leads against tenant-specific ICP and qualification policy.
 */
function deterministicAnalyze(
  message: string, 
  customData?: string | null, 
  explicitIntent?: number,
  qualificationPolicy?: string | null
): LeadQualificationResult {
  const text = (message + ' ' + (customData || '')).toLowerCase();
  const policyText = (qualificationPolicy || '').toLowerCase();
  
  // 1. Calculate Intent
  let intentScore = typeof explicitIntent === 'number' && !isNaN(explicitIntent) && explicitIntent > 0 
    ? explicitIntent 
    : 55;

  const highIntentKeywords = [
    'pricing', 'contract', 'proposal', 'enterprise', 'urgent', 'asap', 'immediately', 
    'closers', 'hire', 'ready to buy', 'budget', 'demo', 'call me', 'reps', 'schedule', 
    'cost', 'implement', 'purchase', 'quote'
  ];
  const lowIntentKeywords = [
    'browsing', 'student', 'just looking', 'free', 'not sure', 'later', 'someday', 'curious'
  ];

  let highMatches = 0;
  for (const kw of highIntentKeywords) {
    if (text.includes(kw)) highMatches++;
  }
  let lowMatches = 0;
  for (const kw of lowIntentKeywords) {
    if (text.includes(kw)) lowMatches++;
  }

  if (explicitIntent === undefined || explicitIntent === 50) {
    intentScore = Math.min(98, Math.max(20, 50 + (highMatches * 12) - (lowMatches * 20)));
  }

  // 2. Calculate Urgency
  let urgencyScore = 50;
  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately') || text.includes('this week') || text.includes('today') || text.includes('30 days')) {
    urgencyScore = 95;
  } else if (text.includes('next month') || text.includes('60 days') || text.includes('q4') || text.includes('soon')) {
    urgencyScore = 75;
  } else if (text.includes('next year') || text.includes('90 days') || text.includes('future') || lowMatches > 0) {
    urgencyScore = 35;
  }

  // 3. Calculate ICP Fit & Extract Financials
  let fitScore = 70;
  let estimatedValue = 3500000; // default ₦3.5M
  const leadAmount = parseAmount(text);
  if (leadAmount) {
    estimatedValue = leadAmount;
  }

  // 4. Evaluate against Organization Qualification Policy (if configured)
  let policyEvaluated = false;
  let policyPassed = true;
  let policyFailureReason = '';

  if (policyText.trim().length > 0) {
    policyEvaluated = true;

    // Check minimum budget threshold in policy
    if (policyText.includes('budget') || policyText.includes('₦') || policyText.includes('$') || policyText.includes('minimum')) {
      const minPolicyBudget = parseAmount(policyText);
      if (minPolicyBudget && leadAmount !== null) {
        if (leadAmount < minPolicyBudget) {
          policyPassed = false;
          policyFailureReason = `Stated budget (₦${leadAmount.toLocaleString()}) is below organization minimum threshold (₦${minPolicyBudget.toLocaleString()}).`;
        }
      }
    }

    // Check authority requirements in policy
    if (policyText.includes('founder') || policyText.includes('director') || policyText.includes('ceo') || policyText.includes('c-level')) {
      const hasExec = text.includes('founder') || text.includes('director') || text.includes('ceo') || text.includes('co-founder') || text.includes('partner') || text.includes('manager');
      if (!hasExec && (text.includes('job seeker') || text.includes('student') || text.includes('graduate'))) {
        policyPassed = false;
        policyFailureReason = policyFailureReason || `Lead role does not meet required executive decision-maker authority specified in tenant policy.`;
      }
    }

    // Check exclusion/disqualification rules in policy
    if (policyText.includes('disqualify') || policyText.includes('b2b only')) {
      if (policyText.includes('b2b only') && (text.includes('individual') || text.includes('job seeker'))) {
        policyPassed = false;
        policyFailureReason = policyFailureReason || `Tenant qualification policy requires B2B commercial entities only.`;
      }
    }
  }

  // Calculate Fit & Priority based on Policy evaluation
  let actionReason = '';
  let nextActionType: LeadQualificationResult['nextActionType'] = 'RESPOND';
  let recommendedActor: LeadQualificationResult['recommendedActor'] = 'AI';

  if (policyEvaluated && !policyPassed) {
    // Fails organization custom criteria
    fitScore = 25;
    intentScore = Math.min(intentScore, 40);
    const priority = Math.min(30, Math.round((intentScore * 0.4) + (fitScore * 0.4) + (urgencyScore * 0.2)));
    nextActionType = 'SEND_NURTURE_SEQUENCE';
    recommendedActor = 'AUTOMATION';
    actionReason = `Disqualified by Organization ICP Policy: ${policyFailureReason} Enrolled in automated nurture.`;

    return {
      intentScore,
      fitScore,
      urgencyScore,
      estimatedValue,
      budget: leadAmount ? `₦${leadAmount.toLocaleString()}` : undefined,
      authority: text.includes('founder') || text.includes('director') ? 'Executive' : 'Individual',
      need: message ? message.slice(0, 150) : 'General inquiry',
      timeline: urgencyScore >= 80 ? 'Immediate (< 14 days)' : 'Flexible',
      priority,
      nextActionType,
      recommendedActor,
      actionReason,
      intentEvidence: `Score ${intentScore}/100 adjusted because lead did not satisfy tenant qualification rules.`,
      fitEvidence: `Evaluated against Tenant ICP Policy: Disqualified (${policyFailureReason})`,
      urgencyEvidence: `Urgency scored at ${urgencyScore}/100 based on prospect timeline.`
    };
  }

  // Meets criteria or standard evaluation
  if (text.includes('enterprise') || text.includes('team') || text.includes('reps') || text.includes('company') || text.includes('logistics') || text.includes('consulting') || text.includes('founder')) {
    fitScore = 92;
  } else if (lowMatches > 0) {
    fitScore = 40;
  }

  const priority = Math.min(100, Math.round((intentScore * 0.5) + (urgencyScore * 0.3) + (fitScore * 0.2)));

  if (intentScore >= 80 || (fitScore >= 85 && urgencyScore >= 75)) {
    nextActionType = 'ASSIGN_HUMAN';
    recommendedActor = 'HUMAN';
    actionReason = policyEvaluated 
      ? `High intent (${intentScore}/100) & verified match with Organization ICP Policy. Fast-track human closer discovery call within 15m SLA.`
      : `High intent (${intentScore}/100) & urgent buying signals. Fast-track human closer discovery call within 15m SLA.`;
  } else if (intentScore >= 55) {
    nextActionType = 'SEND_BOOKING_LINK';
    recommendedActor = 'AI';
    actionReason = `Qualified prospect (${intentScore}/100). Auto-dispatch interactive demo and calendar booking invitation.`;
  } else {
    nextActionType = 'SEND_NURTURE_SEQUENCE';
    recommendedActor = 'AUTOMATION';
    actionReason = `Low intent exploration (${intentScore}/100). Enroll in automated nurture sequence to warm up deal.`;
  }

  const isCloserTier = intentScore >= 75 || fitScore >= 80 || (leadAmount && leadAmount >= 250000);
  const targetRole: 'CLOSER' | 'SETTER' = isCloserTier ? 'CLOSER' : 'SETTER';

  const statedBudget = leadAmount ? `₦${leadAmount.toLocaleString()}` : (text.includes('budget') ? 'Stated in notes' : 'Pending verification');
  const authorityRole = text.includes('founder') || text.includes('ceo') || text.includes('director') || text.includes('manager') ? 'Executive Decision Maker' : 'Evaluator';

  const aiAssessment = `Fit Score: ${fitScore}/100 • Intent: ${intentScore}/100 • Priority: ${priority}/100\n` +
    `Authority: ${authorityRole} • Budget: ${statedBudget}\n` +
    `Identified Need: ${(message || 'Sales pipeline automation').slice(0, 100)}\n` +
    `Deal Health: ${fitScore >= 75 && intentScore >= 70 ? '🟢 High Conversion Probability' : '🟡 Requires Qualification Discovery'}`;

  const nextStepsRecommendation = isCloserTier
    ? `🎯 CLOSER ACTION PROTOCOL:\n` +
      `• Prescribed Opener: "Hi! I reviewed your notes regarding your pipeline goals. Based on your budget of ${statedBudget}, we have trained closing capacity ready to plug in."\n` +
      `• Best Channel: WhatsApp Direct Audio / Zoom Demo Call\n` +
      `• Objective: Confirm sales targets, present CloseCraft closer tier, lock in 14-day pilot agreement within 48h.\n` +
      `• SLA: Respond within 15 minutes.`
    : `📋 SETTER ACTION PROTOCOL:\n` +
      `• Prescribed Opener: "Hello! Thank you for reaching out to CloseCraft. To connect you with our senior closer, are you looking for remote closers or training an internal team?"\n` +
      `• Best Channel: WhatsApp Message or 5-minute Discovery Call\n` +
      `• Objective: Qualify lead volume and book appointment directly onto the Closer calendar within 24 hours.`;

  return {
    intentScore,
    fitScore,
    urgencyScore,
    estimatedValue,
    budget: leadAmount ? `₦${leadAmount.toLocaleString()}` : (text.includes('budget') ? 'Stated in notes' : undefined),
    authority: authorityRole,
    need: message ? message.slice(0, 150) : 'Revenue & Sales Pipeline Automation',
    timeline: urgencyScore >= 80 ? 'Immediate (< 30 days)' : '1-3 months',
    priority,
    nextActionType,
    recommendedActor,
    actionReason,
    intentEvidence: `Derived from prospect request and buying intent signals: "${(message || 'Inbound inquiry').slice(0, 80)}"`,
    fitEvidence: policyEvaluated 
      ? `ICP Fit assessed at ${fitScore}/100. Lead verified against Tenant Qualification Policy.`
      : `ICP Fit assessed at ${fitScore}/100 based on B2B profile and team requirements.`,
    urgencyEvidence: `Urgency scored at ${urgencyScore}/100 based on deployment timeline.`,
    targetRole,
    aiAssessment,
    nextStepsRecommendation
  };
}

export async function extractLeadQualificationData(
  message: string, 
  customData?: string | null,
  explicitIntent?: number,
  qualificationPolicy?: string | null
): Promise<LeadQualificationResult> {
  const hasKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 5);

  if (!hasKey) {
    return deterministicAnalyze(message, customData, explicitIntent, qualificationPolicy);
  }

  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        intentScore: z.number().min(1).max(100).describe('Estimated buying intent from 1 to 100 based on the message urgency and specifics.'),
        fitScore: z.number().min(1).max(100).describe('ICP Fit score 1-100 based on tenant policy and company profile.'),
        urgencyScore: z.number().min(1).max(100).describe('Urgency score 1-100.'),
        estimatedValue: z.number().describe('Estimated deal value in NGN.'),
        budget: z.string().optional().describe('Extracted budget if mentioned.'),
        authority: z.string().optional().describe('Extracted authority/role if mentioned.'),
        need: z.string().optional().describe('The core problem or need the lead is trying to solve.'),
        timeline: z.string().optional().describe('When they need the solution by.'),
        priority: z.number().min(1).max(100).describe('Priority score for sales team follow up (1-100).'),
        nextActionType: z.enum(['RESPOND', 'SEND_NURTURE_SEQUENCE', 'ASSIGN_HUMAN', 'SEND_BOOKING_LINK']).describe('The recommended next best action type.'),
        recommendedActor: z.enum(['HUMAN', 'AUTOMATION', 'AI']).describe('Who should take the next action.'),
        actionReason: z.string().describe('Reason for the recommended next action referencing the qualification policy.'),
        intentEvidence: z.string().describe('Explainable evidence for intent.'),
        fitEvidence: z.string().describe('Explainable evidence for ICP fit evaluated against the tenant policy.'),
        urgencyEvidence: z.string().describe('Explainable evidence for urgency.')
      }),
      prompt: `Analyze the following lead information for the Closecraft Revenue Engine according to the Tenant's Specific Qualification Policy.

TENANT QUALIFICATION POLICY (MANDATORY - YOU MUST SCORE AND QUALIFY STRICTLY ACCORDING TO THIS POLICY):
${qualificationPolicy || 'Default: Score leads on intent, budget, authority, need, and urgency.'}

Lead Message / Inquiry:
${message}

Additional Data:
${customData || 'None'}

Explicit Intent Score:
${explicitIntent ?? 'None'}
`
    });

    return result.object;
  } catch (error) {
    console.warn('[AI Extractor] OpenAI call failed, falling back to policy-aware deterministic engine:', error);
    return deterministicAnalyze(message, customData, explicitIntent, qualificationPolicy);
  }
}
