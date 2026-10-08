import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let org = await db.organization.findFirst();
    if (!org) {
      org = await db.organization.create({
        data: {
          name: "Zeerocodes Default",
          slug: "zeerocodes-default"
        }
      });
    }

    const m1 = await db.module.create({
      data: {
        organizationId: org.id,
        title: "The Foundations of Digital Sales",
        description: "Understanding the modern buyer journey and digital pipeline.",
        orderIndex: 0,
        lessons: {
          create: [
            {
              title: "The BANT Framework Overview",
              orderIndex: 0,
              transcript: "Most salespeople ask about budget the wrong way. 'Do you have a budget for this?' is a yes/no trap. In this lesson, we cover how to anchor price early and qualify timing based on compelling events rather than arbitrary quarters."
            },
            {
              title: "Uncovering the Real Need",
              orderIndex: 1,
              transcript: "We need to go beyond the surface pain. If they say 'Our lead response time is slow', the real pain is 'We are losing 40% of our marketing spend to competitors who respond in 5 minutes'."
            }
          ]
        }
      }
    });

    const m2 = await db.module.create({
      data: {
        organizationId: org.id,
        title: "Advanced Discovery & Qualification",
        description: "Learn to extract real pain points and urgency using the BANT methodology.",
        orderIndex: 1,
        lessons: {
          create: [
            {
              title: "Timing and Budget Nuances",
              orderIndex: 0
            }
          ]
        }
      }
    });

    const scenario = await db.roleplayScenario.create({
      data: {
        organizationId: org.id,
        title: "Executive Objection Handling",
        buyerPersona: "David Chen, CTO of PayPulse Africa. Budget-conscious but hates inefficiency.",
        context: "You are on a discovery call with David Chen. You just presented the pricing of ₦35,000/month for the Growth Engine.",
        rubric: JSON.stringify(["Objection Handling", "Active Listening", "Closing Attempt"])
      }
    });

    return NextResponse.json({ success: true, m1, m2, scenario });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
