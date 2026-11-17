export type CurrencyCode = 'NGN' | 'USD' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToNGN: number; // e.g. 1 USD = 1500 NGN
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    rateToNGN: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateToNGN: 1500,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateToNGN: 1900,
  },
};

export function formatCurrencyAmount(amountInNGN: number, currency: CurrencyCode = 'NGN'): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.NGN;
  const converted = Math.round(amountInNGN / config.rateToNGN);

  if (currency === 'NGN') {
    return `₦${converted.toLocaleString('en-NG')}`;
  } else if (currency === 'USD') {
    return `$${converted.toLocaleString('en-US')}`;
  } else {
    return `£${converted.toLocaleString('en-GB')}`;
  }
}

export interface ScorecardParams {
  leadVolume?: string;
  dealValue?: string;
  bottleneck?: string;
  currentTool?: string;
  responseTime?: string;
  businessName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface StageHealthStatus {
  stageNumber: string;
  stageName: string;
  status: 'HEALTHY' | 'MODERATE_FRICTION' | 'CRITICAL_LEAK';
  score: number;
  insight: string;
}

export interface ScorecardReport {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  gradeTitle: string;
  gradeDescription: string;
  monthlyLeakNGN: number;
  annualLeakNGN: number;
  stageBreakdown: StageHealthStatus[];
  prescribedInterventions: {
    title: string;
    description: string;
    targetStage: string;
  }[];
}

export function computeDiagnosticScorecard(params: ScorecardParams): ScorecardReport {
  let baseScore = 50;

  // 1. Tool friction penalty
  const tool = params.currentTool || '';
  if (tool.includes('NOTEPAD') || tool.includes('PAPER') || tool.includes('MEMORY')) {
    baseScore -= 20;
  } else if (tool.includes('SPREADSHEET') || tool.includes('EXCEL')) {
    baseScore -= 12;
  } else if (tool.includes('WHATSAPP_ONLY')) {
    baseScore -= 10;
  } else if (tool.includes('BASIC_CRM')) {
    baseScore += 5;
  }

  // 2. Response speed factor
  const speed = params.responseTime || '';
  if (speed === 'UNDER_15_MINS') {
    baseScore += 25;
  } else if (speed === 'HOURS_1_TO_4') {
    baseScore += 5;
  } else if (speed === 'HOURS_24_PLUS') {
    baseScore -= 15;
  } else if (speed === 'DAYS_LATER') {
    baseScore -= 25;
  }

  // 3. Bottleneck weighting
  const bottleneck = params.bottleneck || 'RESPONSE_LAG';
  if (bottleneck === 'RESPONSE_LAG') {
    baseScore -= 8;
  } else if (bottleneck === 'STALLED_PIPELINE') {
    baseScore -= 10;
  }

  // Clamp score between 18 and 92
  const score = Math.max(18, Math.min(92, Math.round(baseScore)));

  // Determine Grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'D';
  let gradeTitle = 'Critical Revenue Leakage';
  let gradeDescription = 'Enquiries are frequently neglected or delayed. Your business is losing high-intent buyers to faster competitors.';

  if (score >= 85) {
    grade = 'A';
    gradeTitle = 'High-Performance Revenue Loop';
    gradeDescription = 'Your team responds rapidly with strong follow-up discipline. Minor optimizations will drive maximum conversion.';
  } else if (score >= 70) {
    grade = 'B';
    gradeTitle = 'Moderate Follow-Up Friction';
    gradeDescription = 'Leads are captured but lack strict SLA countdowns and clear Next Best Action guidance.';
  } else if (score >= 50) {
    grade = 'C';
    gradeTitle = 'Substantial Pipeline Leakage';
    gradeDescription = 'Callbacks are missed in spreadsheets and scattered WhatsApp chats. Substantial revenue is slipping through the cracks.';
  } else if (score >= 30) {
    grade = 'D';
    gradeTitle = 'Critical Revenue Leakage';
    gradeDescription = 'Enquiries frequently go cold without consistent follow-up. Advertising spend is being wasted on uncontacted leads.';
  } else {
    grade = 'F';
    gradeTitle = 'Severe Follow-Up Breakdown';
    gradeDescription = 'No systematic follow-up process exists. Buyers are forced to chase your team, leading to massive lost sales.';
  }

  // Compute Leakage
  let monthlyLeak = 750000;
  const vol = params.leadVolume || '';
  const val = params.dealValue || '';

  if (vol.includes('500') || vol === 'OVER_500') {
    monthlyLeak = 4500000;
  } else if (vol.includes('200') || vol === '200_TO_500') {
    monthlyLeak = 2200000;
  } else if (vol.includes('50') || vol === '50_TO_200') {
    monthlyLeak = 1100000;
  }

  if (val.includes('1M') || val === 'OVER_1M') {
    monthlyLeak = Math.round(monthlyLeak * 2.2);
  } else if (val.includes('250K') || val === '250K_TO_1M') {
    monthlyLeak = Math.round(monthlyLeak * 1.5);
  }

  // Adjust by score factor
  const leakFactor = (100 - score) / 50;
  const monthlyLeakNGN = Math.round(monthlyLeak * leakFactor);
  const annualLeakNGN = monthlyLeakNGN * 12;

  // 4-Stage Breakdown
  const stageBreakdown: StageHealthStatus[] = [
    {
      stageNumber: '01',
      stageName: 'ATTRACT',
      status: bottleneck === 'LACK_OF_LEADS' ? 'CRITICAL_LEAK' : 'HEALTHY',
      score: bottleneck === 'LACK_OF_LEADS' ? 35 : 82,
      insight: bottleneck === 'LACK_OF_LEADS'
        ? 'Inbound interest is inconsistent. Needs high-converting Meta ads and direct-response creative assets.'
        : 'Sufficient lead volume generated from existing marketing channels.',
    },
    {
      stageNumber: '02',
      stageName: 'CAPTURE & RESPOND',
      status: bottleneck === 'RESPONSE_LAG' || speed === 'HOURS_24_PLUS' || speed === 'DAYS_LATER' ? 'CRITICAL_LEAK' : 'MODERATE_FRICTION',
      score: bottleneck === 'RESPONSE_LAG' ? 28 : (speed === 'UNDER_15_MINS' ? 88 : 58),
      insight: bottleneck === 'RESPONSE_LAG'
        ? 'Enquiries sit unacknowledged for hours in personal WhatsApp DMs. Immediate SLA timers needed.'
        : 'Inquiries are received but require centralized team notification.',
    },
    {
      stageNumber: '03',
      stageName: 'FOLLOW UP & CONVERT',
      status: bottleneck === 'STALLED_PIPELINE' || tool.includes('SPREADSHEET') ? 'CRITICAL_LEAK' : 'MODERATE_FRICTION',
      score: bottleneck === 'STALLED_PIPELINE' ? 32 : 62,
      insight: bottleneck === 'STALLED_PIPELINE'
        ? 'Reps forget callbacks and rely on memory. Sales pipeline lacks deterministic Next Best Action.'
        : 'Pipeline tracking needs automated reminders to prevent deals from cooling down.',
    },
    {
      stageNumber: '04',
      stageName: 'BUILD SALES CAPABILITY',
      status: bottleneck === 'SALES_SKILLS' ? 'CRITICAL_LEAK' : 'HEALTHY',
      score: bottleneck === 'SALES_SKILLS' ? 40 : 75,
      insight: bottleneck === 'SALES_SKILLS'
        ? 'Sales team struggles with price objections and closing. Practical roleplay practice required.'
        : 'Team closing capability is adequate; primary issue is follow-up consistency.',
    },
  ];

  // Prescribed Interventions
  const prescribedInterventions = [
    {
      title: 'Multichannel Unified Inbox & Instant Routing',
      description: 'Connect WhatsApp, Meta lead ads, and website web forms to eliminate forgotten enquiries on individual phones.',
      targetStage: '02. CAPTURE & RESPOND',
    },
    {
      title: 'Strict Response SLA Timers (15m Threshold)',
      description: 'Enforce real-time countdown alerts for your reps before high-intent buyers go cold.',
      targetStage: '02. CAPTURE & RESPOND',
    },
    {
      title: 'Visual Pipeline & Deterministic Next Best Action',
      description: 'Replace spreadsheets with an accountable Kanban workflow recommending whether to Respond, Escalate, or Wait.',
      targetStage: '03. FOLLOW UP & CONVERT',
    },
  ];

  return {
    score,
    grade,
    gradeTitle,
    gradeDescription,
    monthlyLeakNGN,
    annualLeakNGN,
    stageBreakdown,
    prescribedInterventions,
  };
}

