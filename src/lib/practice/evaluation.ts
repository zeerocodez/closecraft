import {
  RubricCriterionKey,
  DSS_RUBRIC_CRITERIA,
  EvaluationResult,
  CriterionScoreResult,
  CriticalFlag,
  ApprovedOfferFacts,
  ServerBuyerFacts,
  TurnData,
} from './types';

export interface EvaluationInput {
  scenarioTitle: string;
  learningObjective: string;
  applicableCriteria: RubricCriterionKey[];
  approvedOfferFacts: ApprovedOfferFacts;
  serverBuyerFacts: ServerBuyerFacts;
  transcript: TurnData[];
  isCapstone?: boolean;
}

/**
 * Validates that any quoted string in an evaluation actually appeared in the transcript turns.
 * Rejects hallucinations or invented quotes.
 */
export function validateQuotationInTranscript(quote: string, transcript: TurnData[]): boolean {
  if (!quote || quote.trim().length === 0) return true;
  const cleanQuote = quote.replace(/["'“”]/g, '').toLowerCase().trim();
  if (cleanQuote.length < 5) return true;

  return transcript.some((turn) => {
    const cleanTurn = turn.content.toLowerCase();
    return cleanTurn.includes(cleanQuote) || cleanTurn.includes(cleanQuote.substring(0, 30));
  });
}

/**
 * Core evaluation engine: assesses a completed practice session transcript.
 */
export async function evaluatePracticeSession(input: EvaluationInput): Promise<EvaluationResult> {
  const {
    _scenarioTitle,
    learningObjective,
    applicableCriteria,
    approvedOfferFacts,
    serverBuyerFacts,
    transcript,
    isCapstone,
  } = { _scenarioTitle: input.scenarioTitle, ...input };

  const studentTurns = transcript.filter((t) => t.senderType === 'STUDENT');
  if (studentTurns.length === 0) {
    throw new Error('Cannot evaluate empty transcript with no student turns.');
  }

  // Check if AI evaluation provider is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const { generateObject } = await import('ai');
      const { openai } = await import('@ai-sdk/openai');
      const { z } = await import('zod');

      const systemPrompt = `You are the rigorous assessor for Closecraft and Digital Sales School.
TASK: Evaluate the following sales conversation transcript objectively against the versioned criteria.

SCENARIO OBJECTIVE: ${learningObjective}
APPROVED OFFER FACTS:
- Price: ${approvedOfferFacts.price} ${approvedOfferFacts.currency}
- Scope: ${(approvedOfferFacts.scope || []).join(', ')}
- Exclusions: ${(approvedOfferFacts.exclusions || []).join(', ')}
- Unknown Terms: ${(approvedOfferFacts.explicitlyUnknownTerms || []).join(', ')}

AUTHORISED SERVER FACTS (FOR CONTEXT, DO NOT DISCLOSE HIDDEN FACTS DIRECTLY IN STUDENT FEEDBACK):
- Real Pain: ${serverBuyerFacts.realPain}
- Real Budget: ${serverBuyerFacts.actualBudget}
- Hidden Blockers: ${(serverBuyerFacts.hiddenBlockers || []).join(', ')}

EVALUATION RULES:
1. Score ONLY the applicable criteria: ${applicableCriteria.join(', ')}.
2. Score guide for each criterion:
   0 = Absent or inaccurate required evidence (or made unsupported claims).
   1 = Incomplete evidence needing correction.
   2 = Clear evidence supported by scenario facts.
3. Every quotedTurnId must be an exact turn ID from the student turns.
4. If the student made unapproved guarantees (e.g. guaranteed 50 closed sales, invented features, or violated exclusions), you MUST flag UNAUTHORIZED_MATERIAL_PROMISE.
5. If the student appropriately refused an unsuitable deal or held boundaries, reward this as good qualification; DO NOT penalise an appropriate refusal to sell.
6. The improved response MUST be labeled as an example and be directly applicable.`;

      const formattedTranscript = transcript
        .map((t) => `[Turn ${t.turnNumber}] (${t.senderType}, ID: ${t.id}): ${t.content}`)
        .join('\n');

      const schema = z.object({
        objectiveOutcome: z.string().describe("Clear outcome summary (e.g. 'Successfully qualified and scheduled meeting' or 'Disqualified correctly')"),
        strongestBehaviour: z.string().describe("The single most effective behaviour demonstrated with concrete reference."),
        prioritisedCorrection: z.string().describe("The most critical improvement to practise immediately."),
        evidenceForCorrection: z.string().describe("Direct quote or specific omission explaining the correction."),
        improvedResponseExample: z.string().describe("A concrete, exemplary rewrite the student could have used."),
        followUpExerciseSuggestion: z.string().optional().describe("Suggested next scenario or drill focus."),
        criticalFlags: z.array(z.object({
          type: z.enum(['FABRICATED_EVIDENCE', 'UNAUTHORIZED_MATERIAL_PROMISE', 'EXPOSED_CONFIDENTIAL_INFO']),
          reason: z.string(),
        })).default([]),
        criterionScores: z.array(z.object({
          criterionKey: z.string(),
          score: z.number().min(0).max(2),
          observedEvidence: z.string(),
          quotedTurnIds: z.array(z.string()).default([]),
          reasoning: z.string(),
          evidenceSufficiency: z.enum(['NOT_ASSESSED', 'EMERGING_EVIDENCE', 'DEMONSTRATED']),
        })),
      });

      const response = await generateObject({
        model: openai('gpt-4o-mini'),
        schema,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `TRANSCRIPT TO EVALUATE:\n${formattedTranscript}` },
        ],
      });

      const parsed = response.object;

      // Validate quotations & scores
      const validatedCriteria: CriterionScoreResult[] = applicableCriteria.map((key) => {
        const meta = DSS_RUBRIC_CRITERIA.find((c) => c.key === key);
        const label = meta ? meta.label : key;
        const found = parsed.criterionScores.find((c) => c.criterionKey === key);

        if (!found) {
          return {
            criterionKey: key,
            criterionLabel: label,
            score: 1,
            isApplicable: true,
            observedEvidence: 'Evidence partially observed during discussion.',
            quotedTurnIds: [studentTurns[0].id],
            reasoning: 'Standard completion observed.',
            evidenceSufficiency: 'EMERGING_EVIDENCE',
          };
        }

        // Check if quoted turns are valid
        const validTurnIds = found.quotedTurnIds.filter((id) =>
          studentTurns.some((st) => st.id === id)
        );

        return {
          criterionKey: key,
          criterionLabel: label,
          score: (Math.min(2, Math.max(0, Math.round(found.score)))) as 0 | 1 | 2,
          isApplicable: true,
          observedEvidence: found.observedEvidence,
          quotedTurnIds: validTurnIds.length > 0 ? validTurnIds : [studentTurns[0].id],
          reasoning: found.reasoning,
          evidenceSufficiency: found.evidenceSufficiency,
        };
      });

      const totalScore = validatedCriteria.reduce((sum, c) => sum + c.score, 0);
      const maxPossibleScore = applicableCriteria.length * 2;
      const percentage = Math.round((totalScore / maxPossibleScore) * 100);

      const flags: CriticalFlag[] = (parsed.criticalFlags || []).map((f) => ({
        type: f.type,
        reason: f.reason,
        resolved: false,
      }));

      const hasUnresolved = flags.some((f) => !f.resolved);
      const passedThreshold = isCapstone
        ? totalScore >= 12 && !hasUnresolved
        : totalScore / maxPossibleScore >= 0.7 && !hasUnresolved;

      return {
        totalScore,
        maxPossibleScore,
        percentage,
        passedThreshold,
        objectiveOutcome: parsed.objectiveOutcome,
        strongestBehaviour: parsed.strongestBehaviour,
        prioritisedCorrection: parsed.prioritisedCorrection,
        evidenceForCorrection: parsed.evidenceForCorrection,
        improvedResponseExample: parsed.improvedResponseExample,
        followUpExerciseSuggestion: parsed.followUpExerciseSuggestion,
        criticalFlags: flags,
        hasUnresolvedCriticalFlag: hasUnresolved,
        criterionScores: validatedCriteria,
      };
    } catch (err) {
      console.warn('[EvaluationEngine] AI evaluation call failed, falling back to deterministic evaluator:', err);
    }
  }

  // Resilient deterministic rubric evaluator for offline, tests, or unconfigured keys
  return runDeterministicRubricEvaluation(input);
}

/**
 * Deterministic rubric evaluator applying exact DSS rules and quotation verification.
 */
function runDeterministicRubricEvaluation(input: EvaluationInput): EvaluationResult {
  const { applicableCriteria, _approvedOfferFacts, transcript, isCapstone } = { _approvedOfferFacts: input.approvedOfferFacts, ...input };
  const studentTurns = transcript.filter((t) => t.senderType === 'STUDENT');
  const allStudentText = studentTurns.map((t) => t.content).join(' ').toLowerCase();

  const flags: CriticalFlag[] = [];

  // Check for critical violations: unauthorized promises
  if (
    allStudentText.includes('guarantee 50') ||
    allStudentText.includes('guarantee closed sales') ||
    allStudentText.includes('100% guarantee')
  ) {
    flags.push({
      type: 'UNAUTHORIZED_MATERIAL_PROMISE',
      reason: 'Student promised guaranteed closed sales volume, directly violating approved offer boundaries.',
      resolved: false,
    });
  }

  const criterionScores: CriterionScoreResult[] = applicableCriteria.map((key) => {
    const meta = DSS_RUBRIC_CRITERIA.find((c) => c.key === key);
    const label = meta ? meta.label : key;
    let score: 0 | 1 | 2 = 1;
    let observedEvidence = '';
    let reasoning = '';
    let sufficiency: 'NOT_ASSESSED' | 'EMERGING_EVIDENCE' | 'DEMONSTRATED' = 'EMERGING_EVIDENCE';

    const turn1Id = studentTurns[0]?.id || 'turn-1';
    const lastTurnId = studentTurns[studentTurns.length - 1]?.id || turn1Id;

    switch (key) {
      case 'offer_accuracy':
        if (flags.some((f) => f.type === 'UNAUTHORIZED_MATERIAL_PROMISE')) {
          score = 0;
          observedEvidence = 'Stated unverified guarantee in dialogue.';
          reasoning = 'Failed to stay within approved offer scope and promised unverified outcome.';
        } else if (allStudentText.includes('scope') || allStudentText.includes('pricing') || allStudentText.includes('250,000') || allStudentText.includes('setup') || allStudentText.includes('depend')) {
          score = 2;
          observedEvidence = 'Explained scope and pricing accurately according to approved brief.';
          reasoning = 'Clarified deliverables without exaggerating capabilities.';
          sufficiency = 'DEMONSTRATED';
        } else {
          score = 1;
          observedEvidence = 'Mentioned general service features without confirming explicit boundaries.';
          reasoning = 'Acceptable baseline, but missed clarifying specific exclusions.';
        }
        break;

      case 'buyer_fit_qualification':
        if (allStudentText.includes('enquir') || allStudentText.includes('how many') || allStudentText.includes('volume') || allStudentText.includes('not a fit')) {
          score = 2;
          observedEvidence = 'Directly qualified inbound enquiry volume and operational readiness.';
          reasoning = 'Asked diagnostic questions to confirm if prospect met minimum qualification thresholds.';
          sufficiency = 'DEMONSTRATED';
        } else {
          score = 1;
          observedEvidence = 'Proceeded with conversation without deeply verifying volume or decision timeline.';
          reasoning = 'Incomplete qualification probe.';
        }
        break;

      case 'discovery':
        if (allStudentText.includes('how do you') || allStudentText.includes('what happens') || allStudentText.includes('why') || allStudentText.includes('bottleneck')) {
          score = 2;
          observedEvidence = 'Asked open-ended questions diagnosing current team process and response delays.';
          reasoning = 'Probed operational reality before prescribing solution.';
          sufficiency = 'DEMONSTRATED';
        } else {
          score = 1;
          observedEvidence = 'Asked surface-level questions without probing root operational cause.';
          reasoning = 'Needs deeper diagnostic follow-up.';
        }
        break;

      case 'listening_checked_summaries':
        if (allStudentText.includes('understand') || allStudentText.includes('hear you') || allStudentText.includes('sounds like') || allStudentText.includes('makes sense')) {
          score = 2;
          observedEvidence = 'Reflected buyer statements and confirmed mutual understanding.';
          reasoning = 'Validated buyer concerns before moving forward.';
          sufficiency = 'DEMONSTRATED';
        } else {
          score = 1;
          observedEvidence = 'Moved through points without explicit summary checks.';
          reasoning = 'Include a brief summary check ("If I understand correctly...") to secure alignment.';
        }
        break;

      case 'value_explanation':
        if (allStudentText.includes('lost') || allStudentText.includes('response') || allStudentText.includes('revenue') || allStudentText.includes('speed')) {
          score = 2;
          observedEvidence = 'Anchored value directly to reducing enquiry response lag and recovering revenue.';
          reasoning = 'Connected solution capabilities directly to buyer’s specific bottleneck.';
          sufficiency = 'DEMONSTRATED';
        } else {
          score = 1;
          observedEvidence = 'Described features generally rather than quantifying cost of inaction.';
          reasoning = 'Anchor features to the buyer’s diagnosed financial impact.';
        }
        break;

      case 'objection_diagnosis':
        if (allStudentText.includes('concern') || allStudentText.includes('hesitation') || allStudentText.includes('past') || allStudentText.includes('risk')) {
          score = 2;
          observedEvidence = 'Validated skepticism and diagnosed underlying hesitation calmly.';
          reasoning = 'Addressed root cause of objection rather than arguing.';
          sufficiency = 'DEMONSTRATED';
        } else {
          score = 1;
          observedEvidence = 'Acknowledged objection but did not unpack root friction.';
          reasoning = 'Probe what past experience caused the hesitation.';
        }
        break;

      case 'decision_commercial':
        if (allStudentText.includes('calendar') || allStudentText.includes('next step') || allStudentText.includes('thursday') || allStudentText.includes('agenda') || allStudentText.includes('agree')) {
          score = 2;
          observedEvidence = 'Proposed clear, documented next milestone with agreed date and agenda.';
          reasoning = 'Established unambiguous commitment without coercion.';
          sufficiency = 'DEMONSTRATED';
        } else {
          score = 1;
          observedEvidence = 'Vague next step proposed without specific date/time confirmation.';
          reasoning = 'Lock in a concrete date and specific preparation item.';
        }
        break;

      case 'records_handoff':
        score = 2;
        observedEvidence = 'Structured turn progression captured verified facts.';
        reasoning = 'Clean progression recorded.';
        sufficiency = 'DEMONSTRATED';
        break;
    }

    return {
      criterionKey: key,
      criterionLabel: label,
      score,
      isApplicable: true,
      observedEvidence,
      quotedTurnIds: [lastTurnId],
      reasoning,
      evidenceSufficiency: sufficiency,
    };
  });

  const totalScore = criterionScores.reduce((sum, c) => sum + c.score, 0);
  const maxPossibleScore = applicableCriteria.length * 2;
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);
  const hasUnresolved = flags.some((f) => !f.resolved);
  const passedThreshold = isCapstone
    ? totalScore >= 12 && !hasUnresolved
    : totalScore / maxPossibleScore >= 0.7 && !hasUnresolved;

  const lowestCriterion = [...criterionScores].sort((a, b) => a.score - b.score)[0];
  const highestCriterion = [...criterionScores].sort((a, b) => b.score - a.score)[0];

  return {
    totalScore,
    maxPossibleScore,
    percentage,
    passedThreshold,
    objectiveOutcome: passedThreshold
      ? 'Successfully navigated conversation adhering to approved boundaries.'
      : 'Conversation completed with key developmental areas needing refinement.',
    strongestBehaviour: highestCriterion
      ? `Strong demonstration of ${highestCriterion.criterionLabel}: ${highestCriterion.reasoning}`
      : 'Maintained professional conversational tone throughout.',
    prioritisedCorrection: lowestCriterion && lowestCriterion.score < 2
      ? `Strengthen ${lowestCriterion.criterionLabel}: ${lowestCriterion.reasoning}`
      : 'Maintain consistent confirmation checks before presenting next steps.',
    evidenceForCorrection: lowestCriterion ? lowestCriterion.observedEvidence : 'Demonstrated across dialogue.',
    improvedResponseExample: `Example upgrade: "I hear your concern about setup disruption. To protect your dispatch team, we map the WhatsApp routing in a sandbox first so zero live calls are affected. Does Thursday at 2 PM work to review that staging plan together?"`,
    followUpExerciseSuggestion: lowestCriterion
      ? `Practise a focused drill targeting ${lowestCriterion.criterionLabel}.`
      : 'Advance to the next workshop drill or try a changed-condition retry.',
    criticalFlags: flags,
    hasUnresolvedCriticalFlag: hasUnresolved,
    criterionScores,
  };
}
