import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';

export async function requirePlatformAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } });
  if (user?.platformRole !== 'SUPER_ADMIN') notFound();
}

export async function requireStudent() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!session.organizationId) notFound();
  const student = await db.studentProfile.findFirst({
    where: {
      userId: session.user.id,
      organizationId: session.organizationId,
      organization: { members: { some: { userId: session.user.id } } },
      enrollments: { some: { status: 'ACTIVE', cohort: { organizationId: session.organizationId } } },
    },
  });
  if (!student) notFound();
  return student;
}

export async function curriculumAccess(student: { id: string; organizationId: string }) {
  // Fetch metadata only; locked lesson URLs and transcripts are never loaded here.
  const modules = await db.module.findMany({
    where: { organizationId: student.organizationId },
    orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
    select: { id: true, title: true, orderIndex: true, _count: { select: { lessons: true } }, progress: { where: { studentId: student.id }, select: { completedAt: true } } },
  });
  return modules.map(module => ({
    ...module,
    status: modules.filter(previous => previous.orderIndex < module.orderIndex).every(previous => previous.progress.some(p => p.completedAt))
      ? (module.progress.some(p => p.completedAt) ? 'COMPLETED' : 'ACTIVE') : 'LOCKED',
  }));
}
