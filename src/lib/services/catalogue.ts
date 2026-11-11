import { db } from '@/lib/db';

/**
 * Closecraft Service Catalogue (Legacy & CloseCraft 2.0 Unified)
 *
 * Configurable catalogue for:
 * 1. Individual sales training through Digital Sales School (DSS)
 * 2. Training for business sales teams
 * 3. Managed sales engagements
 * 4. External appointment setters
 * 5. External sales closers
 * 6. Managed lead generation
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
    scopeSummary: '30-day bounded engagement, designated sales professional, shared WhatsApp/email response windows, and weekly performance reviews.',
    eligibilityRequirements: [
      'Target gross profit margin and typical deal value sufficient to sustain managed sales unit economics',
      'Completed client onboarding and approved sales brief',
      'Willingness to review daily activity logs and respond to blocker flags within 24 hours'
    ],
    availability: 'ASSESSMENT_REQUIRED',
    pricingMethod: 'FIXED_PLUS_MANAGEMENT',
    pricingDisplay: '₦150,000 pilot fee for 30 days (Includes 40 hours of dedicated execution)',
    currency: 'NGN',
    enquiryRoute: '/sales-support/request',
    tasksIncluded: [
      'Rapid outreach to new inbound leads within agreed response windows (e.g., < 1 hour)',
      'Multi-touch follow-up on older or stalled pipeline leads',
      'Direct qualification against agreed customer profile criteria',
      'Booking qualified discovery calls or appointments on your calendar'
    ],
    tasksExcluded: [
      'Guaranteed sales volume or revenue quotas without qualification',
      'Unsupervised cold outbound spamming',
      'Legal contract drafting or payment collection guarantees'
    ]
  },
  {
    id: 'srv-ext-setting',
    key: 'EXTERNAL_SETTING',
    name: 'Dedicated Appointment Setting Service',
    category: 'SALES_SERVICES',
    description: 'Vetted, trained remote sales representatives who handle initial touchpoints, qualify leads, run initial discovery, and schedule qualified sales appointments on your calendar.',
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
      'Advertising budget paid directly to Meta',
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

// -----------------------------------------------------------------------------
// CLOSECRAFT 2.0 DYNAMIC SERVICE MARKETPLACE & STANDARD PACKAGES
// -----------------------------------------------------------------------------

export interface StandardPackageDefinition {
  slug: string;
  category: 'LEAD_GENERATION' | 'LEAD_MANAGEMENT' | 'APPOINTMENT_SETTING' | 'SALES_CLOSING' | 'SALES_ENABLEMENT';
  packageType: string;
  title: string;
  description: string;
  suitableCustomerSummary: string;
  defaultBasePrice: number;
  currency: string;
  billingFrequency: 'MONTHLY' | 'ONE_TIME' | 'CUSTOM';
  slaDays: number;
  highlightFeature: string;
  coverageHours: string;
  responseExpectations: string;
  activitiesIncluded: string[];
  activitiesExcluded: string[];
  defaultCapacity: number;
  capacityBasis: 'HOURS' | 'OPPORTUNITIES' | 'CAMPAIGNS';
}

export const STANDARD_PACKAGES: StandardPackageDefinition[] = [
  // 1. LEAD GENERATION
  {
    slug: 'meta-ad-acquisition',
    category: 'LEAD_GENERATION',
    packageType: 'MANAGED_LEAD_GENERATION',
    title: 'Managed Facebook & Instagram Lead Generation',
    description: 'Full-funnel Meta advertising designed to capture verified business enquiries and route them instantly to your sales team. Learn more at /services/lead-generation.',
    suitableCustomerSummary: 'Businesses spending or planning to spend on Meta ads who need consistent inbound lead flow without creative fatigue.',
    defaultBasePrice: 180000.0,
    currency: 'NGN',
    billingFrequency: 'MONTHLY',
    slaDays: 3,
    highlightFeature: 'High-Converting Creative Testing & Direct Lead CRM Sync',
    coverageHours: 'Monday - Friday (Campaign Management)',
    responseExpectations: 'Campaign adjustments within 24 hours',
    defaultCapacity: 4.0,
    capacityBasis: 'CAMPAIGNS',
    activitiesIncluded: [
      'Campaign architecture & audience segmentation',
      '4 new ad creatives & copywriting variations every month',
      'Instant WhatsApp & Closecraft CRM lead ingestion',
      'Weekly spend & cost-per-lead optimization',
      'Custom retargeting audiences setup',
      'Bi-weekly performance review report'
    ],
    activitiesExcluded: [
      'Advertising budget paid directly to Meta',
      'Video production / custom studio shoot',
      'Unrelated social media organic posting'
    ]
  },
  {
    slug: 'google-search-funnel',
    category: 'LEAD_GENERATION',
    packageType: 'MANAGED_LEAD_GENERATION',
    title: 'Google Search & High-Intent Funnel',
    description: 'Capture active buyers searching for your specific products and services on Google Search with high-intent landing funnels.',
    suitableCustomerSummary: 'B2B and high-ticket service companies whose customers actively search on Google for solutions.',
    defaultBasePrice: 220000.0,
    currency: 'NGN',
    billingFrequency: 'MONTHLY',
    slaDays: 4,
    highlightFeature: 'Intent-Targeted Search Ads & Conversion Tracking',
    coverageHours: 'Monday - Friday 9am - 5pm WAT',
    responseExpectations: 'Keyword negative matching & bid reviews 3x weekly',
    defaultCapacity: 2.0,
    capacityBasis: 'CAMPAIGNS',
    activitiesIncluded: [
      'Commercial-intent keyword research & clustering',
      'Negative keyword list buildout to prevent wasted spend',
      'High-converting landing page lead capture setup',
      'Google Tag Manager conversion tracking verification',
      'Weekly bid adjustments & search term audits'
    ],
    activitiesExcluded: [
      'Direct ad spend budget payable to Google',
      'Broad SEO link building or external PR'
    ]
  },

  // 2. LEAD MANAGEMENT
  {
    slug: 'crm-automated-followup',
    category: 'LEAD_MANAGEMENT',
    packageType: 'ENQUIRY_RESPONSE',
    title: 'Omnichannel CRM Setup & Automated Follow-Up',
    description: 'Stop lead leakage. Automatically capture, score, and nurture every incoming enquiry with 15-minute response automations.',
    suitableCustomerSummary: 'Businesses receiving 30+ enquiries a month who lose sales due to delayed replies or forgotten follow-ups.',
    defaultBasePrice: 120000.0,
    currency: 'NGN',
    billingFrequency: 'MONTHLY',
    slaDays: 2,
    highlightFeature: '15-Minute Automated Response & WhatsApp Follow-ups',
    coverageHours: '24/7 Automated Delivery',
    responseExpectations: 'Instant automated lead acknowledgment (< 2 mins)',
    defaultCapacity: 1000.0,
    capacityBasis: 'OPPORTUNITIES',
    activitiesIncluded: [
      'Multi-channel enquiry capture (Website, WhatsApp, Meta, Forms)',
      'Automated Day 0, Day 2, Day 4 follow-up sequences',
      'Closecraft pipeline configuration with SLA warnings',
      'Lost enquiry reactivation campaign setup',
      'Weekly revenue leakage audit'
    ],
    activitiesExcluded: [
      'Manual outbound telemarketing',
      'Custom bespoke software code development'
    ]
  },

  // 3. APPOINTMENT SETTING
  {
    slug: 'remote-appointment-setting',
    category: 'APPOINTMENT_SETTING',
    packageType: 'APPOINTMENT_SETTING',
    title: 'Dedicated Remote Appointment Setting',
    description: 'Trained appointment setters qualify inbound prospects, answer early questions, and book qualified meetings directly on your calendar.',
    suitableCustomerSummary: 'Sales leaders and founders who spend too much time chasing unresponsive leads instead of conducting sales meetings.',
    defaultBasePrice: 150000.0,
    currency: 'NGN',
    billingFrequency: 'MONTHLY',
    slaDays: 2,
    highlightFeature: 'Guaranteed 30-Minute Qualification SLA & Calendar Sync',
    coverageHours: 'Monday - Friday 9am - 5pm WAT',
    responseExpectations: 'First contact attempt within 30 minutes of lead arrival',
    defaultCapacity: 50.0,
    capacityBasis: 'HOURS',
    activitiesIncluded: [
      'Inbound qualification via WhatsApp, Email & Phone',
      'Multi-touch follow-up on unresponsive leads (up to 5 attempts)',
      'Direct Google / Outlook Calendar booking with calendar invites',
      'Pre-meeting reminder dispatch to maximize show-up rates',
      'Daily asynchronous log of booking outcomes'
    ],
    activitiesExcluded: [
      'Conducting final closing or pricing negotiations',
      'Cold scraping of unconsented phone lists'
    ]
  },

  // 4. SALES CLOSING
  {
    slug: 'high-ticket-sales-closing',
    category: 'SALES_CLOSING',
    packageType: 'SALES_CLOSING',
    title: 'High-Ticket Remote Sales Closing',
    description: 'Elite remote sales professionals who step in to conduct discovery calls, present commercial proposals, and close high-value deals.',
    suitableCustomerSummary: 'Companies selling high-ticket services (₦300k - ₦5M+) needing experienced closers without full-time hiring overhead.',
    defaultBasePrice: 250000.0,
    currency: 'NGN',
    billingFrequency: 'MONTHLY',
    slaDays: 3,
    highlightFeature: 'Professional Deal Closing & Pipeline Negotiation',
    coverageHours: 'Monday - Friday (Flexible Client Meeting Hours)',
    responseExpectations: 'Proposal turnaround within 24 hours of discovery call',
    defaultCapacity: 30.0,
    capacityBasis: 'OPPORTUNITIES',
    activitiesIncluded: [
      'Discovery & qualification calls with prospective clients',
      'Tailored commercial proposal delivery & negotiation',
      'Objection handling and multi-stakeholder follow-through',
      'Pipeline stage updates & CRM closing attribution',
      'Weekly pipeline review and deal win/loss analysis'
    ],
    activitiesExcluded: [
      'Outbound cold calling without qualified interest',
      'Legal contract authoring or credit financing underwriting'
    ]
  },

  // 5. SALES ENABLEMENT
  {
    slug: 'dss-team-enablement',
    category: 'SALES_ENABLEMENT',
    packageType: 'TEAM_TRAINING',
    title: 'DSS Sales Team Enablement & Playbooks',
    description: 'Transform your internal team with Digital Sales School battle-tested playbooks, objection frameworks, and AI buyer role-play drills.',
    suitableCustomerSummary: 'Teams of 2 to 15 sales reps who need standardized objection handling, higher conversion rates, and accountable practice.',
    defaultBasePrice: 160000.0,
    currency: 'NGN',
    billingFrequency: 'MONTHLY',
    slaDays: 2,
    highlightFeature: 'Tailored Sales Playbook & AI Buyer Simulation Drills',
    coverageHours: 'Self-paced 24/7 drills + Weekly Trainer Review',
    responseExpectations: 'Roleplay scenario feedback within 48 hours',
    defaultCapacity: 5.0,
    capacityBasis: 'HOURS',
    activitiesIncluded: [
      'Custom company Sales Playbook & Objection Battlecards',
      '5 seats on Digital Sales School Practice Studio & AI Buyer drills',
      'Weekly asynchronous roleplay evaluation & rubric scoring',
      'Monthly sales competence and conversion gap assessment',
      'Official Closecraft Competency certification for passing reps'
    ],
    activitiesExcluded: [
      'On-site in-person classroom travel',
      'Guaranteeing individual employee performance without practice completion'
    ]
  }
];

/**
 * Ensures standard platform packages exist in the database.
 * Idempotent: creates missing packages, leaves existing customized packages intact.
 */
export async function ensureStandardPackages(): Promise<any[]> {
  try {
    for (const pkg of STANDARD_PACKAGES) {
      await db.servicePackage.upsert({
        where: { slug: pkg.slug },
        update: {
          title: pkg.title,
          description: pkg.description,
          category: pkg.category,
          suitableCustomerSummary: pkg.suitableCustomerSummary,
          defaultBasePrice: pkg.defaultBasePrice,
          currency: pkg.currency,
          billingFrequency: pkg.billingFrequency,
          slaDays: pkg.slaDays,
          highlightFeature: pkg.highlightFeature,
          coverageHours: pkg.coverageHours,
          responseExpectations: pkg.responseExpectations,
          activitiesIncluded: JSON.stringify(pkg.activitiesIncluded),
          activitiesExcluded: JSON.stringify(pkg.activitiesExcluded),
          defaultCapacity: pkg.defaultCapacity,
          capacityBasis: pkg.capacityBasis,
          isActive: true,
        },
        create: {
          slug: pkg.slug,
          category: pkg.category,
          packageType: pkg.packageType,
          title: pkg.title,
          description: pkg.description,
          suitableCustomerSummary: pkg.suitableCustomerSummary,
          defaultBasePrice: pkg.defaultBasePrice,
          currency: pkg.currency,
          billingFrequency: pkg.billingFrequency,
          slaDays: pkg.slaDays,
          highlightFeature: pkg.highlightFeature,
          coverageHours: pkg.coverageHours,
          responseExpectations: pkg.responseExpectations,
          activitiesIncluded: JSON.stringify(pkg.activitiesIncluded),
          activitiesExcluded: JSON.stringify(pkg.activitiesExcluded),
          defaultCapacity: pkg.defaultCapacity,
          capacityBasis: pkg.capacityBasis,
          isActive: true,
        }
      });
    }

    return await db.servicePackage.findMany({
      where: { isActive: true },
      orderBy: { defaultBasePrice: 'asc' }
    });
  } catch (error) {
    console.error('[Service Catalogue] Failed to ensure standard packages:', error);
    return [];
  }
}

/**
 * Retrieves all active service packages from database, grouping by category.
 */
export async function getServiceCatalogue() {
  let packages = await db.servicePackage.findMany({
    where: { isActive: true },
    orderBy: { defaultBasePrice: 'asc' }
  });

  if (packages.length === 0) {
    packages = await ensureStandardPackages();
  }

  return packages.map((pkg: any) => ({
    ...pkg,
    activitiesIncluded: typeof pkg.activitiesIncluded === 'string' 
      ? JSON.parse(pkg.activitiesIncluded || '[]') 
      : (pkg.activitiesIncluded || []),
    activitiesExcluded: typeof pkg.activitiesExcluded === 'string' 
      ? JSON.parse(pkg.activitiesExcluded || '[]') 
      : (pkg.activitiesExcluded || []),
  }));
}
