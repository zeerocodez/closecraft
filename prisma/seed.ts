import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing data
  await prisma.aiAction.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('Cleared existing data.');

  // 2. Create an Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Enterprise Ops',
      slug: 'acme-enterprise-ops',
      plan: 'SCALE',
    },
  });

  console.log(`Created organization: ${org.name}`);

  // 3. Create a Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'sarah@acme.com',
      name: 'Sarah Jenkins',
      passwordHash,
      memberships: {
        create: {
          role: 'ADMIN',
          organizationId: org.id,
        },
      },
    },
  });

  console.log(`Created user: ${user.email} (password: password123)`);

  // 4. Create some Leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        name: 'Tunde Balogun',
        email: 'tunde@sterlingsolutions.ng',
        phone: '+234 803 912 4490',
        status: 'SCHEDULED',
        type: 'SALES_LEAD',
        source: 'Inbound Website',
        buyingIntent: 96,
        organizationId: org.id,
        deals: {
          create: {
            amount: 4200000,
            currency: 'NGN',
            stage: 'PROPOSAL',
            organizationId: org.id,
          }
        },
        appointments: {
          create: {
            scheduledAt: new Date(new Date().setHours(10, 0, 0, 0)),
            status: 'SCHEDULED',
            organizationId: org.id,
          }
        }
      },
    }),
    prisma.lead.create({
      data: {
        name: 'David Chen',
        email: 'david@paypulse.africa',
        status: 'NEW',
        type: 'SALES_LEAD',
        source: 'Referral',
        buyingIntent: 79,
        organizationId: org.id,
        deals: {
          create: {
            amount: 8500000,
            currency: 'NGN',
            stage: 'OPPORTUNITY',
            organizationId: org.id,
          }
        }
      },
    }),
  ]);

  console.log(`Created ${leads.length} leads.`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
