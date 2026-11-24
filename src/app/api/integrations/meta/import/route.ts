import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { decryptCredential } from '@/lib/integrations/meta/crypto';
import { fetchHistoricalLeads, fetchAdAttribution } from '@/lib/integrations/meta/client';
import { RevenueEngine } from '@/lib/revenue-engine/engine';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = (session as any)?.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 });
    }

    const body = await req.json();
    const { formId, since, until, limit } = body;

    if (!formId) {
      return NextResponse.json({ error: 'formId is required' }, { status: 400 });
    }

    // Verify form belongs to tenant
    const form = await db.metaLeadForm.findFirst({
      where: {
        formId,
        organizationId,
      },
      include: {
        connectedPage: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Lead form not found or unauthorized' }, { status: 404 });
    }

    const pageToken = form.connectedPage?.pageAccessToken
      ? decryptCredential(form.connectedPage.pageAccessToken)
      : '';

    // Fetch historical leads from Meta Graph API
    const sinceNum = typeof since === 'number' ? since : since ? parseInt(String(since), 10) : undefined;
    const untilNum = typeof until === 'number' ? until : until ? parseInt(String(until), 10) : undefined;
    const limitNum = typeof limit === 'number' ? Math.min(limit, 100) : 50;

    const historicalResult = await fetchHistoricalLeads(formId, pageToken, {
      since: sinceNum,
      until: untilNum,
      limit: limitNum,
    });

    const rawLeads = historicalResult?.leads || [];

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const leadData of rawLeads) {
      try {
        const metaLeadId = String(leadData.leadId);

        // Deduplication check: Has this Meta Lead already been ingested into CloseCraft?
        const existingLead = await db.lead.findFirst({
          where: {
            organizationId,
            OR: [
              { metaLeadId },
              { email: leadData.email },
              ...(leadData.phone ? [{ phone: leadData.phone }] : []),
            ],
          },
        });

        if (existingLead) {
          skippedCount++;
          continue;
        }

        // Fetch ad attribution if adId is available
        let campaignName: string | undefined = undefined;
        let campaignId: string | undefined = undefined;
        let adSetName: string | undefined = undefined;
        let adSetId: string | undefined = undefined;
        let adName: string | undefined = undefined;

        if (leadData.adId && pageToken) {
          const adAttr = await fetchAdAttribution(leadData.adId, pageToken);
          if (adAttr) {
            campaignName = adAttr.campaignName;
            campaignId = adAttr.campaignId;
            adSetName = adAttr.adSetName;
            adSetId = adAttr.adSetId;
            adName = adAttr.adName;
          }
        }

        // Deduplicate or create Contact
        let contact = await db.contact.findFirst({
          where: {
            organizationId,
            OR: [
              { email: leadData.email },
              ...(leadData.phone ? [{ phone: leadData.phone }] : []),
            ],
          },
        });

        if (!contact) {
          contact = await db.contact.create({
            data: {
              organizationId,
              name: leadData.name,
              email: leadData.email,
              phone: leadData.phone || null,
            },
          });
        }

        const summaryText = `Historical Meta Lead Ad from "${form.formName}"${campaignName ? ` (Campaign: ${campaignName})` : ''}`;

        // Create Lead with complete Meta attribution
        const newLead = await db.lead.create({
          data: {
            organizationId,
            contactId: contact.id,
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || null,
            source: 'FACEBOOK_LEAD_AD',
            status: form.targetStage || 'NEW',
            assignedUserId: form.targetAssigneeId || null,
            message: summaryText,
            metaLeadId,
            metaPageId: form.pageId,
            metaPageName: form.pageName,
            metaFormId: form.formId,
            metaFormName: form.formName,
            metaCampaignId: campaignId || null,
            metaCampaignName: campaignName || null,
            metaAdSetId: adSetId || null,
            metaAdSetName: adSetName || null,
            metaAdId: leadData.adId || null,
            metaAdName: adName || null,
            metaRawSubmission: JSON.stringify(leadData.rawResponses),
          },
        });

        // Trigger Revenue Engine AI qualification and Next Best Action
        try {
          await RevenueEngine.processNewLead(newLead.id);
        } catch (engineErr: any) {
          console.warn(`[Historical Import] Revenue Engine processing warning for lead ${newLead.id}:`, engineErr.message);
        }

        // Log successful synchronization
        await db.metaLeadSyncLog.create({
          data: {
            metaIntegrationId: form.metaIntegrationId,
            organizationId,
            metaLeadId,
            formId: form.formId,
            pageId: form.pageId,
            leadId: newLead.id,
            status: 'SUCCESS',
            errorMessage: `Imported "${leadData.name}" (${leadData.email})`,
          },
        });

        importedCount++;
      } catch (leadErr: any) {
        console.error(`[Historical Import] Failed lead:`, leadErr);
        errors.push(leadErr.message || 'Unknown lead import failure');
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      errors: errors.slice(0, 5),
      message: `Historical sync completed: ${importedCount} imported, ${skippedCount} duplicate/skipped.`,
    });
  } catch (err: any) {
    console.error('[Meta Historical Import] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
