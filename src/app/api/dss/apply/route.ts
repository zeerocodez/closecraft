import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recordEnquiry } from '@/lib/dss/affiliate-store';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 10 submissions per 10 minutes per IP
  const ip = clientIp(req);
  const limiter = await rateLimit(`dss-apply:${ip}`, 10, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a few minutes before trying again.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      timezone,
      route,
      salesExperience,
      learningGoal,
      canProtectHours,
      companySponsorship,
      referral,
      website, // Honeypot spam trap
    } = body;

    // Honeypot trap: bots filling invisible website field get fake immediate success
    if (website) {
      return NextResponse.json({
        success: true,
        message: 'Your application has been received. We will contact you using the details provided with programme information and the next step.',
      });
    }

    // Server-side validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return NextResponse.json({ error: 'Please enter a valid phone or WhatsApp number.' }, { status: 400 });
    }

    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json({ error: 'Please select your time zone.' }, { status: 400 });
    }

    const validRoutes = ['Remote Sales Starter', 'Business Builder'];
    if (!route || !validRoutes.includes(route)) {
      return NextResponse.json(
        { error: 'Please select an application route (Remote Sales Starter or Business Builder).' },
        { status: 400 }
      );
    }

    if (!salesExperience || typeof salesExperience !== 'string') {
      return NextResponse.json({ error: 'Please indicate your current sales experience level.' }, { status: 400 });
    }

    if (!learningGoal || typeof learningGoal !== 'string' || learningGoal.trim().length < 5) {
      return NextResponse.json({ error: 'Please share your main learning goal for the sprint.' }, { status: 400 });
    }

    if (canProtectHours !== true) {
      return NextResponse.json(
        { error: 'You must confirm that you can protect approximately 21 hours each week for the sprint.' },
        { status: 400 }
      );
    }

    // Deduplication check: check if submission with same email exists within last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingRecentLead = await db.lead.findFirst({
      where: {
        email: cleanEmail,
        createdAt: { gte: oneDayAgo },
        source: { contains: 'DSS' },
      },
    });

    if (existingRecentLead) {
      // Deduplicated: return success message without duplicating record
      return NextResponse.json({
        success: true,
        deduplicated: true,
        message: 'Your application has been received. We will contact you using the details provided with programme information and the next step.',
      });
    }

    // Find default organisation to scope lead
    const org = await db.organization.findFirst();

    // Create the Lead in the Revenue Engine with stage and qualification data
    const lead = await db.lead.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        type: 'MARKETING_LEAD',
        status: 'NEW',
        source: referral ? `DSS Referral (${referral})` : 'DSS 4-Week Sprint Application',
        organizationId: org?.id,
        buyingIntent: 85,
        message: `Flagship 4-Week Sprint Application | Route: ${route} | Experience: ${salesExperience} | Timezone: ${timezone} | Goal: ${learningGoal.trim()} | Sponsorship: ${companySponsorship?.trim() || 'Self-funded'}`,
        qualificationData: {
          create: {
            authority: companySponsorship ? 'Corporate/Employer Sponsorship' : 'Self-funded',
            timeline: 'Next Confirmed Cohort (4-Week Sprint)',
            need: learningGoal.trim(),
            budget: 'Tuition review pending cohort schedule',
            customData: JSON.stringify({
              programme: 'DSS Four-Week Remote Sales Sprint',
              route,
              salesExperience,
              timezone,
              committedHoursWeekly: 21,
              companySponsorship: companySponsorship?.trim() || null,
              stage: 'APPLICATION_RECEIVED',
              submittedAt: new Date().toISOString(),
              referral: referral || null,
            }),
          },
        },
      },
    });

    // Create the initial Revenue Action for admissions review
    if (org?.id) {
      await db.revenueAction.create({
        data: {
          type: 'REVIEW_DSS_APPLICATION',
          reason: `New DSS Sprint application requires admission review (${route})`,
          priority: 85,
          recommendedActor: 'HUMAN',
          status: 'PENDING',
          organizationId: org.id,
          leadId: lead.id,
        },
      });
    }

    // Also record in affiliate store for referral tracking & partner attribution
    try {
      await recordEnquiry({
        name: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        goal: `${route}: ${learningGoal.trim()}`,
        route,
        referral: referral || undefined,
      });
    } catch (err) {
      console.warn('Affiliate store record notice:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Your application has been received. We will contact you using the details provided with programme information and the next step.',
    });
  } catch (error: unknown) {
    console.error('DSS sprint application error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit application';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
