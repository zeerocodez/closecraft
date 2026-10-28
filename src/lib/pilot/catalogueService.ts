import { db } from '@/lib/db';

/**
 * MANAGED SERVICE CATALOGUE SERVICE
 * Provides versioned, scoped service package templates.
 * Explicitly defines activities included, strict exclusions,
 * capacity allowances, and commercial models.
 */

export const STANDARD_PACKAGES = [
  {
    packageType: 'ENQUIRY_RESPONSE',
    title: 'Closecraft Follow-up Pilot (30 Days)',
    description: 'A 30-day managed engagement helping your business work existing customer enquiries with clear accountability and visibility into the next action.',
    suitableCustomerSummary: 'Small service businesses and marketing agencies with recurring inbound enquiries where the founder shares sales responsibilities.',
    activitiesIncluded: JSON.stringify([
      'Fast enquiry triage and response within 1 hour',
      'Personalized WhatsApp and email outreach',
      'Objection handling based on approved brief',
      'Daily follow-up logging and Next Action scheduling',
    ]),
    activitiesExcluded: JSON.stringify([
      'Cold outbound scraping or spamming',
      'Unapproved discount promises',
      'Delivery fulfillment or post-sale project execution',
    ]),
    capacityBasis: 'HOURS',
    defaultCapacity: 40.0,
    coverageHours: 'Monday - Friday, 9am - 5pm WAT',
    responseExpectations: 'Within 1 hour during coverage',
    requiredClientInputs: 'Approved pricing guide, objection handbook, active business contact channel.',
    reviewCadence: 'Weekly Friday review call and daily work logs',
    commercialModel: 'FIXED_PLUS_MANAGEMENT',
    defaultBasePrice: 150000.0,
    currency: 'NGN',
    version: 1,
  },
  {
    packageType: 'APPOINTMENT_SETTING',
    title: 'B2B Qualification & Discovery Booking Pilot',
    description: 'Dedicated setter representation to qualify high-intent inbound leads and schedule discovery conversations directly onto your calendar.',
    suitableCustomerSummary: 'Consulting firms, software agencies, and high-ticket B2B service providers needing qualified discovery calls.',
    activitiesIncluded: JSON.stringify([
      'ICP qualification against custom tenant criteria',
      'Calendar booking and confirmation workflows',
      'Timezone alignment and meeting link distribution',
      'Setter-to-closer handover preparation',
    ]),
    activitiesExcluded: JSON.stringify([
      'Contract negotiation and pricing sign-off',
      'Guaranteed closed deals or attended show rate guarantees',
    ]),
    capacityBasis: 'HOURS',
    defaultCapacity: 50.0,
    coverageHours: 'Monday - Friday, 9am - 6pm WAT',
    responseExpectations: 'Within 30 minutes for hot intent signals',
    requiredClientInputs: 'Calendar integration links, qualifying question checklist, buyer persona guidelines.',
    reviewCadence: 'Bi-weekly pipeline review and daily appointment audit',
    commercialModel: 'FIXED_PLUS_MANAGEMENT',
    defaultBasePrice: 180000.0,
    currency: 'NGN',
    version: 1,
  },
  {
    packageType: 'SALES_CLOSING',
    title: 'Dedicated Remote Closer Representation',
    description: 'Experienced remote sales closer working active proposals, conducting negotiation calls, and managing closing cycles to confirmed client handover.',
    suitableCustomerSummary: 'Service businesses with steady inbound leads lacking senior closing bandwidth to convert proposals.',
    activitiesIncluded: JSON.stringify([
      'Discovery and proposal presentations',
      'Structured objection navigation and value alignment',
      'Commercial proposal delivery within approved parameters',
      'Structured post-sale handover and delivery owner briefing',
    ]),
    activitiesExcluded: JSON.stringify([
      'Unilateral price cuts below approved floor',
      'Binding delivery schedule promises without client approval',
    ]),
    capacityBasis: 'HOURS',
    defaultCapacity: 60.0,
    coverageHours: 'Flexible based on prospect appointments',
    responseExpectations: 'Same-day turnaround for proposal adjustments',
    requiredClientInputs: 'Proposal deck, deliverable scope template, rate card, margin minimums.',
    reviewCadence: 'Weekly deal inspection and win/loss analysis',
    commercialModel: 'FIXED_PLUS_MANAGEMENT',
    defaultBasePrice: 250000.0,
    currency: 'NGN',
    version: 1,
  }
];

export async function listServicePackages(organizationId?: string) {
  // Ensure default templates exist
  const existingCount = await db.servicePackage.count({
    where: { organizationId: null }
  });

  if (existingCount === 0) {
    for (const pkg of STANDARD_PACKAGES) {
      await db.servicePackage.create({ data: pkg });
    }
  }

  return await db.servicePackage.findMany({
    where: {
      OR: [
        { organizationId: null },
        ...(organizationId ? [{ organizationId }] : [])
      ],
      isActive: true,
    },
    orderBy: { defaultBasePrice: 'asc' }
  });
}

export async function getServicePackage(packageId: string) {
  return await db.servicePackage.findUnique({
    where: { id: packageId }
  });
}
