import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { decryptCredential } from '@/lib/integrations/meta/crypto';
import { subscribePageToLeadgenWebhook, unsubscribePageFromLeadgenWebhook } from '@/lib/integrations/meta/client';

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
    const { pageId, isActive, subscribeWebhook } = body;

    if (!pageId) {
      return NextResponse.json({ error: 'pageId is required' }, { status: 400 });
    }

    // Tenant boundary: Verify that the page belongs to the tenant
    const page = await db.metaConnectedPage.findFirst({
      where: {
        pageId,
        organizationId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Connected page not found or unauthorized' }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    // Handle webhook subscription toggle if explicitly requested
    if (typeof subscribeWebhook === 'boolean') {
      const pageToken = page.pageAccessToken ? decryptCredential(page.pageAccessToken) : '';
      if (subscribeWebhook && pageToken) {
        const subscribed = await subscribePageToLeadgenWebhook(page.pageId, pageToken);
        updateData.isSubscribed = subscribed;
        updateData.leadAccessStatus = subscribed ? 'ACTIVE' : 'FAILED_PERMISSION';
      } else if (!subscribeWebhook && pageToken) {
        const unsubscribed = await unsubscribePageFromLeadgenWebhook(page.pageId, pageToken);
        updateData.isSubscribed = !unsubscribed;
        updateData.leadAccessStatus = 'UNSUBSCRIBED';
      }
    }

    const updated = await db.metaConnectedPage.update({
      where: { id: page.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, page: updated });
  } catch (err: any) {
    console.error('[Meta Page Toggle] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
