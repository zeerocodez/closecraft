import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { decryptCredential } from '@/lib/integrations/meta/crypto';
import { unsubscribePageFromLeadgenWebhook } from '@/lib/integrations/meta/client';

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

    const integration = await db.metaIntegration.findUnique({
      where: { organizationId },
      include: {
        pages: true,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: 'No active Meta integration found' }, { status: 404 });
    }

    // Attempt to unsubscribe all connected pages from webhook notifications gracefully
    for (const page of integration.pages) {
      try {
        if (page.pageAccessToken) {
          const token = decryptCredential(page.pageAccessToken);
          await unsubscribePageFromLeadgenWebhook(page.pageId, token);
        }
      } catch (unsubErr) {
        console.warn(`[Meta Disconnect] Warning unsubscribing page ${page.pageId}:`, unsubErr);
      }
    }

    // Update integration status to DISCONNECTED and deactivate pages & forms
    await db.$transaction([
      db.metaIntegration.update({
        where: { id: integration.id },
        data: {
          status: 'DISCONNECTED',
          accessToken: '',
          syncEnabled: false,
        },
      }),
      db.metaConnectedPage.updateMany({
        where: { metaIntegrationId: integration.id },
        data: {
          isActive: false,
          isSubscribed: false,
          leadAccessStatus: 'DISCONNECTED',
        },
      }),
      db.metaLeadForm.updateMany({
        where: { metaIntegrationId: integration.id },
        data: {
          isActive: false,
        },
      }),
      db.metaLeadSyncLog.create({
        data: {
          metaIntegrationId: integration.id,
          organizationId,
          status: 'SUCCESS',
          errorMessage: 'Integration disconnected by workspace administrator.',
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Meta Lead Ads integration disconnected successfully.' });
  } catch (err: any) {
    console.error('[Meta Disconnect] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
