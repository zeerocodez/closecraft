export type SprintWorkshop = {
  workshopNumber: number;
  lessons: string;
  focus: string;
  week: number;
  liveHours: number;
  guidedHours: number;
  overview: string;
  publicOutcomes: string[];
  deliverableEvidence: string;
  assessedCriteria: string[];
};

export type SprintWeek = {
  weekNumber: number;
  title: string;
  copy: string;
  evidence: string;
  workshops: number[];
};

export type RubricCriterion = {
  id: string;
  name: string;
  maxPoints: number;
  scoringGuide: {
    zero: string;
    one: string;
    two: string;
  };
};

export const DSS_SPRINT_FACTS = {
  programmeName: 'DSS Four-Week Remote Sales Sprint',
  schoolName: 'Digital Sales School',
  platformRelationship: 'Powered by Closecraft',
  teachingWeeks: 4,
  workshopsCount: 12,
  originalTopicsCount: 24,
  liveHoursPerWorkshop: 3,
  breaksPerWorkshop: 'Two 10-minute breaks',
  guidedHoursPerWorkshop: 4,
  totalScheduledLiveHours: 36,
  totalGuidedHours: 48,
  totalHours: 84,
  hoursPerWeek: 21,
  trainersCount: 3,
  deliveryFormat: 'Virtual live delivery',
  assessmentFormat: 'A connected portfolio and final assessed demonstration',
  rubricThreshold: 12,
  rubricMax: 16,
  knowledgeCheckThreshold: 8,
  knowledgeCheckMax: 10,
};

export const SPRINT_WEEKS: SprintWeek[] = [
  {
    weekNumber: 1,
    title: 'Understand the offer and start relevant conversations.',
    copy: 'Learn role boundaries and offer accuracy, then research suitable buyers. Build a usable prospect tracker and write opening messages grounded in what you can verify.',
    evidence: 'Your work includes an offer brief and buyer research, alongside a prospect tracker and personalised openings.',
    workshops: [1, 2, 3],
  },
  {
    weekNumber: 2,
    title: 'Follow up, qualify and investigate the real need.',
    copy: 'Build follow-up that adapts to the buyer\'s response. Practise qualification and appointment handoffs, then use discovery to prepare a relevant recommendation.',
    evidence: 'Save qualification records and meeting confirmations, with corrected discovery notes and a recommendation.',
    workshops: [4, 5, 6],
  },
  {
    weekNumber: 3,
    title: 'Work through buying decisions and keep the pipeline accurate.',
    copy: 'Identify decision-makers and diagnose objections. Practise authorised negotiation and proposal writing, then review pipeline records and performance calculations.',
    evidence: 'Create a decision map and consistent proposal, supported by an audited pipeline and weekly report.',
    workshops: [7, 8, 9],
  },
  {
    weekNumber: 4,
    title: 'Prepare your portfolio and demonstrate your judgement.',
    copy: 'Work on onboarding and dependable remote communication. Review AI-assisted drafts, prepare your route-specific portfolio and complete an assessed capstone.',
    evidence: 'Submit a connected portfolio and final demonstration, with an improvement plan based on feedback.',
    workshops: [10, 11, 12],
  },
];

export const SPRINT_WORKSHOPS: SprintWorkshop[] = [
  {
    workshopNumber: 1,
    lessons: '01–03',
    focus: 'Professional foundations and offer accuracy',
    week: 1,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Establish sales professional role boundaries, deconstruct high-ticket commercial offers, and extract accurate claims from verified product documentation.',
    publicOutcomes: [
      'Define clear professional boundaries for appointment setters and remote closers.',
      'Analyse a B2B offer structure and identify verifiable deliverables.',
      'Draft a calibrated 60-second value summary grounded strictly in approved offer facts.',
    ],
    deliverableEvidence: 'Offer brief and value proposition summary.',
    assessedCriteria: ['Offer accuracy', 'Buyer fit'],
  },
  {
    workshopNumber: 2,
    lessons: '04–06',
    focus: 'Buyer research and commercial value',
    week: 1,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Research executive stakeholders, quantify the commercial cost of inaction, and construct justified buyer profiles without reliance on ungrounded assumptions.',
    publicOutcomes: [
      'Identify target decision-makers using observable company signals.',
      'Calculate potential commercial impact and financial risk of inaction.',
      'Construct a justified ideal customer profile (ICP) based on verified data points.',
    ],
    deliverableEvidence: 'Justified buyer profile and commercial value map.',
    assessedCriteria: ['Buyer fit', 'Value explanation'],
  },
  {
    workshopNumber: 3,
    lessons: '07–08',
    focus: 'Prospect pipeline and relevant openings',
    week: 1,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Establish a working prospect tracker and compose personalised, pattern-interrupt outreach messages across email, LinkedIn, and WhatsApp.',
    publicOutcomes: [
      'Build an operational multi-channel prospect tracking workspace.',
      'Write opening messages that reference verifiable prospect observations.',
      'Eliminate spammy, low-response generic templates from outreach sequences.',
    ],
    deliverableEvidence: 'Prospect tracker setup and 5 personalised outreach messages.',
    assessedCriteria: ['Buyer fit', 'Records and handoff'],
  },
  {
    workshopNumber: 4,
    lessons: '09–10',
    focus: 'Adaptive follow-up and qualification',
    week: 2,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Design responsive follow-up sequences that adapt to prospect signals, and qualify enquiries thoroughly across budget, authority, need, and timeline.',
    publicOutcomes: [
      'Build multi-touch follow-up sequences that adapt to positive, neutral, or delayed responses.',
      'Execute structured qualification without interrogating or alienating prospects.',
      'Document qualification criteria systematically before committing sales time.',
    ],
    deliverableEvidence: 'Qualification records and adaptive follow-up cadences.',
    assessedCriteria: ['Discovery', 'Records and handoff'],
  },
  {
    workshopNumber: 5,
    lessons: '11–12',
    focus: 'Appointments and listening-led discovery',
    week: 2,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Arrange high-integrity meetings with clear context and conduct diagnostic, listening-led discovery conversations that uncover root business challenges.',
    publicOutcomes: [
      'Confirm appointments with clear meeting agendas and qualified context.',
      'Lead discovery conversations using structured diagnostic questioning trees.',
      'Practise active listening to surface underlying buyer tension and unstated priorities.',
    ],
    deliverableEvidence: 'Meeting confirmation records and structured discovery question plan.',
    assessedCriteria: ['Discovery', 'Listening'],
  },
  {
    workshopNumber: 6,
    lessons: '13–14',
    focus: 'Diagnosis and a relevant recommendation',
    week: 2,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Synthesise discovery notes into a precise diagnosis, and present a targeted commercial recommendation directly linked to the buyer\'s confirmed statements.',
    publicOutcomes: [
      'Synthesise complex discovery findings into an accurate root-cause diagnosis.',
      'Frame solution recommendations strictly around the buyer’s stated priorities.',
      'Avoid premature solution pitching before mutual agreement on the problem.',
    ],
    deliverableEvidence: 'Corrected discovery notes and solution recommendation brief.',
    assessedCriteria: ['Listening', 'Value explanation'],
  },
  {
    workshopNumber: 7,
    lessons: '15–16',
    focus: 'Buying groups and objection diagnosis',
    week: 3,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Navigate multi-stakeholder buying committees and diagnose the underlying root causes of objections rather than responding with defensive scripted rebuttals.',
    publicOutcomes: [
      'Map multi-stakeholder dynamics, hidden gatekeepers, and economic decision-makers.',
      'Isolate real objections (budget, timing, trust, authority) from polite brush-offs.',
      'Maintain conversational composure and tension control during pushback.',
    ],
    deliverableEvidence: 'Stakeholder decision map and objection diagnosis battlecards.',
    assessedCriteria: ['Objection diagnosis', 'Listening'],
  },
  {
    workshopNumber: 8,
    lessons: '17–18',
    focus: 'Negotiation and a documented decision',
    week: 3,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Conduct principled commercial negotiation within authorised boundaries, prevent unapproved discounting, and formalise binding agreements with clear next steps.',
    publicOutcomes: [
      'Negotiate terms and scope trade-offs without compromising baseline pricing.',
      'Structure high-integrity proposals that reinforce agreed commercial ROI.',
      'Secure explicit, documented buyer decisions and mutually agreed next actions.',
    ],
    deliverableEvidence: 'Consistent proposal document and agreed decision record.',
    assessedCriteria: ['Value explanation', 'Decision and terms'],
  },
  {
    workshopNumber: 9,
    lessons: '19–20',
    focus: 'Pipeline accuracy and performance improvement',
    week: 3,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Maintain audit-ready CRM pipeline data, compute key conversion metrics, identify revenue leakage points, and implement data-driven improvements.',
    publicOutcomes: [
      'Audit CRM pipeline records for data integrity and accurate opportunity stages.',
      'Calculate conversion velocity, deal stall rates, and win/loss ratios.',
      'Identify operational revenue leakage and establish daily follow-up discipline.',
    ],
    deliverableEvidence: 'Audited sales pipeline and weekly performance report.',
    assessedCriteria: ['Records and handoff', 'Offer accuracy'],
  },
  {
    workshopNumber: 10,
    lessons: '21–22',
    focus: 'Onboarding and dependable remote work',
    week: 4,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Execute a thorough customer handoff to delivery teams, establish professional remote work standards, and manage dependable asynchronous communications.',
    publicOutcomes: [
      'Prepare an accurate client onboarding handover without loss of discovery context.',
      'Implement professional remote communication protocols and meeting summaries.',
      'Establish dependable accountability rhythms for remote sales environments.',
    ],
    deliverableEvidence: 'Customer onboarding handover checklist and communication log.',
    assessedCriteria: ['Records and handoff', 'Decision and terms'],
  },
  {
    workshopNumber: 11,
    lessons: '23',
    focus: 'Portfolio and route-specific implementation',
    week: 4,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Assemble and curate your connected work portfolio tailored to your chosen application route (Remote Sales Starter or Business Builder), and critically review AI-assisted drafts.',
    publicOutcomes: [
      'Compile four connected work samples into an employer- or client-ready portfolio.',
      'Review and refine AI-generated sales materials against authentic business standards.',
      'Tailor portfolio presentation to specific target sales opportunities or business growth goals.',
    ],
    deliverableEvidence: 'Route-specific work portfolio and self-evaluation submission.',
    assessedCriteria: ['Offer accuracy', 'Buyer fit', 'Records and handoff'],
  },
  {
    workshopNumber: 12,
    lessons: '24',
    focus: 'Capstone demonstration and next steps',
    week: 4,
    liveHours: 3,
    guidedHours: 4,
    overview: 'Complete the live integrated capstone demonstration assessed by authorised trainers against the 8-criterion rubric, and build a focused post-programme improvement plan.',
    publicOutcomes: [
      'Execute a live sales conversation demonstrating discovery, objection diagnosis, and terms.',
      'Receive structured rubric feedback identifying specific demonstrated strengths and corrections.',
      'Formulate a concrete, measurable 30-day post-programme sales implementation plan.',
    ],
    deliverableEvidence: 'Final capstone demonstration assessment and structured improvement plan.',
    assessedCriteria: [
      'Offer accuracy',
      'Buyer fit',
      'Discovery',
      'Listening',
      'Value explanation',
      'Objection diagnosis',
      'Decision and terms',
      'Records and handoff',
    ],
  },
];

export const SPRINT_RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'offer-accuracy',
    name: 'Offer accuracy',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Misrepresents deliverables, guarantees unapproved outcomes, or invents terms.',
      one: 'Generally accurate but occasionally vague or relies on unsupported assertions.',
      two: 'Strictly grounded in approved offer facts; precise deliverables and realistic boundaries.',
    },
  },
  {
    id: 'buyer-fit',
    name: 'Buyer fit',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Targets unsuitable prospects; ignores qualification criteria.',
      one: 'Applies basic fit checks but misses key red flags or organizational misalignment.',
      two: 'Accurately assesses fit against defined ICP; protects both buyer and company interests.',
    },
  },
  {
    id: 'discovery',
    name: 'Discovery',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Jumps straight into pitching; asks superficial or leading questions.',
      one: 'Asks standard questions but fails to probe deeper into root business issues.',
      two: 'Conducts thorough diagnostic discovery; surfaces commercial impact and decision context.',
    },
  },
  {
    id: 'listening',
    name: 'Listening',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Interrupts, talks over buyer, or ignores buyer responses.',
      one: 'Listens passively but does not incorporate buyer language into follow-up.',
      two: 'Practises active listening; reflects buyer phrases and validates concerns before responding.',
    },
  },
  {
    id: 'value-explanation',
    name: 'Value explanation',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Recites feature lists without connecting to buyer problems.',
      one: 'Explains value generally but lacks clear connection to buyer’s specific situation.',
      two: 'Articulates commercial ROI and transformation directly tied to buyer’s stated priorities.',
    },
  },
  {
    id: 'objection-diagnosis',
    name: 'Objection diagnosis',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Reacts defensively, argues, or immediately offers unapproved discounts.',
      one: 'Acknowledges objection but applies scripted rebuttals without uncovering root cause.',
      two: 'Calmly diagnoses underlying friction; isolates budget, timing, or authority with composure.',
    },
  },
  {
    id: 'decision-and-terms',
    name: 'Decision and terms',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Avoids asking for the decision or agrees to unapproved contractual concessions.',
      one: 'Attempts to close but leaves next steps ambiguous or fails to confirm mutual timeline.',
      two: 'Secures clear, explicit buyer decision; documents binding terms within authorised policy.',
    },
  },
  {
    id: 'records-and-handoff',
    name: 'Records and handoff',
    maxPoints: 2,
    scoringGuide: {
      zero: 'Incomplete or missing records; delivery team receives zero discovery context.',
      one: 'Basic notes recorded but lacks key decision details or actionable onboarding steps.',
      two: 'Comprehensive CRM hygiene, audited deal stages, and seamless client onboarding handover.',
    },
  },
];

export const SPRINT_PORTFOLIO_GROUPS = [
  {
    groupNumber: 1,
    title: 'Offer brief and buyer profile',
    description: 'Establish offer boundaries, verified claims, and a justified ideal customer profile grounded in real observations.',
  },
  {
    groupNumber: 2,
    title: 'Prospect tracker and outreach messages',
    description: 'An operational multi-channel tracking sheet paired with 5 personalized, pattern-interrupt outreach messages.',
  },
  {
    groupNumber: 3,
    title: 'Discovery notes and a consistent proposal',
    description: 'Actual diagnostic notes from structured buyer discovery paired with a consistent, value-anchored commercial proposal.',
  },
  {
    groupNumber: 4,
    title: 'Pipeline report and onboarding handover',
    description: 'An audited CRM pipeline and conversion report alongside a complete customer onboarding handoff checklist.',
  },
];

export type SprintCohortConfig = {
  cohortId?: string;
  programmeName: string;
  status: 'ACCEPTING_APPLICATIONS' | 'FULL' | 'CLOSED' | 'ENQUIRIES_ONLY';
  priceNGN: number | null; // Null if pending formal confirmation
  priceUSD: number | null; // Null if unconfigured
  startDate: string | null;
  applicationDeadline: string | null;
  workshopSchedule: string | null;
  timeZone: string;
  isFeeApproved: boolean;
  isDateConfirmed: boolean;
  unconfiguredFeeNotice: string;
  unconfiguredDateNotice: string;
};

// Trusted configuration source for the flagship sprint
export const DSS_FLAGSHIP_SPRINT_CONFIG: SprintCohortConfig = {
  programmeName: 'DSS Four-Week Remote Sales Sprint',
  status: 'ACCEPTING_APPLICATIONS',
  // Per instruction: Sprint materials list NGN 50,000 as a tuition ASSUMPTION.
  // Do NOT automatically publish that amount. If no approved sprint price exists,
  // show "Request the current cohort fee and schedule." and disable payment initiation.
  priceNGN: null,
  priceUSD: null,
  startDate: null,
  applicationDeadline: null,
  workshopSchedule: '3 live workshops per week (3 hours each with two 10-minute breaks)',
  timeZone: 'West Africa Time (WAT) / GMT+1',
  isFeeApproved: false,
  isDateConfirmed: false,
  unconfiguredFeeNotice: 'Request the current cohort fee and schedule.',
  unconfiguredDateNotice: 'Get Next Cohort Details',
};
