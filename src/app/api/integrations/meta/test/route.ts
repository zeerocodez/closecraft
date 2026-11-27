import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decryptCredential } from '@/lib/integrations/meta/crypto';
import {
  checkPageLeadgenSubscription,
  isMetaAppConfigured,
  validateMetaToken,
} from '@/lib/integrations/meta/client';
import { requireIntegrationManager } from '@/lib/integrations/whatsapp/config';
import { GET as facebookWebhookGet } from '@/app/api/webhooks/facebook/route';

export async function POST(req: Request) {
  try {
    const authz = await requireIntegrationManager();
    if (!authz.ok) {
      return NextResponse.json({ error: authz.error }, { status: authz.status });
    }

    const verifyToken = (process.env.FACEBOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || '').trim();
    let webhookVerified = false;
    let webhookMessage = 'FACEBOOK_VERIFY_TOKEN is not configured on server.';

    if (verifyToken) {
      const origin = new URL(req.url).origin;
      const challenge = `cc_fb_probe_${Date.now()}`;
      const okRes = await facebookWebhookGet(
        new Request(
          `${origin}/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${challenge}`
        )
      );
      const badRes = await facebookWebhookGet(
        new Request(
          `${origin}/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=invalid_probe_token&hub.challenge=${challenge}`
        )
      );
      const okText = await okRes.text();
      if (okRes.status === 200 && okText === challenge && badRes.status === 403) {
        webhookVerified = true;
        webhookMessage = 'Meta Leadgen webhook verified (200 on valid token, 403 on bad token).';
      } else {
        webhookMessage = `Unexpected Meta webhook response (HTTP ${okRes.status} / ${badRes.status}).`;
      }
    }

    const appSecretConfigured = Boolean(
      (process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET || '').trim()
    );

    const [integration, pages] = await Promise.all([
      db.metaIntegration.findUnique({ where: { organizationId: authz.organizationId } }),
      db.metaConnectedPage.findMany({
        where: { organizationId: authz.organizationId, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    let tokenValid = false;
    let tokenExpired = false;
    let tokenMessage = 'No Meta account connected to this workspace yet.';

    if (integration?.accessToken) {
      const plainToken = decryptCredential(integration.accessToken);
      const tokenCheck = await validateMetaToken(plainToken);
      tokenValid = tokenCheck.valid;
      tokenExpired = tokenCheck.expired;
      tokenMessage = tokenCheck.valid
        ? `Token accepted for ${tokenCheck.user?.name || integration.metaUserName || 'Meta Account'}.`
        : tokenCheck.error || 'Meta token validation failed.';

      if (tokenCheck.expired && integration.status !== 'ERROR') {
        await db.metaIntegration.update({
          where: { id: integration.id },
          data: { status: 'ERROR', lastError: tokenMessage },
        });
      } else if (tokenCheck.valid && integration.status === 'ERROR') {
        await db.metaIntegration.update({
          where: { id: integration.id },
          data: { status: 'CONNECTED', lastError: null },
        });
      }
    }

    const pageChecks: Array<{
      pageId: string;
      pageName: string;
      subscribed: boolean;
      error?: string;
    }> = [];

    for (const page of pages) {
      if (!page.pageAccessToken) {
        pageChecks.push({
          pageId: page.pageId,
          pageName: page.pageName,
          subscribed: false,
          error: 'Missing stored Page access token — reconnect Meta account.',
        });
        continue;
      }
      const pageToken = decryptCredential(page.pageAccessToken);
      const sub = await checkPageLeadgenSubscription(page.pageId, pageToken);
      pageChecks.push({
        pageId: page.pageId,
        pageName: page.pageName,
        subscribed: sub.subscribed,
        error: sub.error,
      });

      if (sub.subscribed !== page.isSubscribed) {
        await db.metaConnectedPage.update({
          where: { id: page.id },
          data: {
            isSubscribed: sub.subscribed,
            ...(sub.subscribed ? { subscribedAt: new Date() } : {}),
          },
        }).catch(() => null);
      }
    }

    return NextResponse.json({
      oauthConfigured: isMetaAppConfigured(),
      webhookVerified,
      webhookMessage,
      appSecretConfigured,
      tokenValid,
      tokenExpired,
      tokenMessage,
      pageChecks,
    });
  } catch (err: any) {
    console.error('[MetaTest] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Meta integration self-test failed' },
      { status: 500 }
    );
  }
}
