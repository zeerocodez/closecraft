import { PrismaClient } from '@prisma/client';
import { requireDemoDatabase } from '../src/lib/demoSeed';

requireDemoDatabase();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LMS curriculum...');

  // Get the primary organization
  const org = await prisma.organization.findUnique({ where: { slug: 'demo-workspace' } });
  if (!org) {
    console.log('No organization found. Cannot seed LMS.');
    return;
  }

  // Create Module 1
  const m1 = await prisma.module.create({
    data: {
      title: 'Module 1: Introduction to Tech Sales',
      description: 'Understanding the psychology of enterprise sales.',
      orderIndex: 1,
      organizationId: org.id,
      lessons: {
        create: [
          { title: 'The Commercial Mindset', orderIndex: 1, contentUrl: 'https://example.com/video1' },
          { title: 'Digital Revenue Journey', orderIndex: 2, contentUrl: 'https://example.com/video2' }
        ]
      }
    }
  });

  // Create Module 2
  const m2 = await prisma.module.create({
    data: {
      title: 'Module 2: The DSS Sales Readiness Index',
      description: 'How you are graded and assessed.',
      orderIndex: 2,
      organizationId: org.id,
      lessons: {
        create: [
          { title: 'Understanding the Index', orderIndex: 1, contentUrl: 'https://example.com/video3' }
        ]
      }
    }
  });

  // Create AI Roleplay Scenario
  await prisma.roleplayScenario.create({
    data: {
      title: 'Discovery Role-play: Sceptical CTO',
      buyerPersona: 'Sceptical CTO',
      context: 'You are the CTO of TechCorp. You are highly skeptical of new tools. Budget is tight.',
      rubric: '{"discovery": 40, "objection_handling": 40, "professionalism": 20}',
      organizationId: org.id
    }
  });

  console.log('LMS Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
