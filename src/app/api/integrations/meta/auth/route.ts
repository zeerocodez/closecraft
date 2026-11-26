import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getMetaAuthUrl, getMetaConfig, isMetaAppConfigured } from '@/lib/integrations/meta/client';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login?error=Unauthorized', req.url));
    }

    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.redirect(new URL('/settings?error=NoOrganization', req.url));
    }

    // Role check: Only Owner, Admin, or Manager can configure native Meta integration
    const member = await db.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    const isAuthorized = member && ['OWNER', 'ADMIN', 'MANAGER'].includes(member.role) || (session.user as any)?.role === 'SUPER_ADMIN';
    if (!isAuthorized) {
      return NextResponse.redirect(new URL('/settings?error=ForbiddenMetaIntegration', req.url));
    }

    const { appId, appSecret } = getMetaConfig();
    if (!appId || !/^\d{6,25}$/.test(appId) || !appSecret || !isMetaAppConfigured()) {
      console.warn('[MetaAuth] META_APP_ID / META_APP_SECRET missing or invalid in environment configuration.');
      return NextResponse.redirect(new URL('/settings?meta_error=MetaAppCredentialsMissing#meta-ads', req.url));
    }

    // Compute redirect URI dynamically based on current host
    const url = new URL(req.url);
    const redirectUri = `${url.origin}/api/integrations/meta/callback`;

    // Sign state payload containing organizationId, userId, and timestamp
    const secret = process.env.AUTH_SECRET || 'closecraft_default_meta_vault_secret_2026';
    const payload = JSON.stringify({
      organizationId,
      userId: session.user.id,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex'),
    });
    
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const state = Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');

    const metaDialogUrl = getMetaAuthUrl({
      redirectUri,
      state,
    });

    return NextResponse.redirect(metaDialogUrl);
  } catch (error: any) {
    console.error('[MetaAuth] Initiation error:', error);
    return NextResponse.redirect(new URL('/settings?error=MetaAuthInitFailed', req.url));
  }
}
