/**
 * transition_public_pilot_to_7day.ts
 *
 * Implements Section 8 of the Closecraft Engineering Master Prompt:
 * "For existing unpaid public-pilot workspaces without a valid end date, provide a one-time
 *  seven-day transition from a single recorded rollout timestamp. Show the exact end date to owners.
 *  Rerunning the migration must not extend the transition.
 *  Preserve valid trial expiry dates already promised to customers whose trials are in progress.
 *  These are legacy entitlements, not a new fourteen-day offer.
 *  Exclude paid, contracted and explicitly exempt workspaces using trusted entitlement records.
 *  Produce a dry-run migration summary and isolate ambiguous cases for review."
 *
 * Usage:
 *   npx tsx scripts/transition_public_pilot_to_7day.ts --dry-run
 *   npx tsx scripts/transition_public_pilot_to_7day.ts --apply
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TRIAL_DURATION_HOURS = 168; // 7 days = 168 hours
const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;
const ROLLOUT_TIMESTAMP = new Date('2026-10-30T12:00:00.000Z'); // Fixed single rollout timestamp
const ROLLOUT_TRIAL_ENDS_AT = new Date(ROLLOUT_TIMESTAMP.getTime() + TRIAL_DURATION_MS);

interface WorkspacesSummary {
  totalScanned: number;
  paidOrContractedExempt: Array<{ orgId: string; reason: string }>;
  legacyTrialsPreserved: Array<{ orgId: string; trialEndsAt: Date }>;
  alreadyTransitioned: Array<{ orgId: string }>;
  transitionCandidates: Array<{ orgId: string; currentStatus: string; newEndsAt: Date }>;
  ambiguousCases: Array<{ orgId: string; reason: string }>;
}

export async function runTransition(isApply: boolean = false) {
  console.log(`\n======================================================`);
  console.log(`CLOSECRAFT 7-DAY TRIAL ROLLOUT TRANSITION`);
  console.log(`Mode: ${isApply ? 'APPLY (LIVE WRITE)' : 'DRY-RUN (AUDIT ONLY)'}`);
  console.log(`Single Rollout Timestamp: ${ROLLOUT_TIMESTAMP.toISOString()}`);
  console.log(`Target Rollout Expiry:    ${ROLLOUT_TRIAL_ENDS_AT.toISOString()}`);
  console.log(`======================================================\n`);

  const summary: WorkspacesSummary = {
    totalScanned: 0,
    paidOrContractedExempt: [],
    legacyTrialsPreserved: [],
    alreadyTransitioned: [],
    transitionCandidates: [],
    ambiguousCases: [],
  };

  try {
    const subscriptions = await prisma.workspaceSubscription.findMany({
      include: {
        organization: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    summary.totalScanned = subscriptions.length;
    const now = new Date();

    for (const sub of subscriptions) {
      const orgId = sub.organizationId;

      // 1. Check if paid or contracted
      const isPaid = sub.status === 'ACTIVE' && sub.paidThroughDate && sub.paidThroughDate > now;
      const isContracted = sub.activePilotEngagementId !== null || sub.status === 'PILOT_INCLUDED';

      if (isPaid || isContracted) {
        summary.paidOrContractedExempt.push({
          orgId,
          reason: isPaid
            ? `Paid active subscription through ${sub.paidThroughDate?.toISOString()}`
            : `Contracted managed pilot engagement (${sub.activePilotEngagementId || 'PILOT_INCLUDED'})`
        });
        continue;
      }

      // 2. Check if already transitioned to fixed rollout timestamp
      // Rerunning the migration must not extend the transition!
      if (
        sub.trialStartedAt &&
        sub.trialStartedAt.getTime() === ROLLOUT_TIMESTAMP.getTime()
      ) {
        summary.alreadyTransitioned.push({ orgId });
        continue;
      }

      // 3. Check for valid trials already in progress
      // Preserve valid trial expiry dates already promised to customers whose trials are in progress
      if (
        sub.trialEndsAt &&
        sub.trialEndsAt > now &&
        sub.trialStartedAt &&
        sub.trialStartedAt < now
      ) {
        summary.legacyTrialsPreserved.push({
          orgId,
          trialEndsAt: sub.trialEndsAt,
        });
        continue;
      }

      // 4. Check for unpaid public-pilot workspaces without a valid end date
      const hasNoValidEndDate = !sub.trialEndsAt || sub.trialEndsAt <= now;
      const isUnpaidPilot = sub.status === 'TRIALING' || sub.status === 'PILOT_INCLUDED' || sub.status === 'EXPIRED';

      if (hasNoValidEndDate && isUnpaidPilot) {
        summary.transitionCandidates.push({
          orgId,
          currentStatus: sub.status,
          newEndsAt: ROLLOUT_TRIAL_ENDS_AT,
        });

        if (isApply) {
          await prisma.workspaceSubscription.update({
            where: { organizationId: orgId },
            data: {
              trialStartedAt: ROLLOUT_TIMESTAMP,
              trialEndsAt: ROLLOUT_TRIAL_ENDS_AT,
              status: ROLLOUT_TRIAL_ENDS_AT > now ? 'TRIALING' : 'EXPIRED',
              plan: 'STARTER',
            }
          });
        }
      } else {
        // Any ambiguous case
        summary.ambiguousCases.push({
          orgId,
          reason: `Unmatched criteria: status=${sub.status}, trialEndsAt=${sub.trialEndsAt?.toISOString() || 'null'}`
        });
      }
    }

    // Print Report
    console.log(`--- MIGRATION AUDIT SUMMARY ---`);
    console.log(`Total Workspaces Scanned:       ${summary.totalScanned}`);
    console.log(`Paid / Contracted Exempt:       ${summary.paidOrContractedExempt.length}`);
    console.log(`Legacy In-Progress Trials Kept:  ${summary.legacyTrialsPreserved.length}`);
    console.log(`Already Transitioned (Idempotent): ${summary.alreadyTransitioned.length}`);
    console.log(`Transition Candidates (7-Day):   ${summary.transitionCandidates.length}`);
    console.log(`Ambiguous Cases for Review:     ${summary.ambiguousCases.length}`);

    if (summary.paidOrContractedExempt.length > 0) {
      console.log(`\n[Exempt Workspaces (Preserved Paid / Contract)]:`);
      summary.paidOrContractedExempt.forEach(e => console.log(` - ${e.orgId}: ${e.reason}`));
    }

    if (summary.legacyTrialsPreserved.length > 0) {
      console.log(`\n[Legacy In-Progress Trials (Preserved)]:`);
      summary.legacyTrialsPreserved.forEach(l => console.log(` - ${l.orgId}: ends at ${l.trialEndsAt.toISOString()}`));
    }

    if (summary.transitionCandidates.length > 0) {
      console.log(`\n[${isApply ? 'APPLIED' : 'CANDIDATE'} 7-Day Transitions]:`);
      summary.transitionCandidates.forEach(c => console.log(` - ${c.orgId}: ${c.currentStatus} -> ends ${c.newEndsAt.toISOString()}`));
    }

    if (summary.ambiguousCases.length > 0) {
      console.log(`\n[Ambiguous Cases]:`);
      summary.ambiguousCases.forEach(a => console.log(` - ${a.orgId}: ${a.reason}`));
    }

    console.log(`\n======================================================`);
    console.log(isApply ? `Migration successfully applied.` : `Dry-run completed. No records modified.`);
    console.log(`======================================================\n`);

    return summary;
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check CLI arguments
if (require.main === module) {
  const isApply = process.argv.includes('--apply');
  runTransition(isApply).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
