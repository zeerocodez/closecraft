import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LMS curriculum (8-Week DSS Production Ready)...');

  // Get the primary organization
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.log('No organization found. Cannot seed LMS.');
    return;
  }

  // Create the Course
  const course = await prisma.course.upsert({
    where: { slug: 'dss-founding-cohort' },
    update: {},
    create: {
      title: 'Digital Sales School',
      description: 'An 8-week competency-based career school for remote closers and tech sales professionals.',
      slug: 'dss-founding-cohort',
      organizationId: org.id,
      isFree: false,
      price: 80000,
      currency: 'NGN'
    }
  });

  const weeks = [
    {
      week: 1,
      title: 'Week 1: Sales conduct and offer understanding',
      description: 'Explain an assigned or approved offer accurately.',
      lessons: [
        { title: 'What a Remote Closer Really Is', url: '/lessons/1' },
        { title: 'The Real Sales System Mindset', url: '/lessons/2' },
        { title: 'Your Nigerian Remote Office', url: '/lessons/3' }
      ]
    },
    {
      week: 2,
      title: 'Week 2: Buyer research and qualification',
      description: 'A justified buyer profile.',
      lessons: [
        { title: 'Tech Product Literacy', url: '/lessons/4' },
        { title: 'How Nigerians Decide', url: '/lessons/5' },
        { title: 'Ethics, Consent and the Law', url: '/lessons/6' }
      ]
    },
    {
      week: 3,
      title: 'Week 3: Outreach and appointment setting',
      description: 'A scored meeting-booking role-play.',
      lessons: [
        { title: 'Your Daily Activity System', url: '/lessons/7' },
        { title: 'Prospecting and Outreach', url: '/lessons/8' },
        { title: 'Getting Them on the Call', url: '/lessons/9' }
      ]
    },
    {
      week: 4,
      title: 'Week 4: Discovery',
      description: 'An observed buyer conversation.',
      lessons: [
        { title: 'Running the Tree', url: '/lessons/10' },
        { title: 'Opening the Call', url: '/lessons/11' },
        { title: 'Discovery: Situation and Problem Questions', url: '/lessons/12' },
        { title: 'Building the Gap: Implication and Need-Payoff', url: '/lessons/13' }
      ]
    },
    {
      week: 5,
      title: 'Week 5: Value and proposals',
      description: 'A proposal matched to an agreed need.',
      lessons: [
        { title: 'Qualification: Confirming Fit Before You Present', url: '/lessons/14' },
        { title: 'The Pitch: Presenting Their Words Back', url: '/lessons/15' },
        { title: 'The Demo: Showing, Not Just Telling', url: '/lessons/16' }
      ]
    },
    {
      week: 6,
      title: 'Week 6: Objections and authorised negotiation',
      description: 'A scored case within price limits.',
      lessons: [
        { title: 'Price and Value Framing', url: '/lessons/17' },
        { title: 'The Objection Map: Reading Resistance', url: '/lessons/18' },
        { title: 'Price and Money Objections', url: '/lessons/19' },
        { title: 'Timing, Stalls and I Need to Consult Someone', url: '/lessons/20' }
      ]
    },
    {
      week: 7,
      title: 'Week 7: Follow-up and sales records',
      description: 'Complete opportunity records.',
      lessons: [
        { title: 'The Close: Asking for the Decision', url: '/lessons/21' },
        { title: 'Follow-Up Systems and CRM Discipline', url: '/lessons/22' },
        { title: 'Reviving Dead Leads and Referrals', url: '/lessons/23' }
      ]
    },
    {
      week: 8,
      title: 'Week 8: Integrated selling practice',
      description: 'The final observed simulation.',
      lessons: [
        { title: 'Metrics and Self Call Review', url: '/lessons/24' },
        { title: 'Applying for Roles and Portfolio', url: '/lessons/25' },
        { title: 'Contracts, Pay Structures and Launch Plan', url: '/lessons/26' }
      ]
    }
  ];

  // Create Modules
  for (const w of weeks) {
    const module = await prisma.module.create({
      data: {
        title: w.title,
        description: w.description,
        orderIndex: w.week,
        organizationId: org.id,
        courseId: course.id,
        lessons: {
          create: w.lessons.map((l, idx) => ({
            title: l.title,
            orderIndex: idx + 1,
            contentUrl: l.url
          }))
        }
      }
    });
    console.log(`Created: ${module.title}`);
  }

  // Create AI Roleplay Scenarios
  await prisma.roleplayScenario.createMany({
    data: [
      {
        title: 'Screening Call',
        buyerPersona: 'Recruiter',
        context: 'You are a recruiter interviewing a candidate for an SDR role.',
        rubric: '{"professionalism": 50, "communication": 50}',
        organizationId: org.id
      },
      {
        title: 'The Cheated Prospect',
        buyerPersona: 'Mrs Adeyemi',
        context: 'You were scammed out of N400,000 recently. You are very defensive and distrustful.',
        rubric: '{"empathy": 40, "objection_handling": 60}',
        organizationId: org.id
      }
    ]
  });

  console.log('8-Week LMS Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
