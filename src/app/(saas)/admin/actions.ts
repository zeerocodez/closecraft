'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createOrganization(formData: FormData) {
 const name = formData.get('name') as string;
 const slug = formData.get('slug') as string;
 const plan = formData.get('plan') as string;

 if (!name || !slug) {
 throw new Error('Name and slug are required');
 }

 await db.organization.create({
 data: {
 name,
 slug,
 plan: plan || 'STARTER',
 }
 });

 revalidatePath('/admin');
}

export async function updateOrganization(formData: FormData) {
 const id = formData.get('id') as string;
 const name = formData.get('name') as string;
 const plan = formData.get('plan') as string;

 if (!id) {
 throw new Error('ID is required');
 }

 await db.organization.update({
 where: { id },
 data: {
 name: name || undefined,
 plan: plan || undefined,
 }
 });

 revalidatePath('/admin');
}
