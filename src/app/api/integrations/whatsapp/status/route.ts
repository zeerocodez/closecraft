import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  summarizeWhatsAppConnection,
  getStoredWhatsAppToken,
  fetchWhatsAppPhoneNumberInfo,
} from '@/lib/integrations/whatsapp/config';

/**
 * Returns the workspace's WhatsApp connection state. Never exposes the token.
 * With ?live=1 it also re-validates the stored credentials against Meta, so
 * the settings page can show a truthful health state instead of assuming.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: {
        whatsappPhoneNumberId: true,
        whatsappBusinessAccountId: true,
        whatsappNumber: true,
        whatsappAccessToken: true,
      },
    });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const connection = summarizeWhatsAppConnection(org);
    const { searchParams } = new URL(req.url);
    let live: { ok: boolean; verifiedName?: string; qualityRating?: string; error?: string } | undefined;

    if (connection.connected && searchParams.get('live') === '1') {
      const token = getStoredWhatsAppToken(org);
      try {
        const info = await fetchWhatsAppPhoneNumberInfo(connection.phoneNumberId!, token!);
        live = { ok: true, verifiedName: info.verifiedName, qualityRating: info.qualityRating };
      } catch (err: any) {
        live = { ok: false, error: err.message || 'Stored credentials were rejected by Meta' };
      }
    }

    return NextResponse.json({ connection, live });
  } catch (err: any) {
    console.error('[WhatsApp Status] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
