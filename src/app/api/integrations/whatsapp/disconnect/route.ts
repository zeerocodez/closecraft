import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireIntegrationManager } from '@/lib/integrations/whatsapp/config';

/** Disconnects the tenant's WhatsApp number and wipes stored credentials. */
export async function POST() {
  try {
    const guard = await requireIntegrationManager();
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    await db.organization.update({
      where: { id: guard.organizationId },
      data: {
        whatsappPhoneNumberId: null,
        whatsappBusinessAccountId: null,
        whatsappAccessToken: null,
      },
    });

    return NextResponse.json({ success: true, message: 'WhatsApp disconnected. Inbound messages to that number will no longer be routed to this workspace.' });
  } catch (err: any) {
    console.error('[WhatsApp Disconnect] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
