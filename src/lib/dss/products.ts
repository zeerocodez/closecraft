export type DSSProduct = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  priceNGN: number;
  priceUSD: number;
  priceKobo: number;
  savingsNGN?: number;
  savingsUSD?: number;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  duration: string;
  schedule: string;
  targetAudience: string;
  modulesIncluded: number[]; // module numbers (1-8)
  features: string[];
  deliverables: string[];
  certificationName: string;
  affiliateCommissionNGN: number;
  affiliateCommissionUSD: number;
};

export const DSS_PRODUCTS: DSSProduct[] = [
  {
    id: 'dss-setters-route',
    slug: 'dss-setters-route',
    title: 'Setters Route',
    shortTitle: 'Setters',
    tagline: 'Outbound Pipeline, Prospecting & Appointment Setting',
    description:
      'Master multi-channel outbound prospecting (WhatsApp, LinkedIn, Email), buyer qualification matrices, and calendar triage. Book high-intent qualified discovery calls into Closers’ pipelines.',
    priceNGN: 100000,
    priceUSD: 100,
    priceKobo: 10000000, // ₦100,000 in kobo
    badge: 'Pipeline Starter',
    isPopular: false,
    duration: '3 Weeks • Live Coaching & Exercises',
    schedule: 'Mondays & Wednesdays 7:00 PM - 8:30 PM WAT',
    targetAudience: 'Aspiring SDRs, BDRs, Appointment Setters, Lead Gen Freelancers & Founders wanting inbound/outbound pipeline flow.',
    modulesIncluded: [1, 2, 3],
    features: [
      'Modules 1 to 3 of the DSS Core Curriculum',
      'The Outbound Appointment Setting Master Playbook',
      '10 Battle-Tested Cold Outreach Templates (WhatsApp & LinkedIn)',
      'Scored Meeting-Booking Roleplay Evaluation with Feedback',
      'Closecraft Inbound & Outbound Pipeline Qualification Workspace',
      'Direct Setter Listing in Closecraft Talent Registry',
    ],
    deliverables: [
      'Calibrated 60-Second Value Pitch & Offer Factsheet',
      'Justified Buyer Profile (ICP) for 20 Researched Prospects',
      'Scored Meeting-Booking Audio/Text Roleplay Submission',
    ],
    certificationName: 'Certified High-Ticket Appointment Setter (DSS-SDR)',
    affiliateCommissionNGN: 35000, // 35%
    affiliateCommissionUSD: 35,
  },
  {
    id: 'dss-closers-route',
    slug: 'dss-closers-route',
    title: 'Closers Route',
    shortTitle: 'Closers',
    tagline: 'Diagnostic Discovery, High-Ticket Negotiation & Deal Closing',
    description:
      'Master diagnostic discovery calls, value framing, proposal engineering, and high-stakes negotiation. Turn hesitant, price-sensitive prospects into signed contracts and cleared payments.',
    priceNGN: 100000,
    priceUSD: 100,
    priceKobo: 10000000,
    badge: 'High-Ticket Specialist',
    isPopular: true,
    duration: '4 Weeks • Intensive Deal Closing',
    schedule: 'Mondays & Wednesdays 7:00 PM - 8:30 PM WAT',
    targetAudience: 'Remote Closers, B2B Founders, Agency Leaders, High-Ticket Consultants seeking deal-closing mastery.',
    modulesIncluded: [4, 5, 6, 7],
    features: [
      'Modules 4 to 7 of the DSS Core Curriculum',
      'The Million-Dollar Call Framework & Diagnostic Questioning Tree',
      'Objection Battlecard System ("Too Expensive", "Consult Partner", "Not Now")',
      'High-Ticket Proposal Architecture & Value Anchoring Strategy',
      'Authorized Negotiation & Payment Collection Procedures',
      'Closecraft AI CRM Opportunity & Follow-up Discipline Engine',
    ],
    deliverables: [
      'Observed Live Discovery Call Scored against DSS Rubric',
      'Bespoke High-Ticket Proposal Matched to Agreed Need',
      'Objection Response Battlecard & Negotiation Submission',
    ],
    certificationName: 'Certified High-Ticket Remote Closer (DSS-CHTC)',
    affiliateCommissionNGN: 35000, // 35%
    affiliateCommissionUSD: 35,
  },
  {
    id: 'dss-live-roleplay-internship',
    slug: 'dss-live-roleplay-internship',
    title: 'Live Role Plays & Internship Track',
    shortTitle: 'Live Role Plays / Internship',
    tagline: 'Live Buyer Sparring, Observed Rubrics & Deal Placement Engine',
    description:
      'Intensive live sparring with simulated complex and hostile buyer personas, observed and scored directly by Emmanuel Effiong. Direct placement into Closecraft live deal flow to work real sales opportunities and earn 10%-20% commissions.',
    priceNGN: 100000,
    priceUSD: 100,
    priceKobo: 10000000,
    badge: 'Direct Deal Placement',
    isPopular: false,
    duration: 'Intensive Practical Lab + Ongoing Placement',
    schedule: 'Weekly Observed Sparring Labs & Live Deal Reviews',
    targetAudience: 'Graduates, ambitious closers, and sales reps ready to close real deals with verified businesses for cash commissions.',
    modulesIncluded: [8],
    features: [
      'Unscripted Live Roleplay Sparring with simulated difficult buyers',
      'Direct Diagnostic Voice Feedback from Emmanuel Effiong & Senior Evaluators',
      'Comprehensive Rubric Scoring across Discovery, Objections & Closing',
      'Verified Practical Competency Portfolio for employers & clients',
      'Direct Placement Pipeline into Closecraft Live Revenue Opportunities',
      'Priority access to 10%-20% commission client sales assignments',
    ],
    deliverables: [
      'Full Unscripted Simulation Exam Scored under Observation',
      'Official DSS Competency Portfolio & Verified Credential Artifact',
      'Closecraft Live Closer Pool Activation & Deal Routing Qualification',
    ],
    certificationName: 'DSS Verified Deal Closer & Network Fellow (DSS-VDC)',
    affiliateCommissionNGN: 35000, // 35%
    affiliateCommissionUSD: 35,
  },
  {
    id: 'dss-both-routes',
    slug: 'dss-both-routes',
    title: 'Both Routes (Setters + Closers Mastery)',
    shortTitle: 'Both Routes (Bundle)',
    tagline: 'The Complete End-to-End Revenue Operating System (Save ₦50k / $50)',
    description:
      'The complete flagship sales academy curriculum. Covers the entire revenue lifecycle—from cold outreach and appointment setting all the way through to high-ticket discovery, negotiation, and closing.',
    priceNGN: 150000,
    priceUSD: 150,
    priceKobo: 15000000,
    savingsNGN: 50000,
    savingsUSD: 50,
    badge: 'Best Value • Full Academy',
    isBestValue: true,
    duration: '8 Weeks • Complete Flagship Immersion',
    schedule: 'Mondays & Wednesdays 7:00 PM - 8:30 PM WAT',
    targetAudience: 'Full-cycle sales professionals, agency founders, business owners, and closers wanting end-to-end dominance.',
    modulesIncluded: [1, 2, 3, 4, 5, 6, 7, 8],
    features: [
      'Complete Setters Curriculum (Modules 1, 2 & 3)',
      'Complete Closers Curriculum (Modules 4, 5, 6 & 7)',
      'Full 8-Week Immersion with All 16 Guided Lessons',
      'Student Study Edition Handbook & Practical Workbook (Digital)',
      'Closecraft AI CRM Sales Operating System Lifetime Trainee Access',
      'Dual Certification: Certified Setter + Certified High-Ticket Closer',
      'Save ₦50,000 / $50 compared to buying both routes separately',
    ],
    deliverables: [
      'Complete 8-Week Practical Submissions Portfolio',
      'Discovery, Outreach, Negotiation & Objection Battlecards',
      'Both Setter & Closer Digital Credentials with Verification URL',
    ],
    certificationName: 'Master Revenue Professional (DSS Dual Certification)',
    affiliateCommissionNGN: 52500, // 35% of ₦150,000
    affiliateCommissionUSD: 52.5,
  },
];

export function getDSSProduct(slug: string): DSSProduct | undefined {
  return DSS_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

export function formatPrice(amount: number, currency: 'NGN' | 'USD' = 'NGN'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  return `₦${amount.toLocaleString('en-NG')}`;
}
