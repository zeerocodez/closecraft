'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Check if user is an ADMIN member in any organization or super user
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      role: 'ADMIN',
    },
  });

  if (!membership) {
    throw new Error('Forbidden: Admin privilege required');
  }

  return session;
}

export async function createOrganization(formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim().toLowerCase();
  const plan = formData.get('plan') as string;

  if (!name || !slug) {
    throw new Error('Name and slug are required');
  }

  await db.organization.create({
    data: {
      name,
      slug,
      plan: plan || 'STARTER',
    },
  });

  revalidatePath('/admin');
}

export async function updateOrganization(formData: FormData) {
  await requireAdmin();

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const plan = formData.get('plan') as string;

  if (!id) {
    throw new Error('ID is required');
  }

  await db.organization.update({
    where: { id },
    data: {
      name: name || undefined,
      plan: plan || undefined,
    },
  });

  revalidatePath('/admin');
}
