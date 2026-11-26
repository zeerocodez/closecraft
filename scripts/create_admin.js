// Secure admin bootstrap — replaces the old root create_admin.js, which had a
// hardcoded password. This script reads credentials from the environment and
// refuses weak or missing values. It never prints the password.
//
// Usage:
//   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='<strong-unique-password>' \
//   ADMIN_NAME='Your Name' ADMIN_ORG_NAME='Your Org' ADMIN_ORG_SLUG='your-org' \
//   node scripts/create_admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = process.env.ADMIN_NAME || 'Admin';
  const orgName = process.env.ADMIN_ORG_NAME || 'Zeerocodes HQ';
  const orgSlug = process.env.ADMIN_ORG_SLUG || 'zeerocodes';

  const banned = new Set(['password123', 'password', 'demo', 'admin123', 'changeme']);
  if (!email || !email.includes('@')) throw new Error('ADMIN_EMAIL is required');
  if (password.length < 12 || banned.has(password.toLowerCase())) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters and not a known default');
  }

  let org = await prisma.organization.findFirst({ where: { slug: orgSlug } });
  if (!org) {
    org = await prisma.organization.create({ data: { name: orgName, slug: orgSlug, plan: 'SCALE' } });
    console.log('Created organization.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    console.log(`Updated password for existing user ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email, name, passwordHash,
        memberships: { create: { role: 'ADMIN', organizationId: org.id } },
      },
    });
    console.log(`Created admin user ${email}`);
  }
}

main().catch((e) => { console.error(e.message || e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
