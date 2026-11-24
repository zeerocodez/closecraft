import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  exchangeCodeForTokens, 
  fetchUserProfile, 
  fetchBusinesses, 
  fetchUserPages, 
  fetchUserAdAccounts, 
  fetchPageLeadForms, 
  subscribePageToLeadgenWebhook 
} from '@/lib/integrations/meta/client';
import { encryptToken } from '@/lib/integrations/meta/crypto';
import crypto from 'crypto';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorReason = url.searchParams.get('error_reason') || url.searchParams.get('error_description') || url.searchParams.get('error');

  const baseSettingsUrl = new URL('/settings', url.origin);

  if (errorReason) {
    console.warn('[MetaCallback] User cancelled or Meta rejected authorization:', errorReason);
    baseSettingsUrl.searchParams.set('meta_error', encodeURIComponent(errorReason));
    return NextResponse.redirect(baseSettingsUrl);
  }

  if (!code || !state) {
    baseSettingsUrl.searchParams.set('meta_error', 'MissingCodeOrState');
    return NextResponse.redirect(baseSettingsUrl);
  }

  // 1. Validate State Signature
  let organizationId = '';
  let userId = '';

  try {
    const secret = process.env.AUTH_SECRET || 'closecraft_default_meta_vault_secret_2026';
    const rawState = Buffer.from(state, 'base64url').toString('utf8');
    const { payload, signature } = JSON.parse(rawState);

    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (signature !== expectedSignature) {
      throw new Error('Invalid state signature');
    }

    const stateData = JSON.parse(payload);
    // 15-minute validity window
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      throw new Error('OAuth state expired');
    }

    organizationId = stateData.organizationId;
    userId = stateData.userId;
  } catch (err: any) {
    console.error('[MetaCallback] State verification error:', err.message);
    baseSettingsUrl.searchParams.set('meta_error', 'InvalidStateVerification');
    return NextResponse.redirect(baseSettingsUrl);
  }

  try {
    const redirectUri = `${url.origin}/api/integrations/meta/callback`;

    // 2. Exchange authorization code for tokens
    const { accessToken, expiresIn } = await exchangeCodeForTokens({
      code,
      redirectUri,
    });

    const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    const encryptedAccessToken = encryptToken(accessToken);

    // 3. Fetch User profile and Business Portfolios
    const [metaUser, businesses, pages, adAccounts] = await Promise.all([
      fetchUserProfile(accessToken).catch(() => ({ id: '', name: 'Meta User' })),
      fetchBusinesses(accessToken).catch(() => []),
      fetchUserPages(accessToken).catch(() => []),
      fetchUserAdAccounts(accessToken).catch(() => []),
    ]);

    const primaryBusiness = businesses[0];

    // 4. Upsert MetaIntegration record for tenant
    const metaIntegration = await db.metaIntegration.upsert({
      where: { organizationId },
      update: {
        metaUserId: metaUser.id || null,
        metaUserName: metaUser.name || null,
        accessToken: encryptedAccessToken,
        tokenExpiresAt,
        businessPortfolioId: primaryBusiness?.id || null,
        businessPortfolioName: primaryBusiness?.name || null,
        status: 'CONNECTED',
        syncEnabled: true,
        lastError: null,
      },
      create: {
        organizationId,
        metaUserId: metaUser.id || null,
        metaUserName: metaUser.name || null,
        accessToken: encryptedAccessToken,
        tokenExpiresAt,
        businessPortfolioId: primaryBusiness?.id || null,
        businessPortfolioName: primaryBusiness?.name || null,
        status: 'CONNECTED',
        syncEnabled: true,
      },
    });

    // 5. Connect Pages & Subscribe to Webhook
    let subscribedPageCount = 0;
    let discoveredFormCount = 0;

    for (const page of pages) {
      const encryptedPageToken = encryptToken(page.access_token);
      
      // Attempt subscribing the page to the app's leadgen webhook
      const isSubscribed = await subscribePageToLeadgenWebhook(page.id, page.access_token);
      if (isSubscribed) subscribedPageCount++;

      const connectedPage = await db.metaConnectedPage.upsert({
        where: {
          organizationId_pageId: {
            organizationId,
            pageId: page.id,
          },
        },
        update: {
          metaIntegrationId: metaIntegration.id,
          pageName: page.name,
          pageAccessToken: encryptedPageToken,
          isSubscribed,
          subscribedAt: isSubscribed ? new Date() : undefined,
          isActive: true,
          leadAccessStatus: 'ACTIVE',
        },
        create: {
          organizationId,
          metaIntegrationId: metaIntegration.id,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: encryptedPageToken,
          isSubscribed,
          subscribedAt: isSubscribed ? new Date() : undefined,
          isActive: true,
          leadAccessStatus: 'ACTIVE',
        },
      });

      // 6. Discover Lead Forms under this page
      const forms = await fetchPageLeadForms(page.id, page.access_token);
      for (const form of forms) {
        discoveredFormCount++;
        await db.metaLeadForm.upsert({
          where: {
            organizationId_formId: {
              organizationId,
              formId: form.id,
            },
          },
          update: {
            metaIntegrationId: metaIntegration.id,
            connectedPageId: connectedPage.id,
            formName: form.name,
            pageId: page.id,
            pageName: page.name,
            status: form.status || 'ACTIVE',
            leadsCount: form.leads_count || 0,
            customQuestions: form.questions ? JSON.stringify(form.questions) : null,
          },
          create: {
            organizationId,
            metaIntegrationId: metaIntegration.id,
            connectedPageId: connectedPage.id,
            formId: form.id,
            formName: form.name,
            pageId: page.id,
            pageName: page.name,
            status: form.status || 'ACTIVE',
            leadsCount: form.leads_count || 0,
            customQuestions: form.questions ? JSON.stringify(form.questions) : null,
            isActive: true,
          },
        });
      }
    }

    // 7. Connect Ad Accounts
    for (const adAccount of adAccounts) {
      await db.metaAdAccount.upsert({
        where: {
          organizationId_adAccountId: {
            organizationId,
            adAccountId: adAccount.id,
          },
        },
        update: {
          metaIntegrationId: metaIntegration.id,
          name: adAccount.name || adAccount.id,
          currency: adAccount.currency || 'USD',
          accountStatus: adAccount.account_status || 1,
          isActive: true,
        },
        create: {
          organizationId,
          metaIntegrationId: metaIntegration.id,
          adAccountId: adAccount.id,
          name: adAccount.name || adAccount.id,
          currency: adAccount.currency || 'USD',
          accountStatus: adAccount.account_status || 1,
          isActive: true,
        },
      });
    }

    // 8. Update primary Page ID on organization for backward compatibility
    if (pages.length > 0) {
      await db.organization.update({
        where: { id: organizationId },
        data: {
          facebookPageId: pages[0].id,
          metaAccessToken: encryptToken(pages[0].access_token),
        },
      });
    }

    // Redirect to settings with success metrics
    baseSettingsUrl.searchParams.set('meta_success', 'true');
    baseSettingsUrl.searchParams.set('meta_pages', String(pages.length));
    baseSettingsUrl.searchParams.set('meta_forms', String(discoveredFormCount));
    return NextResponse.redirect(baseSettingsUrl);
  } catch (error: any) {
    console.error('[MetaCallback] Integration processing error:', error);
    baseSettingsUrl.searchParams.set('meta_error', encodeURIComponent(error.message || 'OAuthProcessingFailed'));
    return NextResponse.redirect(baseSettingsUrl);
  }
}
