import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RevenueEngine } from '@/lib/revenue-engine/engine';
import { inngest } from '@/lib/inngest/client';
import { dispatchNotificationAlert } from '@/lib/notifications/router';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';
import { decryptCredential } from '@/lib/integrations/meta/crypto';
import { fetchLeadDetails, fetchAdAttribution } from '@/lib/integrations/meta/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || 'closecraft_meta_webhook_verify_token_2026';

  if (mode === 'subscribe' && token && timingSafeEqualString(token, verifyToken)) {
    console.log('[Facebook Webhook] Verified challenge successfully with Meta');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.warn('[Facebook Webhook] Forbidden webhook challenge verification failed');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const limiter = await rateLimit(`fb-webhook:${ip}`, 120, 60 * 1000);
    if (!limiter.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');
    const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET;

    if (appSecret) {
      if (!signature) {
        console.warn('[Facebook Webhook] Missing x-hub-signature header');
        return new NextResponse('Missing signature', { status: 401 });
      }
      const expected256 = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const expected1 = 'sha1=' + crypto.createHmac('sha1', appSecret).update(rawBody).digest('hex');
      const isValid = timingSafeEqualString(signature, expected256) || timingSafeEqualString(signature, expected1);
      if (!isValid) {
        console.warn('[Facebook Webhook] Invalid signature rejected');
        return new NextResponse('Invalid signature', { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[Facebook Webhook] META_APP_SECRET unconfigured in production');
      return new NextResponse('Configuration error', { status: 500 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    if (body.object !== 'page' || !Array.isArray(body.entry)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Process each incoming page entry
    for (const entry of body.entry) {
      const pageId = String(entry.id || entry.page_id || '');

      // 1. Resolve tenant organization and credentials via MetaConnectedPage
      const connectedPage = await db.metaConnectedPage.findFirst({
        where: { pageId },
        include: {
          organization: true,
          forms: true,
        },
      });

      let org = connectedPage?.organization || null;
      let pageAccessToken: string | null = null;

      if (connectedPage && connectedPage.pageAccessToken) {
        try {
          pageAccessToken = decryptCredential(connectedPage.pageAccessToken);
        } catch (decryptErr) {
          console.warn(`[Facebook Webhook] Could not decrypt token for page ${pageId}:`, decryptErr);
        }
      }

      // 2. Legacy fallback to flat organization table if not yet connected in new MetaConnectedPage
      if (!org && pageId) {
        org = await db.organization.findFirst({
          where: { facebookPageId: pageId },
        });
        if (org && (org as any).metaAccessToken) {
          pageAccessToken = (org as any).metaAccessToken;
        }
      }

      // Multi-tenant isolation: Never guess or cross-contaminate workspaces
      if (!org) {
        console.warn(`[Facebook Webhook] Unmapped Facebook page ID ${pageId}. Quarantining to prevent cross-tenant contamination.`);
        await db.webhookEvent.create({
          data: {
            eventId: `fb_unmapped_${pageId}_${Date.now()}`,
            provider: 'FACEBOOK',
            eventType: 'leadgen.quarantined',
            status: 'IGNORED',
            payload: JSON.stringify({ pageId, entryId: entry.id }),
          },
        }).catch(() => null);
        continue;
      }

      if (!Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadEventData = change.value;
          const leadgenId = String(leadEventData.leadgen_id);
          const formId = leadEventData.form_id ? String(leadEventData.form_id) : undefined;
          const adId = leadEventData.ad_id ? String(leadEventData.ad_id) : undefined;

          // 3. Idempotency Check: Don't process the same leadgen_id twice for this organization
          const existingLead = await db.lead.findFirst({
            where: {
              organizationId: org.id,
              metaLeadId: leadgenId,
            },
          });

          if (existingLead) {
            console.log(`[Facebook Webhook] Idempotent skip: Lead ${leadgenId} already ingested in organization ${org.name}`);
            continue;
          }

          // 4. Retrieve configured lead form settings (targetStage, targetAssigneeId)
          const matchedForm = connectedPage?.forms.find((f: any) => f.formId === formId);

          // 5. Fetch full lead details from Meta Graph API
          let graphDetails = null;
          if (pageAccessToken) {
            graphDetails = await fetchLeadDetails(leadgenId, pageAccessToken);
          }

          const leadName = graphDetails?.name || 'Meta Ad Lead';
          const leadEmail = graphDetails?.email || `fb_lead_${leadgenId}@facebook.closecraft.com`;
          const leadPhone = graphDetails?.phone || null;

          // 6. Fetch Ad and Campaign attribution if ad_id is present
          let campaignName: string | undefined = undefined;
          let campaignId: string | undefined = undefined;
          let adSetName: string | undefined = undefined;
          let adSetId: string | undefined = undefined;
          let adName: string | undefined = undefined;

          if (adId && pageAccessToken) {
            const adAttr = await fetchAdAttribution(adId, pageAccessToken);
            if (adAttr) {
              campaignName = adAttr.campaignName;
              campaignId = adAttr.campaignId;
              adSetName = adAttr.adSetName;
              adSetId = adAttr.adSetId;
              adName = adAttr.adName;
            }
          }

          const rawResponses = graphDetails?.rawResponses || {};
          const responseSummary = Object.keys(rawResponses).length > 0
            ? Object.entries(rawResponses).map(([k, v]) => `${k}: ${v}`).join('\n')
            : null;

          const notes = [
            `Meta Lead Form: ${matchedForm?.formName || formId || 'Instant Form'}`,
            campaignName ? `Campaign: ${campaignName}` : null,
            adSetName ? `Ad Set: ${adSetName}` : null,
            adName ? `Ad Name: ${adName}` : null,
            responseSummary ? `\nResponses:\n${responseSummary}` : null,
          ].filter(Boolean).join('\n');

          // 7. Deduplicate or create Contact record
          let contact = await db.contact.findFirst({
            where: {
              organizationId: org.id,
              OR: [
                { email: leadEmail },
                ...(leadPhone ? [{ phone: leadPhone }] : []),
              ],
            },
          });

          if (!contact) {
            contact = await db.contact.create({
              data: {
                organizationId: org.id,
                name: leadName,
                email: leadEmail,
                phone: leadPhone,
              },
            });
          }

          // 8. Create or update Lead with complete Meta attribution
          const targetStage = matchedForm?.targetStage || 'NEW';
          const targetAssigneeId = matchedForm?.targetAssigneeId || null;

          const lead = await db.lead.create({
            data: {
              organizationId: org.id,
              contactId: contact.id,
              type: 'SALES_LEAD',
              name: leadName,
              email: leadEmail,
              phone: leadPhone,
              source: 'FACEBOOK_LEAD_AD',
              status: targetStage,
              assignedUserId: targetAssigneeId,
              nextAction: 'First response via WhatsApp or call',
              nextActionDueAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour first response SLA
              message: notes,
              metaLeadId: leadgenId,
              metaPageId: pageId,
              metaPageName: connectedPage?.pageName || undefined,
              metaFormId: formId,
              metaFormName: matchedForm?.formName || undefined,
              metaCampaignId: campaignId,
              metaCampaignName: campaignName,
              metaAdSetId: adSetId,
              metaAdSetName: adSetName,
              metaAdId: adId,
              metaAdName: adName,
              metaRawSubmission: JSON.stringify(rawResponses),
            },
          });

          // 9. Record sync log
          if (connectedPage) {
            await db.metaLeadSyncLog.create({
              data: {
                metaIntegrationId: connectedPage.metaIntegrationId,
                organizationId: org.id,
                metaLeadId: leadgenId,
                formId,
                pageId,
                leadId: lead.id,
                status: 'SUCCESS',
                errorMessage: `Real-time capture: "${leadName}" (${leadEmail}) from form "${matchedForm?.formName || formId || 'Default'}"`,
              },
            }).catch(() => null);
          }

          // 10. Trigger Revenue Engine qualification & prescriptive Next Best Action
          try {
            await RevenueEngine.processNewLead(lead.id);
          } catch (engineErr: any) {
            console.error(`[Facebook Webhook] RevenueEngine error for lead ${lead.id}:`, engineErr.message);
          }

          // 11. Dispatch Inngest event
          try {
            await inngest.send({
              name: 'revenue/lead.created',
              data: {
                leadId: lead.id,
                organizationId: org.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                source: 'FACEBOOK_LEAD_AD',
                message: notes,
              },
            });
          } catch (inngestErr: any) {
            console.warn(`[Facebook Webhook] Inngest dispatch skipped:`, inngestErr.message);
          }

          // 12. Dispatch notification alert to Sales team
          try {
            await dispatchNotificationAlert({
              category: 'SALES',
              subject: `🎯 New Meta Ad Lead: ${lead.name} (${org.name})`,
              text: `New Lead from Meta Lead Ads!\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'None'}\nCampaign: ${campaignName || 'N/A'}\nWorkspace: ${org.name}\n\nDetails:\n${notes}\n\nFirst Touch Due Within 1 Hour: https://www.closecrafthq.com/inbox`,
              html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #248277;">🎯 New Meta Ad Lead Captured</h2>
                <div style="background: #f4f6f8; border-left: 4px solid #248277; padding: 12px 16px; margin: 16px 0;">
                  <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${lead.name}</p>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #444;">Email: <a href="mailto:${lead.email}">${lead.email}</a> | Phone: <strong>${lead.phone || 'Not provided'}</strong></p>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #444;">Workspace: <strong>${org.name}</strong></p>
                  ${campaignName ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #248277;">Campaign: <strong>${campaignName}</strong></p>` : ''}
                  <div style="margin-top: 8px; font-size: 12px; color: #555; white-space: pre-wrap;">${notes}</div>
                </div>
                <p><a href="https://www.closecrafthq.com/inbox" style="background: #248277; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Open in Revenue Inbox &rarr;</a></p>
              </div>`,
            });
          } catch (notifErr) {
            console.warn('[Facebook Webhook Alert Notice]', notifErr);
          }

          console.log(`[Facebook Webhook] Ingested lead ${lead.id} (${lead.name}) for organization ${org.name}`);
        }
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error: any) {
    console.error('[Facebook Webhook] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
