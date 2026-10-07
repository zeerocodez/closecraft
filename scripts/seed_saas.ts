import { PrismaClient } from '@prisma/client';
import { requireDemoDatabase } from '../src/lib/demoSeed';

requireDemoDatabase();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SaaS data...');

  const org = await prisma.organization.findUnique({ where: { slug: 'demo-workspace' } });
  if (!org) {
    console.log('No organization found.');
    return;
  }

  if (await prisma.lead.count() || await prisma.conversation.count() || await prisma.deal.count()) {
    throw new Error('Demo SaaS seed refuses existing CRM data');
  }

  // 1. Hot Lead - Opportunity Stage
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Acme Corp / Sarah Jenkins',
      email: 'sarah@acme.example.com',
      phone: '15551112222',
      status: 'OPPORTUNITY',
      buyingIntent: 95,
      organizationId: org.id,
      deals: {
        create: {
          amount: 4500000,
          stage: 'OPPORTUNITY',
          organizationId: org.id,
        }
      },
      conversations: {
        create: {
          channel: 'WHATSAPP',
          organizationId: org.id,
          messages: {
            create: [
              { content: 'Hi, I saw your pricing for the enterprise tier.', senderType: 'PROSPECT' },
              { content: 'I can help with that. What infrastructure are you currently running?', senderType: 'AI_AGENT' },
              { content: 'We are mostly on AWS but looking to consolidate.', senderType: 'PROSPECT' }
            ]
          }
        }
      }
    }
  });

  // 2. Leaked Lead - High Intent, Stale (Revenue at Risk)
  const fiveMinsAgo = new Date(Date.now() - 6 * 60 * 1000);
  const lead2 = await prisma.lead.create({
    data: {
      name: 'TechFlow / David Kim',
      email: 'david@techflow.example.com',
      phone: '15553334444',
      status: 'ENGAGED',
      buyingIntent: 85,
      updatedAt: fiveMinsAgo,
      organizationId: org.id,
      deals: {
        create: {
          amount: 1200000,
          stage: 'PROPOSAL',
          organizationId: org.id,
        }
      },
      conversations: {
        create: {
          channel: 'WHATSAPP',
          organizationId: org.id,
          messages: {
            create: [
              { content: 'Send me the contract.', senderType: 'PROSPECT', createdAt: fiveMinsAgo }
            ]
          }
        }
      }
    }
  });

  // 3. Closed Won Deal
  const lead3 = await prisma.lead.create({
    data: {
      name: 'GlobalTech / Elena Rostova',
      email: 'elena@globaltech.example.com',
      status: 'WON',
      buyingIntent: 100,
      organizationId: org.id,
      deals: {
        create: {
          amount: 8500000,
          stage: 'WON',
          organizationId: org.id,
        }
      }
    }
  });

  console.log('SaaS Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
