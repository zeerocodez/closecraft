import { db } from '@/lib/db';
import { assertOperator } from '@/app/(saas)/operator/actions';
import { revalidatePath } from 'next/cache';

export interface CertifiedGraduateSummary {
  studentId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  track: string | null;
  certifiedAt: Date | null;
  competencyCount: number;
  portfolioCount: number;
  isAlreadyEnrolled: boolean;
  professionalProfileId?: string;
  isPoolApproved?: boolean;
}

/**
 * Retrieves all Digital Sales School graduates who have successfully passed
 * their certification examination, paired with their talent pool enrollment status.
 */
export async function getCertifiedGraduates(): Promise<CertifiedGraduateSummary[]> {
  const students = (await db.studentProfile.findMany({
    where: {
      certifications: {
        some: { status: 'PASSED' }
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      certifications: {
        where: { status: 'PASSED' },
        orderBy: { issuedAt: 'desc' },
        take: 1,
      },
      competencies: true,
      portfolio: true,
    },
    orderBy: { updatedAt: 'desc' },
  })) as any[];

  if (students.length === 0) return [];

  const userIds = students.map((s) => s.userId);
  const existingPros = await db.professionalProfile.findMany({
    where: {
      userId: { in: userIds }
    },
    select: {
      id: true,
      userId: true,
      isPoolApproved: true,
      status: true,
    }
  });

  const proMap = new Map<string, typeof existingPros[0]>();
  for (const pro of existingPros) {
    if (pro.userId) {
      proMap.set(pro.userId, pro);
    }
  }

  return students.map((student) => {
    const existingPro = proMap.get(student.userId);
    const passedCert = student.certifications?.[0];

    return {
      studentId: student.id,
      userId: student.userId,
      fullName: student.user?.name || 'DSS Graduate',
      email: student.user?.email || '',
      phone: null,
      track: student.track,
      certifiedAt: passedCert?.issuedAt || null,
      competencyCount: student.competencies?.length || 0,
      portfolioCount: student.portfolio?.length || 0,
      isAlreadyEnrolled: !!existingPro,
      professionalProfileId: existingPro?.id,
      isPoolApproved: existingPro?.isPoolApproved,
    };
  });
}

/**
 * Server action: Promotes a certified DSS graduate into the vetted professional talent pool.
 * Enforces operator authority and validates that the student passed certification.
 */
export async function promoteStudentToTalentPoolAction(data: {
  studentId: string;
  weeklyAvailabilityHours?: number;
  bioOverride?: string;
  experienceSummary?: string;
}) {
  'use server';

  const { operatorId } = await assertOperator();

  const student = (await db.studentProfile.findUnique({
    where: { id: data.studentId },
    include: {
      user: true,
      certifications: {
        where: { status: 'PASSED' },
        take: 1,
      },
      portfolio: true,
    }
  })) as any;

  if (!student) {
    throw new Error('Student profile not found.');
  }

  if (!student.certifications || student.certifications.length === 0) {
    throw new Error('Student has not passed the required DSS certification examination.');
  }

  const now = new Date();
  const portfolioLabels = (student.portfolio || []).map((p: any) => p.title).join(', ');

  const pro = await db.professionalProfile.upsert({
    where: { email: student.user.email },
    update: {
      userId: student.userId,
      fullName: student.user.name || 'Certified DSS Graduate',
      bio: data.bioOverride || student.bio || `Certified DSS ${student.track || 'Sales'} Graduate with verified role-play and prospecting competence.`,
      experienceSummary: data.experienceSummary || `Digital Sales School Certified (${student.track || 'Enterprise Sales'}). Portfolio artifacts: ${portfolioLabels || 'Verified'}.`,
      weeklyAvailabilityHours: data.weeklyAvailabilityHours || 40,
      isPoolApproved: true,
      poolApprovedAt: now,
      poolApprovedByUserId: operatorId,
      simulatedPortfolioLabels: portfolioLabels || null,
      status: 'ACTIVE',
    },
    create: {
      userId: student.userId,
      fullName: student.user.name || 'Certified DSS Graduate',
      email: student.user.email,
      phone: null,
      bio: data.bioOverride || student.bio || `Certified DSS ${student.track || 'Sales'} Graduate with verified role-play and prospecting competence.`,
      experienceSummary: data.experienceSummary || `Digital Sales School Certified (${student.track || 'Enterprise Sales'}). Portfolio artifacts: ${portfolioLabels || 'Verified'}.`,
      languages: ['English'],
      weeklyAvailabilityHours: data.weeklyAvailabilityHours || 40,
      isPoolApproved: true,
      poolApprovedAt: now,
      poolApprovedByUserId: operatorId,
      simulatedPortfolioLabels: portfolioLabels || null,
      status: 'ACTIVE',
    }
  });

  revalidatePath('/operator');
  revalidatePath('/sales-support/professionals');

  return { success: true, professionalProfileId: pro.id };
}
