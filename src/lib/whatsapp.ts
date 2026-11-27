/**
 * WhatsApp & Phone Number Normalization Utilities & Outbound Dispatch Service
 * 
 * Supports:
 * - E.164-compatible international phone formatting (Nigerian +234 & Global).
 * - Click-to-chat wa.me link generation.
 * - Official WhatsApp Cloud API outbound message dispatch with tenant-scoped credentials.
 * - 24-hour customer service window verification.
 * - Customer consent and opt-out validation.
 * - Explicit delivery lifecycle tracking (SENT, DELIVERED, FAILED, CANCELLED, DRY_RUN_LOGGED).
 * - Pilot-mode dry-run safeguards.
 */

import { db } from './db';
import { decryptCredential } from './integrations/meta/crypto';

/**
 * Organization tokens are stored encrypted at rest (Meta OAuth callback and
 * the WhatsApp connect route both encrypt). Decrypt before use; values that
 * were stored as legacy plaintext pass through decryptCredential unchanged.
 */
function resolveOrgToken(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    return decryptCredential(stored);
  } catch {
    return stored;
  }
}

export function normalizeWhatsAppNumber(rawPhone: string | null | undefined): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  
  // Extract only numeric digits
  const digits = rawPhone.replace(/[^0-9]/g, '');
  if (!digits) return null;

  // 1. Nigerian 11-digit local format with leading zero (e.g., "08103262248", "08031234567")
  if (digits.length === 11 && digits.startsWith('0')) {
    return '234' + digits.slice(1);
  }

  // 2. Nigerian 10-digit format without leading zero (e.g., "8103262248", "8031234567")
  if (digits.length === 10 && /^[789]/.test(digits)) {
    return '234' + digits;
  }

  // 3. Already prefixed with Nigerian country code 234 (e.g., "2348103262248" or "+2348103262248")
  if (digits.startsWith('234') && digits.length === 13) {
    return digits;
  }

  // 4. Accidental double-prefixed (e.g. "00234..." or "0234...")
  if (digits.startsWith('00234') && digits.length === 15) {
    return digits.slice(2);
  }
  if (digits.startsWith('0234') && digits.length === 14) {
    return digits.slice(1);
  }

  // 5. Standard international numbers with country codes (7 to 15 digits)
  if (digits.length >= 7 && digits.length <= 15) {
    return digits;
  }

  return null;
}

/**
 * Builds a valid WhatsApp click-to-chat URL (wa.me)
 */
export function formatWhatsAppUrl(phone: string | null | undefined, text?: string): string | null {
  const clean = normalizeWhatsAppNumber(phone);
  if (!clean) return null;
  
  const textParam = text && text.trim().length > 0 
    ? `?text=${encodeURIComponent(text.trim())}` 
    : '';
    
  return `https://wa.me/${clean}${textParam}`;
}

/**
 * Formats a phone number for user-friendly display in UI
 */
export function formatPhoneDisplay(rawPhone: string | null | undefined): string {
  if (!rawPhone) return 'Not configured';
  const clean = normalizeWhatsAppNumber(rawPhone);
  if (!clean) return rawPhone;

  if (clean.startsWith('234') && clean.length === 13) {
    return `+234 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }

  return `+${clean}`;
}

export interface SendWhatsAppMessageParams {
  organizationId: string;
  leadId: string;
  recipientPhone: string;
  messageType?: 'text' | 'template';
  text?: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
  conversationId?: string;
  allowOutsideServiceWindow?: boolean;
}

export interface SendWhatsAppMessageResult {
  success: boolean;
  deliveryStatus: 'PENDING' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED' | 'DRY_RUN_LOGGED';
  providerMessageId?: string;
  messageId?: string;
  error?: string;
  dryRun?: boolean;
}

/**
 * Dispatches an outbound WhatsApp message using the official Meta WhatsApp Cloud API.
 * 
 * Safety & Compliance Rules:
 * 1. Checks customer opt-out status (Lead.optedOutOfMarketing). Cancels if opted out.
 * 2. Checks 24-hour customer service window for free-form text. Outside 24h, approved template is required.
 * 3. Enforces Pilot Mode / Dry Run: When WHATSAPP_LIVE_DISPATCH_ENABLED is false,
 *    records message with state 'DRY_RUN_LOGGED' without claiming it was sent externally.
 * 4. Stores real provider message IDs (wamid) and explicit delivery states.
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppMessageParams
): Promise<SendWhatsAppMessageResult> {
  const {
    organizationId,
    leadId,
    recipientPhone,
    messageType = 'text',
    text,
    templateName,
    templateLanguage = 'en_US',
    templateComponents = [],
    conversationId: providedConvId,
  } = params;

  const cleanPhone = normalizeWhatsAppNumber(recipientPhone);
  if (!cleanPhone) {
    return {
      success: false,
      deliveryStatus: 'FAILED',
      error: `Invalid recipient phone number format: "${recipientPhone}"`,
    };
  }

  // 1. Validate Lead Communication Consent & Opt-Out Status
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      optedOutOfMarketing: true,
      organizationId: true,
    },
  });

  if (!lead) {
    return {
      success: false,
      deliveryStatus: 'FAILED',
      error: `Lead record ${leadId} not found`,
    };
  }

  if (lead.optedOutOfMarketing) {
    console.warn(`[WhatsApp Dispatch] Blocked outreach to lead ${leadId}: Customer has opted out of marketing communications.`);
    return {
      success: false,
      deliveryStatus: 'CANCELLED',
      error: 'Customer has opted out of marketing communications (STOP requested).',
    };
  }

  // Ensure conversation exists for tracking
  let convId = providedConvId;
  if (!convId) {
    let conv = await db.conversation.findFirst({
      where: { leadId, organizationId, channel: 'WHATSAPP' },
    });
    if (!conv) {
      conv = await db.conversation.create({
        data: {
          leadId,
          organizationId,
          channel: 'WHATSAPP',
          status: 'ACTIVE',
        },
      });
    }
    convId = conv.id;
  }

  // 2. 24-Hour Customer Service Window Verification
  if (messageType === 'text') {
    const lastCustomerMsg = await db.message.findFirst({
      where: {
        conversationId: convId,
        senderType: 'PROSPECT',
      },
      orderBy: { createdAt: 'desc' },
    });

    const isWindowOpen = lastCustomerMsg 
      ? (Date.now() - new Date(lastCustomerMsg.createdAt).getTime()) < 24 * 60 * 60 * 1000
      : false;

    if (!isWindowOpen && !params.allowOutsideServiceWindow) {
      const errorMsg = 'Outside WhatsApp 24-hour customer service window. WhatsApp Cloud API requires an approved business template for business-initiated conversations.';
      console.warn(`[WhatsApp Dispatch] Window closed for ${cleanPhone}: ${errorMsg}`);
      
      await db.message.create({
        data: {
          conversationId: convId,
          content: text || '[Failed Dispatch: Window Closed]',
          senderType: 'AI',
          status: 'FAILED',
          errorMessage: errorMsg,
        },
      });

      return {
        success: false,
        deliveryStatus: 'FAILED',
        error: errorMsg,
      };
    }
  }

  // 3. Pilot Mode Safety Check (Dry-Run by Default)
  const isLiveDispatchEnabled = process.env.WHATSAPP_LIVE_DISPATCH_ENABLED === 'true';

  if (!isLiveDispatchEnabled) {
    const dryRunId = `dry_run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const loggedContent = messageType === 'template' 
      ? `[WhatsApp Template: ${templateName}] ${text || ''}`.trim()
      : (text || '');

    await db.message.create({
      data: {
        conversationId: convId,
        content: loggedContent,
        senderType: 'AI',
        status: 'DRY_RUN_LOGGED',
        providerMessageId: dryRunId,
      },
    });

    console.log(`[WhatsApp Pilot Dry-Run] Recorded outbound message to +${cleanPhone}: "${loggedContent.slice(0, 80)}" (DeliveryStatus: DRY_RUN_LOGGED)`);

    return {
      success: true,
      deliveryStatus: 'DRY_RUN_LOGGED',
      dryRun: true,
      providerMessageId: dryRunId,
      messageId: dryRunId,
    };
  }

  // 4. Live Cloud API Execution with Organization-Scoped Credentials
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      whatsappAccessToken: true,
      whatsappPhoneNumberId: true,
      metaAccessToken: true,
    },
  });

  const accessToken =
    resolveOrgToken(org?.whatsappAccessToken) ||
    resolveOrgToken(org?.metaAccessToken) ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN;
  const phoneNumberId = org?.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    const credErr = 'Missing WhatsApp Cloud API credentials for organization (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID).';
    console.error(`[WhatsApp Dispatch Error] ${credErr}`);

    await db.message.create({
      data: {
        conversationId: convId,
        content: text || `[Template: ${templateName}]`,
        senderType: 'AI',
        status: 'FAILED',
        errorMessage: credErr,
      },
    });

    return {
      success: false,
      deliveryStatus: 'FAILED',
      error: credErr,
    };
  }

  // Construct Meta Graph API payload
  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: messageType,
  };

  if (messageType === 'text') {
    payload.text = { preview_url: false, body: text };
  } else if (messageType === 'template') {
    payload.template = {
      name: templateName,
      language: { code: templateLanguage },
      components: templateComponents,
    };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  // Retries for transient HTTP errors
  let lastError: string | null = null;
  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.messages?.[0]?.id) {
        const wamid = data.messages[0].id;
        
        // Save message with explicit SENT status (not yet DELIVERED until receipt confirmed)
        await db.message.create({
          data: {
            conversationId: convId,
            content: text || `[Template: ${templateName}]`,
            senderType: 'AI',
            status: 'SENT',
            providerMessageId: wamid,
          },
        });

        console.log(`[WhatsApp Cloud API] Message accepted by Meta for +${cleanPhone} (wamid: ${wamid})`);
        return {
          success: true,
          deliveryStatus: 'SENT',
          providerMessageId: wamid,
          messageId: wamid,
        };
      } else {
        lastError = data.error?.message || `HTTP ${response.status}: ${JSON.stringify(data)}`;
        console.warn(`[WhatsApp Cloud API Attempt ${attempt}/${MAX_ATTEMPTS} Failed]`, lastError);
      }
    } catch (netErr: any) {
      lastError = netErr.message || 'Network request error';
      console.warn(`[WhatsApp Cloud API Network Attempt ${attempt}/${MAX_ATTEMPTS} Failed]`, lastError);
    }
  }

  // Log failed message in database so it remains visible and retryable
  await db.message.create({
    data: {
      conversationId: convId,
      content: text || `[Template: ${templateName}]`,
      senderType: 'AI',
      status: 'FAILED',
      errorMessage: lastError || 'Unknown provider error',
    },
  });

  return {
    success: false,
    deliveryStatus: 'FAILED',
    error: lastError || 'Failed to dispatch WhatsApp message after retry.',
  };
}
