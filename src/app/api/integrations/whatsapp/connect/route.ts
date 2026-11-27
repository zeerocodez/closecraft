import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encryptToken } from '@/lib/integrations/meta/crypto';
import {
  requireIntegrationManager,
  fetchWhatsAppPhoneNumberInfo,
  phoneNumberBelongsToWaba,
  subscribeWabaToApp,
  isWabaSubscribedToApp,
  summarizeWhatsAppConnection,
} from '@/lib/integrations/whatsapp/config';

/**
 * Connects the tenant's own WhatsApp Business number.
 * The admin supplies the Phone Number ID (and optionally the WABA ID) plus a
 * Meta system-user access token. Credentials are validated live against the
 * Graph API before anything is stored, and the token is stored encrypted.
 */
export async function POST(req: Request) {
  try {
    const guard = await requireIntegrationManager();
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const { organizationId } = guard;

    const body = await req.json().catch(() => ({}));
    const phoneNumberId = String(body.phoneNumberId || '').trim();
    const businessAccountId = String(body.businessAccountId || '').trim();
    const accessToken = String(body.accessToken || '').trim();

    if (!/^\d{5,25}$/.test(phoneNumberId)) {
      return NextResponse.json({ error: 'Enter a valid WhatsApp Phone Number ID (digits only, from Meta Business Settings → WhatsApp → API Setup).' }, { status: 400 });
    }
    if (businessAccountId && !/^\d{5,25}$/.test(businessAccountId)) {
      return NextResponse.json({ error: 'The WhatsApp Business Account ID should be digits only.' }, { status: 400 });
    }
    if (!accessToken || accessToken.length < 20) {
      return NextResponse.json({ error: 'Enter the system-user access token generated for your WhatsApp Business Account.' }, { status: 400 });
    }

    // A Phone Number ID routes inbound webhooks to exactly one workspace.
    // Refuse to steal or duplicate another tenant's mapping.
    const clash = await db.organization.findFirst({
      where: {
        whatsappPhoneNumberId: phoneNumberId,
        NOT: { id: organizationId },
      },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json({ error: 'That Phone Number ID is already connected to another workspace. Disconnect it there first.' }, { status: 409 });
    }

    // Validate credentials live before storing anything.
    const info = await fetchWhatsAppPhoneNumberInfo(phoneNumberId, accessToken);

    if (businessAccountId) {
      const belongs = await phoneNumberBelongsToWaba(businessAccountId, phoneNumberId, accessToken);
      // Only a definitive "not listed" blocks the connection. A null result
      // means the listing could not be read with this token (e.g. dashboard
      // temporary tokens) — the phone-number read above already proved the
      // token's access to this number, so proceed.
      if (belongs === false) {
        return NextResponse.json({ error: 'That phone number is not listed under the WhatsApp Business Account ID provided. Check both IDs belong to the same business.' }, { status: 400 });
      }
      // Best-effort subscribe CloseCraft Meta app to this WABA so inbound messages route cleanly
      await fetch(
        `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || 'v21.0'}/${encodeURIComponent(businessAccountId)}/subscribed_apps`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
        }
      ).catch(() => null);
    }

    // Subscribe the WABA to the CloseCraft app so Meta actually delivers
    // inbound messages to our webhook. Without this link the webhook can
    // verify green while every real message is silently withheld — so a
    // definitive refusal from Meta blocks the connection instead of
    // storing a number that can send but never receive. An unverifiable
    // listing (null) does not block: the POST success above is the
    // authoritative confirmation. Without a WABA ID there is nothing to
    // subscribe — the number still connects, but the tenant is warned
    // plainly that inbound will not arrive until they reconnect with it.
    let subscription: {
      attempted: boolean;
      subscribed: boolean;
      verified: boolean | null;
      warning?: string;
    };
    if (businessAccountId) {
      const sub = await subscribeWabaToApp(businessAccountId, accessToken);
      if (!sub.subscribed) {
        return NextResponse.json(
          { error: `WhatsApp number validated, but CloseCraft could not subscribe your WhatsApp Business Account to receive inbound messages: ${sub.error}` },
          { status: 400 },
        );
      }
      const verified = await isWabaSubscribedToApp(businessAccountId, accessToken);
      if (verified === false) {
        return NextResponse.json(
          { error: 'Meta accepted the subscription but the CloseCraft app is not listed on your WhatsApp Business Account yet. Try connecting again — if it persists, subscribe the account from the Meta App Dashboard.' },
          { status: 400 },
        );
      }
      subscription = { attempted: true, subscribed: true, verified };
    } else {
      subscription = {
        attempted: false,
        subscribed: false,
        verified: null,
        warning:
          'Connected without a WhatsApp Business Account ID, so CloseCraft could not subscribe the account to receive inbound messages. Add the WABA ID and reconnect — until then new WhatsApp messages will not reach the inbox.',
      };
    }

    const org = await db.organization.update({
      where: { id: organizationId },
      data: {
        whatsappPhoneNumberId: phoneNumberId,
        whatsappBusinessAccountId: businessAccountId || undefined,
        whatsappAccessToken: encryptToken(accessToken),
        whatsappNumber: info.displayPhoneNumber || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `WhatsApp connected: ${info.verifiedName || 'Business'} ${info.displayPhoneNumber || ''}`.trim(),
      connection: summarizeWhatsAppConnection(org),
      subscription,
      verifiedName: info.verifiedName,
      qualityRating: info.qualityRating,
    });
  } catch (err: any) {
    console.error('[WhatsApp Connect] Error:', err);
    return NextResponse.json({ error: err.message || 'Could not connect WhatsApp. Check the IDs and token and try again.' }, { status: 400 });
  }
}
