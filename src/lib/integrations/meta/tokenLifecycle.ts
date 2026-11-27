/**
 * Meta token lifecycle maintenance.
 *
 * Tenant Meta connections use 60-day long-lived user tokens. Before this job
 * existed, nothing refreshed or even flagged them: every tenant connection
 * silently stopped delivering usable leads at expiry, and the webhook stored
 * placeholder leads while logging SUCCESS.
 *
 * This runner (invoked daily by an Inngest cron) refreshes any integration
 * whose token expires within REFRESH_WINDOW_DAYS, best-effort rotates the
 * stored Page tokens with the fresh user token, and marks integrations whose
 * refresh fails as ERROR with a tenant-visible reconnect message.
 */
import { db } from '@/lib/db';
import { encryptToken, decryptCredential } from './crypto';
import { refreshLongLivedUserToken, fetchUserPages } from './client';

export const REFRESH_WINDOW_DAYS = 14;
const DEFAULT_LONG_LIVED_SECONDS = 60 * 24 * 60 * 60;

export interface TokenLifecycleSummary {
  checked: number;
  refreshed: number;
  failed: number;
  failures: Array<{ organizationId: string; error: string }>;
}

export async function runMetaTokenLifecycle(now: Date = new Date()): Promise<TokenLifecycleSummary> {
  const windowEnd = new Date(now.getTime() + REFRESH_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const due = await db.metaIntegration.findMany({
    where: {
      status: { in: ['CONNECTED', 'ERROR'] },
      syncEnabled: true,
      tokenExpiresAt: { not: null, lte: windowEnd },
    },
  });

  const summary: TokenLifecycleSummary = { checked: due.length, refreshed: 0, failed: 0, failures: [] };

  for (const integration of due) {
    const expired = integration.tokenExpiresAt !== null && integration.tokenExpiresAt < now;
    try {
      if (!integration.accessToken) {
        throw new Error('No stored access token');
      }
      const currentToken = decryptCredential(integration.accessToken);
      const refreshed = await refreshLongLivedUserToken(currentToken);
      const expiresIn = refreshed.expiresIn || DEFAULT_LONG_LIVED_SECONDS;

      await db.metaIntegration.update({
        where: { id: integration.id },
        data: {
          accessToken: encryptToken(refreshed.accessToken),
          tokenExpiresAt: new Date(now.getTime() + expiresIn * 1000),
          status: 'CONNECTED',
          lastError: null,
          lastSyncAt: now,
        },
      });

      // Best-effort: rotate stored Page tokens using the fresh user token so
      // page-level credentials stay consistent with the user token.
      try {
        const pages = await fetchUserPages(refreshed.accessToken);
        for (const page of pages) {
          if (!page.access_token) continue;
          await db.metaConnectedPage.updateMany({
            where: { metaIntegrationId: integration.id, pageId: page.id },
            data: { pageAccessToken: encryptToken(page.access_token) },
          });
        }
      } catch (pageErr) {
        console.warn(`[MetaTokenLifecycle] Page token rotation skipped for org ${integration.organizationId}:`, pageErr);
      }

      summary.refreshed += 1;
      console.log(`[MetaTokenLifecycle] Refreshed token for org ${integration.organizationId} (was ${expired ? 'EXPIRED' : 'expiring'})`);
    } catch (err: any) {
      const message = `${expired ? 'Meta token expired and could not be refreshed' : 'Meta token refresh failed'}: ${err.message || 'unknown error'}. Reconnect Meta in Settings → Meta Lead Ads.`;
      await db.metaIntegration.update({
        where: { id: integration.id },
        data: { status: 'ERROR', lastError: message },
      }).catch(() => null);
      summary.failed += 1;
      summary.failures.push({ organizationId: integration.organizationId, error: message });
      console.error(`[MetaTokenLifecycle] Refresh failed for org ${integration.organizationId}:`, err.message);
    }
  }

  return summary;
}
