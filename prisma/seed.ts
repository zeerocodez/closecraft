import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { requireDemoDatabase } from '../src/lib/demoSeed';

async function main() {
  requireDemoDatabase();
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password || password.length < 16) throw new Error('Provide DEMO_EMAIL and a DEMO_PASSWORD of at least 16 characters');
  const prisma = new PrismaClient();
  try {
    // Refuse existing data; never delete or reset a database.
    await prisma.$transaction(async tx => {
      if (await tx.user.count() || await tx.organization.count() || await tx.lead.count()) throw new Error('Demo seed requires an empty database');
      const org = await tx.organization.create({ data: { name: 'Demo Workspace', slug: 'demo-workspace' } });
      await tx.user.create({ data: { email, passwordHash: await bcrypt.hash(password, 12), memberships: { create: { role: 'ADMIN', organizationId: org.id } } } });
    });
  } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error('Demo seed refused or failed; check development seed configuration.'); process.exitCode = 1; });
