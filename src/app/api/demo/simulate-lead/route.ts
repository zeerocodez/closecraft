import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { RevenueEngine } from '@/lib/revenue-engine/engine';

export async function POST(req: Request) {
  try {
    const session = await auth();
    let organizationId = session?.organizationId;

    // Fallback to Apex Demo workspace if testing unauthenticated or without org
    if (!organizationId) {
      const demoOrg = await db.organization.findUnique({
        where: { slug: 'apex-demo' },
        select: { id: true },
      });
      organizationId = demoOrg?.id;
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'No active workspace found' }, { status: 400 });
    }

    const body = await req.json();
    const scenarioKey = body.scenarioKey || 'high_intent_enterprise';

    let leadData = {
      name: body.name || 'Alhaji Garba Danladi',
      phone: body.phone || '+2348028889901',
      email: body.email || 'garba.danladi@danladi-agro.ng',
      message: body.message || 'Good afternoon. I am the Managing Director of Danladi Agro Industries. We have 150 field distributors and orders are leaking because follow-ups take 24 hours. We need an enterprise advisory sprint and WhatsApp CRM setup within 3 weeks. Budget is ₦5M. Can we speak today?',
      source: body.source || 'WHATSAPP',
      currency: 'NGN',
    };

    if (scenarioKey === 'meta_ad_sme') {
      leadData = {
        name: body.name || 'Mrs. Bukola Adeniran',
        phone: body.phone || '+2348039991202',
        email: body.email || 'bukola@nexusretail.ng',
        message: body.message || 'Interested in sales process automation for our 4 store locations in Lagos. Stated budget ₦2.5M. Looking for appointment setting and objection handling support.',
        source: 'FACEBOOK_AD',
        currency: 'NGN',
      };
    } else if (scenarioKey === 'low_budget_disqualified') {
      leadData = {
        name: body.name || 'Emeka Junior',
        phone: body.phone || '+2348071112233',
        email: body.email || 'emeka.student@campus.edu.ng',
        message: body.message || 'Hello, I am an undergraduate student. Can you review my CV and help me with my university project? My budget is ₦50,000.',
        source: 'WHATSAPP',
        currency: 'NGN',
      };
    }

    // 1. Create Lead in Database
    const lead = await db.lead.create({
      data: {
        organizationId,
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        message: leadData.message,
        source: leadData.source,
        currency: leadData.currency,
        status: 'NEW',
        conversations: {
          create: {
            organizationId,
            channel: leadData.source === 'FACEBOOK_AD' ? 'META_LEAD_AD' : 'WHATSAPP',
            status: 'OPEN',
            messages: {
              create: {
                content: leadData.message,
                senderType: 'PROSPECT',
                status: 'DELIVERED',
                providerMessageId: `wamid_sim_${Date.now()}`,
              },
            },
          },
        },
      },
    });

    // 2. Trigger Revenue Engine processing
    await RevenueEngine.processNewLead(lead.id);

    // 3. Fetch comprehensive qualified state
    const processedLead = await db.lead.findUnique({
      where: { id: lead.id },
      include: {
        qualificationData: true,
        revenueSignals: { orderBy: { createdAt: 'desc' } },
        revenueActions: { orderBy: { createdAt: 'desc' }, take: 3 },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      lead: processedLead,
      signals: processedLead?.revenueSignals || [],
      primaryAction: processedLead?.revenueActions?.[0] || null,
      assignedRep: processedLead?.assignedUser || null,
    });
  } catch (error: any) {
    console.error('[Simulate Lead Error]', error);
    return NextResponse.json({ error: error.message || 'Simulation failed' }, { status: 500 });
  }
}
