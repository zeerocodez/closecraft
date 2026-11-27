import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { META_GRAPH_VERSION } from '@/lib/integrations/meta/client';
import {
  fetchWhatsAppPhoneNumberInfo,
  getStoredWhatsAppToken,
  requireIntegrationManager,
} from '@/lib/integrations/whatsapp/config';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { GET as whatsappWebhookGet } from '@/app/api/webhooks/whatsapp/route';

export async function POST(req: Request) {
  try {
    const authz = await requireIntegrationManager();
    if (!authz.ok) {
      return NextResponse.json({ error: authz.error }, { status: authz.status });
    }

    const body = await req.json().catch(() => ({}));
    const testPhone = String(body.testPhone || '').trim();
    const sendLiveTest = Boolean(body.sendLiveTest);

    const org = await db.organization.findUnique({
      where: { id: authz.organizationId },
      select: {
        whatsappNumber: true,
        whatsappPhoneNumberId: true,
        whatsappBusinessAccountId: true,
        whatsappAccessToken: true,
      },
    });

    const verifyToken = (
      process.env.WHATSAPP_VERIFY_TOKEN ||
      process.env.FACEBOOK_VERIFY_TOKEN ||
      process.env.META_VERIFY_TOKEN ||
      ''
    ).trim();

    let webhookVerified = false;
    let webhookMessage = 'WHATSAPP_VERIFY_TOKEN (or shared FACEBOOK_VERIFY_TOKEN) is not configured on server.';

    if (verifyToken) {
      const origin = new URL(req.url).origin;
      const challenge = `cc_wa_probe_${Date.now()}`;
      const okRes = await whatsappWebhookGet(
        new Request(
          `${origin}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${challenge}`
        )
      );
      const badRes = await whatsappWebhookGet(
        new Request(
          `${origin}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=invalid_probe_token&hub.challenge=${challenge}`
        )
      );
      const okText = await okRes.text();
      if (okRes.status === 200 && okText === challenge && badRes.status === 403) {
        webhookVerified = true;
        webhookMessage = 'WhatsApp webhook challenge verified (200 on valid token, 403 on bad token).';
      } else {
        webhookMessage = `Unexpected WhatsApp webhook response (HTTP ${okRes.status} / ${badRes.status}).`;
      }
    }

    const appSecretConfigured = Boolean(
      (process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || '').trim()
    );
    const liveDispatchEnabled = process.env.WHATSAPP_LIVE_DISPATCH_ENABLED === 'true';

    const plainToken = org ? getStoredWhatsAppToken(org) : null;
    let credentialsValid = false;
    let credentialsMessage = 'Tenant WhatsApp Phone Number ID & System User Token not connected yet.';
    let verifiedName: string | null = null;
    let displayPhoneNumber: string | null = null;
    let wabaSubscribed: boolean | undefined = undefined;

    if (org?.whatsappPhoneNumberId && plainToken) {
      try {
        const info = await fetchWhatsAppPhoneNumberInfo(org.whatsappPhoneNumberId, plainToken);
        credentialsValid = true;
        verifiedName = info.verifiedName || null;
        displayPhoneNumber = info.displayPhoneNumber || null;
        credentialsMessage = `Connected cleanly as ${info.verifiedName || info.displayPhoneNumber || org.whatsappPhoneNumberId}.`;

        if (org.whatsappBusinessAccountId) {
          try {
            const subRes = await fetch(
              `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(org.whatsappBusinessAccountId)}/subscribed_apps`,
              {
                headers: {
                  Authorization: `Bearer ${plainToken}`,
                  Accept: 'application/json',
                },
              }
            );
            if (subRes.ok) {
              const subJson = await subRes.json().catch(() => ({}));
              const apps = Array.isArray(subJson.data) ? subJson.data : [];
              const configuredAppId = (process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || '').trim();
              wabaSubscribed = apps.some(
                (a: any) =>
                  !configuredAppId ||
                  String(a.whatsapp_business_api_data?.id || a.id) === configuredAppId
              );
            }
          } catch {
            // Optional WABA check
          }
        }
      } catch (credErr: any) {
        credentialsMessage = credErr?.message || 'Meta Graph API rejected saved WhatsApp credentials.';
      }
    }

    let testSendResult: { attempted: boolean; delivered: boolean; detail: string } = {
      attempted: false,
      delivered: false,
      detail: 'No test send requested.',
    };

    if (sendLiveTest) {
      if (!liveDispatchEnabled) {
        testSendResult = {
          attempted: false,
          delivered: false,
          detail: 'Dry-run safeguard active: set WHATSAPP_LIVE_DISPATCH_ENABLED=true in Vercel to allow live sends.',
        };
      } else if (!org?.whatsappPhoneNumberId || !plainToken) {
        testSendResult = {
          attempted: false,
          delivered: false,
          detail: 'Connect your tenant WhatsApp Phone Number ID & System User Token first.',
        };
      } else {
        const cleanTo = normalizeWhatsAppNumber(testPhone);
        if (!cleanTo) {
          return NextResponse.json(
            { error: 'Enter a valid WhatsApp recipient number (with country code) to send a test message.' },
            { status: 400 }
          );
        }
        const sendRes = await fetch(
          `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(org.whatsappPhoneNumberId)}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${plainToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanTo,
              type: 'template',
              template: {
                name: 'hello_world',
                language: { code: 'en_US' },
              },
            }),
          }
        );
        const sendJson = await sendRes.json().catch(() => ({}));
        if (sendRes.ok && sendJson.messages?.[0]?.id) {
          testSendResult = {
            attempted: true,
            delivered: true,
            detail: `Sent hello_world template to +${cleanTo} (wamid: ${sendJson.messages[0].id}).`,
          };
        } else {
          testSendResult = {
            attempted: true,
            delivered: false,
            detail: sendJson?.error?.message || `Meta rejected test send (HTTP ${sendRes.status}).`,
          };
        }
      }
    }

    return NextResponse.json({
      webhookVerified,
      webhookMessage,
      appSecretConfigured,
      liveDispatchEnabled,
      credentialsValid,
      credentialsMessage,
      verifiedName,
      displayPhoneNumber,
      wabaSubscribed,
      testSendResult,
    });
  } catch (err: any) {
    console.error('[WhatsAppTest] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'WhatsApp verification test failed' },
      { status: 500 }
    );
  }
}
