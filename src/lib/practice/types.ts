export type RubricCriterionKey =
  | 'offer_accuracy'
  | 'buyer_fit_qualification'
  | 'discovery'
  | 'listening_checked_summaries'
  | 'value_explanation'
  | 'objection_diagnosis'
  | 'decision_commercial'
  | 'records_handoff';

export interface RubricCriterionMeta {
  key: RubricCriterionKey;
  label: string;
  description: string;
  scoringGuide: {
    0: string; // Absent or inaccurate required evidence
    1: string; // Incomplete evidence needing correction
    2: string; // Clear evidence supported by scenario
  };
}

export const DSS_RUBRIC_CRITERIA: RubricCriterionMeta[] = [
  {
    key: 'offer_accuracy',
    label: 'Offer Accuracy',
    description: 'Accurately explains deliverables, pricing, constraints, and prerequisites without inventing capabilities or terms.',
    scoringGuide: {
      0: 'Invented capabilities, misstated pricing, or contradicted approved offer terms.',
      1: 'Accurate on main offer but missed critical scope limits, timelines, or prerequisite terms.',
      2: 'Completely faithful to approved offer facts, stated known constraints, and declined unsupported promises.',
    },
  },
  {
    key: 'buyer_fit_qualification',
    label: 'Buyer Fit & Qualification',
    description: 'Diagnoses current volume, authority, urgency, and suitability against ICP; appropriately pauses or declines unfit prospects.',
    scoringGuide: {
      0: 'Ignored fit indicators or aggressively pursued clearly unfit/unqualified prospect.',
      1: 'Checked basic information but failed to clarify key criteria (budget, authority, or volume).',
      2: 'Thoroughly checked fit, uncovered key constraints, and correctly qualified or disqualified.',
    },
  },
  {
    key: 'discovery',
    label: 'Discovery',
    description: 'Asks focused, open questions to uncover business pain, operational bottlenecks, and true underlying impact.',
    scoringGuide: {
      0: 'Pitched immediately without diagnosing pain, operations, or current workflows.',
      1: 'Asked superficial questions without probing root causes or business impact.',
      2: 'Uncovered specific bottlenecks, impact, and workflow realities through structured discovery.',
    },
  },
  {
    key: 'listening_checked_summaries',
    label: 'Listening & Checked Summaries',
    description: 'Synthesizes buyer statements into concise, confirmed summaries before advancing.',
    scoringGuide: {
      0: 'Talked past buyer statements; ignored explicit cues or emotional hesitation.',
      1: 'Acknowledged statements but did not summarize or verify understanding before moving forward.',
      2: 'Reflected buyer words accurately, verified consensus with explicit check questions, and built alignment.',
    },
  },
  {
    key: 'value_explanation',
    label: 'Relevant Value Explanation',
    description: 'Connects solutions directly to the buyer’s diagnosed problem, avoiding generic feature dumping.',
    scoringGuide: {
      0: 'Generic feature pitch unrelated to diagnosed problems or buyer priorities.',
      1: 'Explained features well but loosely connected them to buyer pain points.',
      2: 'Explicitly anchored commercial value directly to the buyer’s specific bottleneck and stated goals.',
    },
  },
  {
    key: 'objection_diagnosis',
    label: 'Objection Diagnosis',
    description: 'Unpacks the underlying cause of buyer hesitation (timing, budget, authority, past burned experiences) rather than arguing.',
    scoringGuide: {
      0: 'Argued, became defensive, or pressured buyer with high-friction closing tricks.',
      1: 'Addressed objection on the surface without diagnosing the true underlying concern.',
      2: 'Validated buyer concern, diagnosed the root hesitation calmly, and addressed it with verified facts.',
    },
  },
  {
    key: 'decision_commercial',
    label: 'Decision & Commercial Terms',
    description: 'Frames clear, documented next steps, decision criteria, and commercial terms without pressure.',
    scoringGuide: {
      0: 'Vague next steps ("let me know whenever"), or forced coercive ultimatums.',
      1: 'Proposed a next step but failed to establish decision criteria, timeline, or stakeholder clarity.',
      2: 'Secured mutual agreement on clear next action, specific date, and exact stakeholder attendance.',
    },
  },
  {
    key: 'records_handoff',
    label: 'Records & Handoff',
    description: 'Captures accurate, auditable conversation notes, verified facts, and clean handover records.',
    scoringGuide: {
      0: 'No summary notes, or notes containing inaccurate assumptions.',
      1: 'Basic notes captured but missing key qualification facts or specific objections.',
      2: 'Crisp, structured operational handoff note with verified facts, action items, and risk flags.',
    },
  },
];

export interface ApprovedOfferFacts {
  name: string;
  price: string;
  currency: string;
  scope: string[];
  exclusions: string[];
  deliveryPrerequisites: string[];
  explicitlyUnknownTerms: string[];
}

export interface ServerBuyerFacts {
  realPain: string;
  actualBudget: string;
  decisionProcess: string;
  hiddenBlockers: string[];
  revealedUponQuestions: {
    questionTopic: string;
    revealedFact: string;
  }[];
  unsuitableConditions?: string[];
  dealBreakers?: string[];
}

export interface BuyerPersona {
  name: string;
  title: string;
  company: string;
  temperament: 'SKEPTICAL' | 'BUSY_RUSHED' | 'BUDGET_GUARDED' | 'ANALYTICAL' | 'DEFENSIVE' | 'RECEPTIVE';
  communicationStyle: string;
  boundaryConditions: string[];
}

export interface StudentScenarioProjection {
  id: string;
  slug: string;
  title: string;
  version: number;
  difficulty: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'CAPSTONE';
  scenarioFamily: string;
  targetRole: string;
  channel: string;
  estimatedMinutes: number;
  maxTurns: number;
  workshopNumber?: number | null;
  workshopTitle?: string | null;
  suggestedTrainer?: string | null;
  studentBrief: string;
  learningObjective: string;
  initialMessage: string;
  approvedOfferFacts: ApprovedOfferFacts;
  buyerPersona: {
    name: string;
    title: string;
    company: string;
    temperament: string;
  };
  applicableRubricKeys: RubricCriterionKey[];
  rubricVersion: string;
  isCapstone: boolean;
  requiredSubmissions?: string[];
  sourceLessonId?: string | null;
  sourceModuleId?: string | null;
}

export interface TurnData {
  id: string;
  turnNumber: number;
  senderType: 'STUDENT' | 'BUYER' | 'SYSTEM';
  content: string;
  createdAt: string | Date;
  clientRequestId?: string | null;
}

export type CriticalFlagType =
  | 'FABRICATED_EVIDENCE'
  | 'UNAUTHORIZED_MATERIAL_PROMISE'
  | 'EXPOSED_CONFIDENTIAL_INFO';

export interface CriticalFlag {
  type: CriticalFlagType;
  reason: string;
  resolved: boolean;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface CriterionScoreResult {
  criterionKey: RubricCriterionKey;
  criterionLabel: string;
  assessmentStatus: 'SCORED' | 'NOT_ASSESSED';
  score: 0 | 1 | 2 | null;
  isApplicable: boolean;
  observedEvidence: string;
  omissionReason?: string | null;
  notAssessedReason?: string | null;
  quotedTurnIds: string[];
  reasoning: string;
  evidenceSufficiency: 'NOT_ASSESSED' | 'EMERGING_EVIDENCE' | 'DEMONSTRATED';
}

export interface EvaluationResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  passedThreshold: boolean;
  objectiveOutcome: string;
  strongestBehaviour: string;
  prioritisedCorrection: string;
  evidenceForCorrection: string;
  improvedResponseExample: string;
  followUpExerciseSuggestion?: string | null;
  criticalFlags: CriticalFlag[];
  hasUnresolvedCriticalFlag: boolean;
  criterionScores: CriterionScoreResult[];
  evidenceSnapshotId?: string | null;
}

export interface ComparableTrendSummary {
  status: 'BUILDING_BASELINE' | 'COMPARABLE_TREND_AVAILABLE';
  totalEligibleAttempts: number;
  requiredForBaseline: number;
  latest5Average?: number;
  preceding5Average?: number;
  delta?: number;
  isImproving?: boolean;
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
  byCriterion?: {
    criterionKey: RubricCriterionKey;
    label: string;
    latestAvg: number;
    precedingAvg: number;
    delta: number;
  }[];
}
