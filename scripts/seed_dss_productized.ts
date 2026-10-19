import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    description: 'A justified buyer profile and ICP formulation.',
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
    title: 'Week 4: Discovery & The Million-Dollar Call Framework',
    description: 'An observed buyer diagnostic conversation.',
    lessons: [
      { title: 'Running the Tree', url: '/lessons/10' },
      { title: 'Opening the Call', url: '/lessons/11' },
      { title: 'Discovery: Situation and Problem Questions', url: '/lessons/12' },
      { title: 'Building the Gap: Implication and Need-Payoff', url: '/lessons/13' }
    ]
  },
  {
    week: 5,
    title: 'Week 5: Value and high-ticket proposals',
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
    description: 'Complete opportunity records and CRM operations.',
    lessons: [
      { title: 'The Close: Asking for the Decision', url: '/lessons/21' },
      { title: 'Follow-Up Systems and CRM Discipline', url: '/lessons/22' },
      { title: 'Reviving Dead Leads and Referrals', url: '/lessons/23' }
    ]
  },
  {
    week: 8,
    title: 'Week 8: Integrated selling practice & Deal Lab',
    description: 'The final observed simulation and live closer network induction.',
    lessons: [
      { title: 'Metrics and Self Call Review', url: '/lessons/24' },
      { title: 'Applying for Roles and Portfolio', url: '/lessons/25' },
      { title: 'Contracts, Pay Structures and Launch Plan', url: '/lessons/26' }
    ]
  }
];

const productsToSeed = [
  {
    slug: 'dss-setters-route',
    title: 'Setters Route (Outbound Pipeline & Appointment Setting)',
    description: 'Master multi-channel outbound prospecting (WhatsApp, LinkedIn, Email), buyer qualification matrices, and calendar triage. ₦100,000 / $100.',
    price: 100000,
    currency: 'NGN',
    weeksIncluded: [1, 2, 3]
  },
  {
    slug: 'dss-closers-route',
    title: 'Closers Route (High-Ticket Discovery, Objections & Closing)',
    description: 'Master diagnostic discovery calls, value framing, proposal engineering, and high-stakes negotiation. ₦100,000 / $100.',
    price: 100000,
    currency: 'NGN',
    weeksIncluded: [4, 5, 6, 7]
  },
  {
    slug: 'dss-live-roleplay-internship',
    title: 'Live Role Plays & Deal Placement Internship Track',
    description: 'Live unscripted buyer sparring, rubric assessment by Emmanuel Effiong, and guaranteed placement into Closecraft live deal flow. ₦100,000 / $100.',
    price: 100000,
    currency: 'NGN',
    weeksIncluded: [8]
  },
  {
    slug: 'dss-both-routes',
    title: 'Both Routes Bundle (Setters + Closers Mastery)',
    description: 'The complete 8-week end-to-end sales mastery curriculum. Covers both Setter and Closer tracks with dual certification. ₦150,000 / $150 (Save ₦50k/$50).',
    price: 150000,
    currency: 'NGN',
    weeksIncluded: [1, 2, 3, 4, 5, 6, 7, 8]
  }
];

async function main() {
  console.log('Seeding Productized DSS Courses...');

  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('No organization found');
    return;
  }

  for (const prod of productsToSeed) {
    const course = await prisma.course.upsert({
      where: { slug: prod.slug },
      update: {
        title: prod.title,
        description: prod.description,
        price: prod.price,
        currency: prod.currency,
        isFree: false
      },
      create: {
        slug: prod.slug,
        title: prod.title,
        description: prod.description,
        price: prod.price,
        currency: prod.currency,
        organizationId: org.id,
        isFree: false
      }
    });

    console.log(`Upserted course: ${course.title} (${course.slug})`);

    // Add modules for this course
    for (const weekNum of prod.weeksIncluded) {
      const w = weeks.find((item) => item.week === weekNum);
      if (!w) continue;

      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: course.id,
          orderIndex: w.week
        }
      });

      if (!existingModule) {
        await prisma.module.create({
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
        console.log(`  Added module: ${w.title} to ${course.slug}`);
      }
    }
  }

  console.log('Productized DSS courses seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
