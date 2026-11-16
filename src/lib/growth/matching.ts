import { db } from '@/lib/db';
import { GrowthServiceKey, buildWhatsAppConsultationLink } from '@/lib/growth/services';

export interface PartnerMatchResult {
  partnerId: string;
  fullName: string;
  email: string;
  phone: string | null;
  experienceSummary: string | null;
  weeklyAvailabilityHours: number;
  activeProjectLoad: number;
  availableCapacityHours: number;
  skillScore: number;       // 0 - 40
  capacityScore: number;    // 0 - 30
  qualityScore: number;     // 0 - 30
  compositeScore: number;   // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  recommendationTier: 'EXCELLENT' | 'STRONG' | 'VIABLE' | 'LOW';
}

export interface ProjectSlaStatus {
  projectRequestId: string;
  reference: string;
  businessName: string;
  createdAt: Date;
  elapsedMinutes: number;
  remainingMinutes: number;
  isBreached: boolean;
  slaBreachedAt: Date | null;
  status: string;
}

export interface SlaMonitorReport {
  totalPendingRequests: number;
  breachedCount: number;
  atRiskCount: number;     // Within 10 minutes of breach
  compliantCount: number;
  inspectedAt: Date;
  requests: ProjectSlaStatus[];
}

/**
 * Keyword patterns for matching growth services to professional skill profiles
 */
export const SERVICE_SKILL_PATTERNS: Record<GrowthServiceKey, string[]> = {
  ADS_MANAGEMENT: [
    'ads',
    'meta',
    'facebook',
    'instagram',
    'ppc',
    'paid acquisition',
    'traffic',
    'media buyer',
    'lead ads',
    'roas',
    'campaign',
  ],
  AI_FLYER_DESIGN: [
    'flyer',
    'graphic',
    'design',
    'creative',
    'visuals',
    'banner',
    'canva',
    'figma',
    'photoshop',
    'poster',
    'branding',
  ],
  AI_VIDEO_CREATION: [
    'video',
    'editing',
    'reels',
    'tiktok',
    'motion graphics',
    'scripting',
    'premiere',
    'capcut',
    'multimedia',
    'animation',
  ],
  LANDING_PAGE_DESIGN: [
    'landing page',
    'web design',
    'cro',
    'ui/ux',
    'frontend',
    'conversion',
    'html',
    'tailwind',
    'wordpress',
    'framer',
  ],
  VSL_DESIGN: [
    'vsl',
    'video sales letter',
    'copywriting',
    'direct response',
    'persuasion',
    'scriptwriting',
    'presentation',
    'slide deck',
    'offer creation',
  ],
};

/**
 * Matches and ranks vetted partners against a ProjectRequest's service requirements
 */
export async function rankEligiblePartnersForProject(
  projectRequestId: string
): Promise<PartnerMatchResult[]> {
  const projectRequest = await db.projectRequest.findUnique({
    where: { id: projectRequestId },
    include: { brief: true, requestedBy: true },
  });

  if (!projectRequest) {
    throw new Error(`Project request ${projectRequestId} not found.`);
  }

  const requestedServices = projectRequest.services as GrowthServiceKey[];
  if (!requestedServices || requestedServices.length === 0) {
    return [];
  }

  // Query vetted, active talent pool professionals
  const candidates = await db.professionalProfile.findMany({
    where: {
      status: 'ACTIVE',
      isPoolApproved: true,
    },
    include: {
      user: {
        include: {
          staffProfile: true,
        },
      },
      assignedProjects: {
        where: {
          status: {
            in: ['ASSIGNED', 'CONSULTING', 'IN_DELIVERY'],
          },
        },
        select: { id: true },
      },
      qualityReviews: {
        select: { judgmentScore: true },
        take: 10,
      },
    },
  });

  const ranked: PartnerMatchResult[] = candidates.map((cand) => {
    // 1. Text corpus for skill extraction
    const corpus = [
      cand.fullName,
      cand.bio || '',
      cand.experienceSummary || '',
      cand.simulatedPortfolioLabels || '',
      cand.user?.staffProfile?.skills.join(' ') || '',
      cand.user?.staffProfile?.role || '',
      cand.user?.staffProfile?.department || '',
    ]
      .join(' ')
      .toLowerCase();

    // 2. Evaluate skill matches per requested service
    const matchedServices: GrowthServiceKey[] = [];
    const missingServices: GrowthServiceKey[] = [];

    for (const serviceKey of requestedServices) {
      const patterns = SERVICE_SKILL_PATTERNS[serviceKey] || [];
      const hasMatch = patterns.some((p) => corpus.includes(p.toLowerCase()));
      if (hasMatch) {
        matchedServices.push(serviceKey);
      } else {
        missingServices.push(serviceKey);
      }
    }

    // Skill Score: Max 40 points
    const skillRatio = requestedServices.length > 0 ? matchedServices.length / requestedServices.length : 1;
    const skillScore = Math.round(skillRatio * 40);

    // 3. Capacity Score: Max 30 points
    // Assume each active project consumes 10 availability hours
    const activeLoad = cand.assignedProjects.length;
    const weeklyHours = cand.weeklyAvailabilityHours || 40;
    const estimatedUsedHours = activeLoad * 10;
    const availableHours = Math.max(0, weeklyHours - estimatedUsedHours);

    let capacityScore = 0;
    if (availableHours >= 30) {
      capacityScore = 30;
    } else if (availableHours >= 20) {
      capacityScore = 24;
    } else if (availableHours >= 10) {
      capacityScore = 16;
    } else if (availableHours > 0) {
      capacityScore = 8;
    } else {
      capacityScore = 2; // Near or at capacity
    }

    // 4. Quality Score: Max 30 points
    let qualityScore = 20; // Baseline for approved talent
    if (cand.qualityReviews.length > 0) {
      const avg =
        cand.qualityReviews.reduce((sum, r) => sum + r.judgmentScore, 0) / cand.qualityReviews.length;
      // Convert 1-10 scale to 0-30 scale
      qualityScore = Math.min(30, Math.round((avg / 10) * 30));
    }

    // Composite Score: 0 - 100
    const compositeScore = Math.min(100, skillScore + capacityScore + qualityScore);

    let recommendationTier: 'EXCELLENT' | 'STRONG' | 'VIABLE' | 'LOW' = 'LOW';
    if (compositeScore >= 80) recommendationTier = 'EXCELLENT';
    else if (compositeScore >= 65) recommendationTier = 'STRONG';
    else if (compositeScore >= 50) recommendationTier = 'VIABLE';

    return {
      partnerId: cand.id,
      fullName: cand.fullName,
      email: cand.email,
      phone: cand.phone,
      experienceSummary: cand.experienceSummary,
      weeklyAvailabilityHours: weeklyHours,
      activeProjectLoad: activeLoad,
      availableCapacityHours: availableHours,
      skillScore,
      capacityScore,
      qualityScore,
      compositeScore,
      matchedSkills: matchedServices,
      missingSkills: missingServices,
      recommendationTier,
    };
  });

  // Sort highest composite score first
  return ranked.sort((a, b) => b.compositeScore - a.compositeScore);
}

/**
 * Assigns an approved partner to a ProjectRequest with full audit trail and WhatsApp context update
 */
export async function assignPartnerToProjectRequest(params: {
  projectRequestId: string;
  partnerId: string;
  assignedByUserId: string;
  operatorNotes?: string;
}) {
  const { projectRequestId, partnerId, assignedByUserId, operatorNotes } = params;

  const projectRequest = await db.projectRequest.findUnique({
    where: { id: projectRequestId },
    include: { brief: true, requestedBy: true },
  });

  if (!projectRequest) {
    throw new Error(`Project request ${projectRequestId} not found.`);
  }

  const partner = await db.professionalProfile.findUnique({
    where: { id: partnerId },
  });

  if (!partner) {
    throw new Error(`Professional profile ${partnerId} not found.`);
  }

  if (!partner.isPoolApproved) {
    throw new Error(`Partner ${partner.fullName} is not approved in the talent pool.`);
  }

  // Update ProjectRequest
  const updated = await db.$transaction(async (tx) => {
    const pr = await tx.projectRequest.update({
      where: { id: projectRequestId },
      data: {
        assignedPartnerId: partner.id,
        assignedAt: new Date(),
        status:
          projectRequest.status === 'PENDING_ASSIGNMENT'
            ? 'ASSIGNED'
            : projectRequest.status,
        operatorNotes: operatorNotes
          ? `${projectRequest.operatorNotes ? projectRequest.operatorNotes + '\n' : ''}[Assigned to ${partner.fullName}]: ${operatorNotes}`
          : projectRequest.operatorNotes,
      },
    });

    // Rebuild WhatsApp thread with partner context
    const contactName = projectRequest.requestedBy?.name || 'Client';
    const businessName = projectRequest.brief?.businessName || 'Client';
    const whatsappUrl = buildWhatsAppConsultationLink(
      projectRequest.reference,
      businessName,
      projectRequest.services as GrowthServiceKey[],
      contactName,
      partner.fullName
    );

    await tx.projectRequest.update({
      where: { id: projectRequestId },
      data: { whatsappThreadUrl: whatsappUrl },
    });

    // Record Audit Log entry
    await tx.auditLog.create({
      data: {
        organizationId: projectRequest.organizationId,
        actorId: assignedByUserId,
        actorType: 'OPERATOR',
        action: 'PROJECT_PARTNER_ASSIGNED',
        resourceType: 'ProjectRequest',
        resourceId: projectRequest.id,
        oldState: projectRequest.status,
        newState: pr.status,
        reason: `Partner ${partner.fullName} assigned to project ${projectRequest.reference}`,
        metadata: JSON.stringify({
          partnerId: partner.id,
          partnerName: partner.fullName,
          services: projectRequest.services,
        }),
      },
    });

    return pr;
  });

  return {
    success: true,
    projectRequest: updated,
    partner: {
      id: partner.id,
      fullName: partner.fullName,
      email: partner.email,
    },
  };
}

/**
 * Monitors the 30-minute SLA across all pending unassigned project requests
 */
export async function monitorProjectRequestSlas(): Promise<SlaMonitorReport> {
  const SLA_THRESHOLD_MINUTES = 30;
  const now = new Date();

  // Find all requests awaiting assignment
  const pendingRequests = await db.projectRequest.findMany({
    where: {
      status: 'PENDING_ASSIGNMENT',
      assignedPartnerId: null,
    },
    include: {
      brief: {
        select: { businessName: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const statuses: ProjectSlaStatus[] = [];
  const newlyBreachedIds: string[] = [];

  for (const pr of pendingRequests) {
    const elapsedMs = now.getTime() - new Date(pr.createdAt).getTime();
    const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
    const remainingMinutes = Math.max(0, SLA_THRESHOLD_MINUTES - elapsedMinutes);
    const isBreached = elapsedMinutes >= SLA_THRESHOLD_MINUTES;

    if (isBreached && !pr.slaBreachedAt) {
      newlyBreachedIds.push(pr.id);
    }

    statuses.push({
      projectRequestId: pr.id,
      reference: pr.reference,
      businessName: pr.brief?.businessName || 'Unknown Business',
      createdAt: pr.createdAt,
      elapsedMinutes,
      remainingMinutes,
      isBreached,
      slaBreachedAt: pr.slaBreachedAt || (isBreached ? now : null),
      status: pr.status,
    });
  }

  // Persist newly detected breaches
  if (newlyBreachedIds.length > 0) {
    await db.projectRequest.updateMany({
      where: { id: { in: newlyBreachedIds } },
      data: { slaBreachedAt: now },
    });
  }

  const breachedCount = statuses.filter((s) => s.isBreached).length;
  const atRiskCount = statuses.filter((s) => !s.isBreached && s.remainingMinutes <= 10).length;
  const compliantCount = statuses.filter((s) => !s.isBreached && s.remainingMinutes > 10).length;

  return {
    totalPendingRequests: pendingRequests.length,
    breachedCount,
    atRiskCount,
    compliantCount,
    inspectedAt: now,
    requests: statuses,
  };
}
