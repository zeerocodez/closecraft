/**
 * WhatsApp Business (Cloud API) tenant connection helpers.
 *
 * Tenants bring their own WhatsApp Business number. A tenant admin registers
 * the number's Phone Number ID (and optionally the WABA ID) together with a
 * Meta system-user access token scoped to that business. The token is stored
 * encrypted (see integrations/meta/crypto) and never returned to clients.
 */
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { decryptCredential } from '@/lib/integrations/meta/crypto';
import { META_GRAPH_VERSION, getMetaConfig } from '@/lib/integrations/meta/client';

const GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export interface WhatsAppPhoneNumberInfo {
  id: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
}

/**
 * Validates a tenant-supplied token against a Phone Number ID by reading the
 * phone number object from the Graph API. Throws with Meta's error message
 * when the token cannot access that number.
 */
export async function fetchWhatsAppPhoneNumberInfo(
  phoneNumberId: string,
  accessToken: string,
): Promise<WhatsAppPhoneNumberInfo> {
  const url = `${GRAPH_BASE}/${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number,verified_name,quality_rating&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Meta could not read that phone number (HTTP ${res.status}). Check the Phone Number ID and that the token belongs to the same WhatsApp Business Account.`);
  }
  return {
    id: data.id,
    displayPhoneNumber: data.display_phone_number,
    verifiedName: data.verified_name,
    qualityRating: data.quality_rating,
  };
}

/**
 * Confirms a Phone Number ID belongs to the given WhatsApp Business Account.
 * Returns true/false when the listing could be read. Returns null when the
 * check itself could not be performed (e.g. the token lacks permission to
 * list the WABA's numbers — common for dashboard temporary tokens); callers
 * must treat null as "unverified", never as "does not belong", because the
 * token already proved access by reading the phone number object itself.
 */
export async function phoneNumberBelongsToWaba(
  wabaId: string,
  phoneNumberId: string,
  accessToken: string,
): Promise<boolean | null> {
  const url = `${GRAPH_BASE}/${encodeURIComponent(wabaId)}/phone_numbers?fields=id&limit=100&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  if (!Array.isArray(data.data)) return null;
  return data.data.some((n: any) => String(n.id) === String(phoneNumberId));
}

export interface WabaSubscriptionResult {
  subscribed: boolean;
  error?: string;
}

/**
 * Subscribes a tenant's WhatsApp Business Account to the CloseCraft app so
 * Meta delivers that account's inbound message events to our webhook.
 *
 * This is the step the dashboard setup flow does NOT do for you: the app-level
 * webhook can be verified and green while Meta still withholds every real
 * message, because the WABA itself was never linked via `subscribed_apps`.
 * The call is idempotent — re-subscribing an already-subscribed account
 * returns `{ success: true }` again — and needs a token with the
 * `whatsapp_business_management` permission for that account (a system-user
 * token scoped to the business, or a dashboard temporary token).
 */
export async function subscribeWabaToApp(
  wabaId: string,
  accessToken: string,
): Promise<WabaSubscriptionResult> {
  const url = `${GRAPH_BASE}/${encodeURIComponent(wabaId)}/subscribed_apps`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    });
  } catch {
    return { subscribed: false, error: 'Could not reach Meta to subscribe the WhatsApp Business Account.' };
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    return {
      subscribed: false,
      error:
        data?.error?.message ||
        `Meta refused the subscription (HTTP ${res.status}). The token needs the whatsapp_business_management permission for this WhatsApp Business Account.`,
    };
  }
  return { subscribed: true };
}

/**
 * Checks whether the CloseCraft app is listed on a WABA's subscribed apps.
 * Returns true/false when the listing could be read. Returns null when the
 * check itself could not be performed (no META_APP_ID configured, Meta
 * rejected the read, or an unparseable response) — callers must treat null
 * as "unverified", never as "not subscribed", because the POST above is the
 * authoritative confirmation and a failed read proves nothing.
 */
export async function isWabaSubscribedToApp(
  wabaId: string,
  accessToken: string,
  appId?: string,
): Promise<boolean | null> {
  const configuredAppId = (appId || getMetaConfig().appId || '').trim();
  if (!configuredAppId) return null;
  let res: Response;
  try {
    const url = `${GRAPH_BASE}/${encodeURIComponent(wabaId)}/subscribed_apps?access_token=${encodeURIComponent(accessToken)}`;
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  if (!Array.isArray(data.data)) return null;
  return data.data.some(
    (entry: any) => String(entry?.whatsapp_business_api_data?.id || entry?.id || '') === configuredAppId,
  );
}

export interface WhatsAppConnectionSummary {
  connected: boolean;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  displayPhoneNumber: string | null;
  hasToken: boolean;
}

export function summarizeWhatsAppConnection(org: {
  whatsappPhoneNumberId?: string | null;
  whatsappBusinessAccountId?: string | null;
  whatsappNumber?: string | null;
  whatsappAccessToken?: string | null;
}): WhatsAppConnectionSummary {
  return {
    connected: Boolean(org.whatsappPhoneNumberId && org.whatsappAccessToken),
    phoneNumberId: org.whatsappPhoneNumberId || null,
    businessAccountId: org.whatsappBusinessAccountId || null,
    displayPhoneNumber: org.whatsappNumber || null,
    hasToken: Boolean(org.whatsappAccessToken),
  };
}

/** Decrypts the stored tenant token for server-side Graph API use. */
export function getStoredWhatsAppToken(org: { whatsappAccessToken?: string | null }): string | null {
  if (!org.whatsappAccessToken) return null;
  try {
    return decryptCredential(org.whatsappAccessToken);
  } catch {
    return org.whatsappAccessToken;
  }
}

/**
 * Shared guard for integration management routes: requires a signed-in user
 * whose organization role may configure integrations (Owner/Admin/Manager,
 * or a platform Super Admin). Mirrors the Meta auth route's role policy.
 */
export async function requireIntegrationManager(): Promise<
  | { ok: true; organizationId: string; userId: string }
  | { ok: false; status: number; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  const organizationId = (session as any).organizationId;
  if (!organizationId) {
    return { ok: false, status: 400, error: 'Missing organization context' };
  }
  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId: session.user.id },
  });
  const isAuthorized =
    (member && ['OWNER', 'ADMIN', 'MANAGER'].includes(member.role)) ||
    (session.user as any)?.role === 'SUPER_ADMIN';
  if (!isAuthorized) {
    return { ok: false, status: 403, error: 'Only workspace Owners, Admins, or Managers can manage integrations' };
  }
  return { ok: true, organizationId, userId: session.user.id };
}
