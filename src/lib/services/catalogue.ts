/**
 * Closecraft Service Catalogue
 *
 * Configurable catalogue for:
 * 1. Individual sales training through Digital Sales School (DSS)
 * 2. Training for business sales teams
 * 3. Managed sales engagements
 * 4. External appointment setters
 * 5. External sales closers
 *
 * Availability states:
 * - AVAILABLE: Approved offer with published terms and active enrolment/checkout route.
 * - ASSESSMENT_REQUIRED: Requires commercial qualification and readiness review before quote.
 * - UNAVAILABLE: Currently waitlisted or paused for operational capacity.
 */

export type ServiceAvailability = 'AVAILABLE' | 'ASSESSMENT_REQUIRED' | 'UNAVAILABLE';

export type PricingMethod = 
  | 'FIXED_PER_LEARNER'
  | 'SCOPED_PROPOSAL'
  | 'FIXED_PLUS_MANAGEMENT'
  | 'HOURLY_BENCHMARK'
  | 'PERFORMANCE_HYBRID';

export interface CatalogueServiceItem {
  id: string;
  key: 'INDIVIDUAL_TRAINING' | 'TEAM_TRAINING' | 'MANAGED_SALES' | 'EXTERNAL_SETTING' | 'EXTERNAL_CLOSING' | 'MANAGED_LEAD_GENERATION';
  name: string;
  category: 'TRAINING' | 'SALES_SERVICES';
  description: string;
  scopeSummary: string;
  eligibilityRequirements: string[];
  availability: ServiceAvailability;
  pricingMethod: PricingMethod;
  pricingDisplay: string;
  currency: string;
  enquiryRoute: string;
  purchaseRoute?: string;
  tasksIncluded: string[];
  tasksExcluded: string[];
}

export const SERVICE_CATALOGUE: CatalogueServiceItem[] = [
  {
    id: 'srv-ind-dss',
    key: 'INDIVIDUAL_TRAINING',
    name: 'Digital Sales School (DSS) Individual Sprint',
    category: 'TRAINING',
    description: 'Structured 4-week sales capability sprint for ambitious individuals and modern reps. Master objection handling, pipeline velocity, and commercial qualification using AI role-play and verifiable portfolio assessments.',
    scopeSummary: '4-week curriculum, AI Buyer role-play studio, weekly live clinics, graded portfolio assessments, and verifiable credential upon completion.',
    eligibilityRequirements: [
      'Basic English proficiency and digital communication competence',
      'Commitment of 6-8 hours weekly for lessons and practice sessions',
      'Device with audio and reliable internet connection for live clinics'
    ],
    availability: 'AVAILABLE',
    pricingMethod: 'FIXED_PER_LEARNER',
    pricingDisplay: '₦100,000 per learner (Early-bird / Standard pricing as configured)',
    currency: 'NGN',
    enquiryRoute: '/dss',
    purchaseRoute: '/dss/apply',
    tasksIncluded: [
      'Access to DSS Learning Management System & video curriculum',
      'Unlimited practice conversations in the AI Role-play Studio',
      'Weekly cohort live review sessions with certified instructors',
      'Verified competency scoring and artifact assessment'
    ],
    tasksExcluded: [
      'Guaranteed job placement or direct client allocation',
      'One-on-one personal career management',
      'Direct software deployment to private client workspaces'
    ]
  },
  {
    id: 'srv-team-training',
    key: 'TEAM_TRAINING',
    name: 'Business Sales Team Development',
    category: 'TRAINING',
    description: 'Customized cohort-based training for internal sales teams, SDRs, and account executives. Aligned directly to your company’s offer, objection profiles, and target customer dynamics.',
    scopeSummary: 'Tailored curriculum, team role-play scenarios based on your product offer, manager oversight dashboards, and aggregate competency benchmarks.',
    eligibilityRequirements: [
      'Active business workspace with 3 or more participating team members',
      'Designated team manager or authorized executive sponsor',
      'Approved sales brief or product collateral for scenario tailoring'
    ],
    availability: 'ASSESSMENT_REQUIRED',
    pricingMethod: 'SCOPED_PROPOSAL',
    pricingDisplay: 'Custom proposal based on team size, duration, and customization depth',
    currency: 'NGN',
    enquiryRoute: '/team/training',
    tasksIncluded: [
      'Tailored practice scenarios reflecting your specific buyer objections',
      'Manager portal tracking team participation and mastery metrics',
      'Anonymised call reviews and structured coaching recommendations',
      'Executive handover summary of team strengths and skill gaps'
    ],
    tasksExcluded: [
      'Public disclosure of private customer recordings or confidential IP',
      'Direct client execution or taking live prospect sales calls'
    ]
  },
  {
    id: 'srv-managed-sales',
    key: 'MANAGED_SALES',
    name: 'Closecraft Managed Follow-up Pilot (30 Days)',
    category: 'SALES_SERVICES',
    description: 'Turnkey sales execution pilot where Closecraft operators and vetted sales professionals work your inbound enquiries, follow up stalled leads, and book qualified pipeline inside your workspace.',
    scopeSummary: '30-day scoped pilot, dedicated follow-up execution, transparent activity logging, and weekly commercial review.',
    eligibilityRequirements: [
      'Legitimate, verifiable product or service with clear deliverables',
      'Minimum of 10-25 new enquiries or qualified conversations per month',
      'Documented pricing, refund policy, and accessible decision-maker',
      'Readiness assessment score >= 80% with approved sales materials'
    ],
    availability: 'ASSESSMENT_REQUIRED',
    pricingMethod: 'FIXED_PLUS_MANAGEMENT',
    pricingDisplay: '₦150,000 / month base + management fee (Detailed in scoped proposal)',
    currency: 'NGN',
    enquiryRoute: '/sales-support/request',
    tasksIncluded: [
      'Multi-channel enquiry triage (WhatsApp, Email, Phone) within agreed SLA',
      'Structured follow-up cadences on stalled and new opportunities',
      'Real-time activity logging and handover notes in your workspace CRM',
      'Weekly commercial progress and conversion bottleneck reviews'
    ],
    tasksExcluded: [
      'Unbounded outbound cold scraping or untargeted spam',
      'Unilateral authority to discount prices or alter product terms',
      'Guaranteed closed revenue numbers without historical conversion baselines'
    ]
  },
  {
    id: 'srv-ext-setting',
    key: 'EXTERNAL_SETTING',
    name: 'External Appointment Setting Engagement',
    category: 'SALES_SERVICES',
    description: 'Vetted, pre-trained sales development reps (SDRs) allocated to qualify incoming leads, run initial discovery, and schedule qualified sales appointments on your calendar.',
    scopeSummary: 'Dedicated setter capacity, defined lead qualification criteria (BANT/MEDDIC), calendar appointment booking, and daily activity tracking.',
    eligibilityRequirements: [
      'Inbound enquiry flow of at least 30 leads per month',
      'Clear definition of a qualified prospect (ICP)',
      'Connected calendar and defined appointment scheduling rules'
    ],
    availability: 'ASSESSMENT_REQUIRED',
    pricingMethod: 'SCOPED_PROPOSAL',
    pricingDisplay: 'Base capacity retainer + qualified appointment fee (Per accepted proposal)',
    currency: 'NGN',
    enquiryRoute: '/sales-support/request?type=SETTING',
    tasksIncluded: [
      'Rapid outreach to inbound enquiries within response windows',
      'Discovery qualification against your ideal customer profile (ICP)',
      'Booking confirmed calendar appointments with calendar invite and notes',
      'Daily activity logging and lead status updates'
    ],
    tasksExcluded: [
      'Conducting full commercial closing calls',
      'Contract drafting or negotiating complex enterprise MSAs'
    ]
  },
  {
    id: 'srv-ext-closing',
    key: 'EXTERNAL_CLOSING',
    name: 'External Sales Closing Engagement',
    category: 'SALES_SERVICES',
    description: 'Experienced, verified sales closers assigned to conduct high-stakes sales conversations, handle advanced commercial objections, and close deals on behalf of your business.',
    scopeSummary: 'Dedicated closer assignment, full discovery and demo calls, proposal delivery, objection resolution, and revenue tracking.',
    eligibilityRequirements: [
      'Internal screening guideline: Approximately 20+ qualified conversations per month',
      'Documented product value proposition and commercial terms',
      'Typical deal value >= ₦150,000 or annual contract value (ACV) equivalent'
    ],
    availability: 'ASSESSMENT_REQUIRED',
    pricingMethod: 'PERFORMANCE_HYBRID',
    pricingDisplay: 'Base engagement fee + agreed performance commission on collected revenue',
    currency: 'NGN',
    enquiryRoute: '/sales-support/request?type=CLOSING',
    tasksIncluded: [
      'Facilitating live discovery and closing conversations with qualified prospects',
      'Custom objection handling and value proposition reinforcement',
      'Closing deal documentation and follow-up until payment collection',
      'Pipeline stage updates and detailed opportunity audit notes'
    ],
    tasksExcluded: [
      'Cold lead generation or raw enquiry filtering',
      'Customer success onboarding or post-sale technical delivery',
      'Commission release before verified cash collection'
    ]
  },
  {
    id: 'srv-managed-lead-gen',
    key: 'MANAGED_LEAD_GENERATION',
    name: 'Managed Facebook & Instagram Lead Generation',
    category: 'SALES_SERVICES',
    description: 'Targeted paid advertising campaign setup and ongoing management on Facebook and Instagram, connected directly to your Closecraft follow-up workflow to convert attention into qualified conversations.',
    scopeSummary: '30-day pilot or ongoing management, campaign audience targeting, approved ad creative, lead form integration to Closecraft, and transparent weekly metric reviews.',
    eligibilityRequirements: [
      'Proven, verifiable product or service with past paying customer validation',
      'Dedicated advertising budget paid directly to Meta via your own ad account',
      'Assigned internal owner or Closecraft sales service to respond to leads within 1 hour',
      'Target gross profit per sale capable of sustaining advertising unit economics'
    ],
    availability: 'ASSESSMENT_REQUIRED',
    pricingMethod: 'SCOPED_PROPOSAL',
    pricingDisplay: 'Pilot setup + monthly management fee (Advertising budget paid directly to Meta)',
    currency: 'NGN',
    enquiryRoute: '/services/lead-generation',
    tasksIncluded: [
      'Audience targeting and campaign structure on Facebook and Instagram',
      'Ad creative drafting (copy, headlines, calls to action) for client review and approval',
      'Direct integration of Meta lead forms to Closecraft workspace or supported webhooks',
      'Transparent weekly performance reporting (ad spend, cost per enquiry, qualified rate)'
    ],
    tasksExcluded: [
      'Paying client advertising spend (ad spend is billed directly by Meta to client ad account)',
      'High-end custom video production or commercial photo shoots',
      'Guaranteed conversion rates or closed sales outcomes without follow-up control'
    ]
  }
];

export function getCatalogueService(key: string): CatalogueServiceItem | undefined {
  return SERVICE_CATALOGUE.find(s => s.key === key || s.id === key);
}

export function getServicesByCategory(category: 'TRAINING' | 'SALES_SERVICES'): CatalogueServiceItem[] {
  return SERVICE_CATALOGUE.filter(s => s.category === category);
}
