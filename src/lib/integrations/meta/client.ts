/**
 * Meta Graph API & Marketing API Client for CloseCraft Revenue Engine.
 * Supports Meta Lead Ads, Page subscriptions, Graph API v21.0, and OAuth asset sync.
 */

export const META_GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export interface MetaConfig {
  appId: string;
  appSecret: string;
  verifyToken: string;
}

export function getMetaConfig(): MetaConfig {
  const appId = (process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || '').trim();
  const appSecret = (process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '').trim();
  const verifyToken = (process.env.FACEBOOK_VERIFY_TOKEN || process.env.META_LEAD_ADS_VERIFY_TOKEN || '').trim();

  return { appId, appSecret, verifyToken };
}

export function isMetaAppConfigured(): boolean {
  const { appId, appSecret } = getMetaConfig();
  return Boolean(appId && /^\d{6,25}$/.test(appId) && appSecret);
}

/**
 * Generates the official Meta OAuth authorization URL.
 */
export function getMetaAuthUrl(params: {
  redirectUri: string;
  state: string;
}): string {
  const { appId } = getMetaConfig();
  if (!appId || !/^\d{6,25}$/.test(appId)) {
    throw new Error('META_APP_ID / FACEBOOK_APP_ID is missing or not a valid numeric Meta App ID.');
  }
  
  // Scopes requested for Lead Ads retrieval and asset inspection
  const scopes = [
    'leads_retrieval',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'ads_management',
    'business_management',
  ].join(',');

  const query = new URLSearchParams({
    client_id: appId,
    redirect_uri: params.redirectUri,
    state: params.state,
    scope: scopes,
    response_type: 'code',
  });

  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${query.toString()}`;
}

/**
 * Exchanges an authorization code for a short-lived token, then upgrades it to a 60-day long-lived token.
 */
export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
}): Promise<{
  accessToken: string;
  expiresIn?: number;
  tokenType: string;
}> {
  const { appId, appSecret } = getMetaConfig();

  // 1. Get short-lived token
  const tokenUrl = `${GRAPH_BASE}/oauth/access_token?` + new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: params.redirectUri,
    code: params.code,
  }).toString();

  const res = await fetch(tokenUrl, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Meta OAuth token exchange failed with HTTP ${res.status}`);
  }

  const tokenData = await res.json();
  const shortLivedToken = tokenData.access_token;

  // 2. Exchange for 60-day long-lived access token
  try {
    const exchangeUrl = `${GRAPH_BASE}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    }).toString();

    const longRes = await fetch(exchangeUrl, { headers: { Accept: 'application/json' } });
    if (longRes.ok) {
      const longData = await longRes.json();
      return {
        accessToken: longData.access_token,
        expiresIn: longData.expires_in,
        tokenType: longData.token_type || 'bearer',
      };
    }
  } catch (exchangeErr) {
    console.warn('[MetaClient] Long-lived token exchange warning, using initial token:', exchangeErr);
  }

  return {
    accessToken: shortLivedToken,
    expiresIn: tokenData.expires_in,
    tokenType: tokenData.token_type || 'bearer',
  };
}

/**
 * Retrieves the authenticated Meta User profile.
 */
export async function fetchUserProfile(accessToken: string): Promise<{ id: string; name: string }> {
  const url = `${GRAPH_BASE}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Meta user profile: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Retrieves Business Portfolios accessible by this user.
 */
export async function fetchBusinesses(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  verification_status?: string;
}>> {
  try {
    const url = `${GRAPH_BASE}/me/businesses?fields=id,name,verification_status&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves Facebook Pages accessible by this user with Page Access Tokens.
 */
export async function fetchUserPages(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  access_token: string;
  category?: string;
  tasks?: string[];
}>> {
  const url = `${GRAPH_BASE}/me/accounts?fields=id,name,access_token,category,tasks&limit=100&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Facebook Pages: HTTP ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Retrieves Advertising Accounts accessible by this user.
 */
export async function fetchUserAdAccounts(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  account_id: string;
  currency: string;
  account_status: number;
}>> {
  try {
    const url = `${GRAPH_BASE}/me/adaccounts?fields=id,name,account_id,currency,account_status&limit=100&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

/**
 * Subscribes a Facebook Page to the application's leadgen webhook.
 */
export async function subscribePageToLeadgenWebhook(
  pageId: string,
  pageAccessToken: string
): Promise<boolean> {
  try {
    const url = `${GRAPH_BASE}/${pageId}/subscribed_apps`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscribed_fields: ['leadgen'],
        access_token: pageAccessToken,
      }),
    });

    if (!res.ok) {
      console.warn(`[MetaClient] Subscribing page ${pageId} failed with HTTP ${res.status}`);
      return false;
    }

    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error(`[MetaClient] Error subscribing page ${pageId}:`, err);
    return false;
  }
}

/**
 * Unsubscribes a Facebook Page from the application's webhook.
 */
export async function unsubscribePageFromLeadgenWebhook(
  pageId: string,
  pageAccessToken: string
): Promise<boolean> {
  try {
    const url = `${GRAPH_BASE}/${pageId}/subscribed_apps?access_token=${encodeURIComponent(pageAccessToken)}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/**
 * Retrieves all Lead Generation Forms created under a specific Page.
 */
export async function fetchPageLeadForms(
  pageId: string,
  pageAccessToken: string
): Promise<Array<{
  id: string;
  name: string;
  status: string;
  leads_count?: number;
  questions?: Array<{
    type: string;
    key: string;
    label: string;
  }>;
  created_time?: string;
}>> {
  try {
    const url = `${GRAPH_BASE}/${pageId}/leadgen_forms?fields=id,name,status,leads_count,questions,created_time&limit=100&access_token=${encodeURIComponent(pageAccessToken)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.warn(`[MetaClient] Failed to fetch forms for page ${pageId}: HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    console.error(`[MetaClient] Error fetching lead forms for page ${pageId}:`, err);
    return [];
  }
}

export interface NormalizedLeadData {
  leadId: string;
  createdTime: string;
  formId?: string;
  adId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  budget?: string | null;
  rawResponses: Record<string, string>;
}

/**
 * Retrieves full lead submission details from Meta Graph API and normalizes all fields.
 */
export async function fetchLeadDetails(
  leadgenId: string,
  accessToken: string
): Promise<NormalizedLeadData | null> {
  try {
    const url = `${GRAPH_BASE}/${leadgenId}?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.warn(`[MetaClient] Failed to fetch lead ${leadgenId}: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    let name = '';
    let firstName = '';
    let lastName = '';
    let email = '';
    let phone: string | null = null;
    let companyName: string | null = null;
    let jobTitle: string | null = null;
    let city: string | null = null;
    let state: string | null = null;
    let country: string | null = null;
    let budget: string | null = null;
    const rawResponses: Record<string, string> = {};

    if (Array.isArray(data.field_data)) {
      for (const field of data.field_data) {
        const val = (field.values?.[0] || '').trim();
        const fieldName = (field.name || '').toLowerCase();
        rawResponses[field.name] = val;

        if (fieldName === 'full_name' || fieldName === 'name') {
          name = val;
        } else if (fieldName === 'first_name') {
          firstName = val;
        } else if (fieldName === 'last_name') {
          lastName = val;
        } else if (fieldName === 'email') {
          email = val.toLowerCase();
        } else if (fieldName === 'phone_number' || fieldName === 'phone') {
          phone = val;
        } else if (fieldName === 'company_name' || fieldName === 'company') {
          companyName = val;
        } else if (fieldName === 'job_title' || fieldName === 'title') {
          jobTitle = val;
        } else if (fieldName === 'city') {
          city = val;
        } else if (fieldName === 'state') {
          state = val;
        } else if (fieldName === 'country') {
          country = val;
        } else if (fieldName.includes('budget') || fieldName.includes('revenue')) {
          budget = val;
        }
      }
    }

    if (!name) {
      if (firstName || lastName) {
        name = `${firstName} ${lastName}`.trim();
      } else {
        name = 'Meta Ad Lead';
      }
    }

    if (!email) {
      email = `lead_${leadgenId}@facebook.closecraft.com`;
    }

    return {
      leadId: data.id || leadgenId,
      createdTime: data.created_time || new Date().toISOString(),
      formId: data.form_id,
      adId: data.ad_id,
      name,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email,
      phone,
      companyName,
      jobTitle,
      city,
      state,
      country,
      budget,
      rawResponses,
    };
  } catch (err: any) {
    console.error(`[MetaClient] Error fetching lead ${leadgenId}:`, err.message);
    return null;
  }
}

/**
 * Retrieves advertising attribution (Campaign, AdSet, and Ad names) from Meta Marketing API.
 */
export async function fetchAdAttribution(
  adId: string,
  accessToken: string
): Promise<{
  adId: string;
  adName?: string;
  campaignId?: string;
  campaignName?: string;
  adSetId?: string;
  adSetName?: string;
} | null> {
  if (!adId) return null;

  try {
    const url = `${GRAPH_BASE}/${adId}?fields=id,name,campaign{id,name},adset{id,name}&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      adId: data.id || adId,
      adName: data.name,
      campaignId: data.campaign?.id,
      campaignName: data.campaign?.name,
      adSetId: data.adset?.id,
      adSetName: data.adset?.name,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches historical leads from a specific Meta Lead Form.
 */
export async function fetchHistoricalLeads(
  formId: string,
  pageAccessToken: string,
  options?: {
    since?: number; // Unix timestamp
    until?: number; // Unix timestamp
    limit?: number;
    after?: string;
  }
): Promise<{
  leads: NormalizedLeadData[];
  paging?: { next?: string; cursors?: { after?: string } };
}> {
  const limit = options?.limit || 50;
  const params = new URLSearchParams({
    fields: 'id,created_time,ad_id,form_id,field_data',
    limit: String(limit),
    access_token: pageAccessToken,
  });

  if (options?.since) {
    params.set('filtering', JSON.stringify([{ field: 'time_created', operator: 'GREATER_THAN', value: options.since }]));
  }
  if (options?.after) {
    params.set('after', options.after);
  }

  const url = `${GRAPH_BASE}/${formId}/leads?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch historical leads: HTTP ${res.status}`);
  }

  const data = await res.json();
  const rawList = Array.isArray(data.data) ? data.data : [];

  const leads: NormalizedLeadData[] = rawList.map((item: any) => {
    let name = '';
    let email = '';
    let phone: string | null = null;
    let companyName: string | null = null;
    let jobTitle: string | null = null;
    const rawResponses: Record<string, string> = {};

    if (Array.isArray(item.field_data)) {
      for (const field of item.field_data) {
        const val = (field.values?.[0] || '').trim();
        const fieldName = (field.name || '').toLowerCase();
        rawResponses[field.name] = val;

        if (fieldName === 'full_name' || fieldName === 'name') name = val;
        else if (fieldName === 'email') email = val.toLowerCase();
        else if (fieldName === 'phone_number' || fieldName === 'phone') phone = val;
        else if (fieldName === 'company_name' || fieldName === 'company') companyName = val;
        else if (fieldName === 'job_title' || fieldName === 'title') jobTitle = val;
      }
    }

    return {
      leadId: item.id,
      createdTime: item.created_time || new Date().toISOString(),
      formId: item.form_id || formId,
      adId: item.ad_id,
      name: name || 'Meta Historical Lead',
      email: email || `fb_hist_${item.id}@facebook.closecraft.com`,
      phone,
      companyName,
      jobTitle,
      rawResponses,
    };
  });

  return {
    leads,
    paging: data.paging,
  };
}
