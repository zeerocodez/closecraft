import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import { renderClosecraftEmail } from './templates/closecraft';
import { renderDSSEmail } from './templates/dss';
import { EmailRenderResult, ClosecraftTemplateId, DSSTemplateId } from './types';

export type SendEmailOptions = {
  templateId: ClosecraftTemplateId | DSSTemplateId;
  recipientEmail: string;
  recipientName?: string;
  data: Record<string, any>;
  deduplicationKey?: string;
  organizationId?: string;
  sourceEvent?: string;
  testModeOverride?: boolean;
};

export type SendEmailResult = {
  success: boolean;
  status: 'SENT' | 'DEDUPLICATED' | 'BLOCKED_TEST_MODE' | 'FAILED' | 'MISSING_DATA';
  messageId?: string;
  error?: string;
  rendered?: {
    subject: string;
    preheader: string;
    html: string;
    text: string;
  };
};

/**
 * Universal email renderer for all 21 Closecraft and DSS transactional templates.
 */
export function renderEmail(
  templateId: ClosecraftTemplateId | DSSTemplateId,
  data: Record<string, any>
): EmailRenderResult {
  if (templateId.startsWith('CC-')) {
    return renderClosecraftEmail(templateId as ClosecraftTemplateId, data as any);
  } else if (templateId.startsWith('DSS-')) {
    return renderDSSEmail(templateId as DSSTemplateId, data as any);
  }
  throw new Error(`Unknown transactional email template ID: ${templateId}`);
}

/**
 * Dispatch transactional email event with deduplication, audit logging,
 * test allowlisting, and resilient non-blocking failure isolation.
 */
export async function sendTransactionalEmailEvent(options: SendEmailOptions): Promise<SendEmailResult> {
  const {
    templateId,
    recipientEmail,
    recipientName,
    data,
    deduplicationKey,
    organizationId,
    sourceEvent,
    testModeOverride = false,
  } = options;

  const cleanEmail = recipientEmail.trim().toLowerCase();
  const isDSS = templateId.startsWith('DSS-');
  const context = isDSS ? 'DSS' : 'CLOSECRAFT';

  try {
    // 1. Deduplication Check
    if (deduplicationKey) {
      const existing = await db.transactionalEmailLog.findUnique({
        where: { deduplicationKey },
      });

      if (existing) {
        return {
          success: true,
          status: 'DEDUPLICATED',
          messageId: existing.providerId || existing.id,
        };
      }
    }

    // 2. Render Template
    const rendered = renderEmail(templateId, data);

    // 3. Test Mode / Allowlist enforcement
    const isTestMode = process.env.EMAIL_TEST_MODE === 'true';
    const allowlist = (process.env.EMAIL_ALLOWLIST || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (isTestMode && !testModeOverride && allowlist.length > 0) {
      const isAllowed = allowlist.some((allowed) =>
        allowed.startsWith('@') ? cleanEmail.endsWith(allowed) : cleanEmail === allowed
      );

      if (!isAllowed) {
        if (deduplicationKey) {
          await db.transactionalEmailLog.create({
            data: {
              deduplicationKey,
              context,
              templateId,
              recipient: cleanEmail,
              subject: rendered.subject,
              status: 'BLOCKED_TEST_MODE',
              errorMessage: `Recipient ${cleanEmail} not in EMAIL_ALLOWLIST during test mode.`,
              metadata: JSON.stringify({
                recipientName,
                organizationId,
                sourceEvent: sourceEvent || templateId,
              }),
            },
          });
        }

        return {
          success: true,
          status: 'BLOCKED_TEST_MODE',
          rendered,
        };
      }
    }

    // 4. Sender Resolution based on Brand Context
    const senderDisplay = isDSS ? 'DSS by Closecraft' : 'Closecraft';
    const senderAddress = process.env.EMAIL_FROM_ADDRESS || 'info@closecrafthq.com';
    const from = `${senderDisplay} <${senderAddress}>`;

    // 5. Send Email via Resend / Gmail SMTP / Configured Transport
    const delivery = await sendTransactionalEmail({
      to: cleanEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      from,
    });

    const isSuccess = delivery.success;
    const providerId = (delivery as any).data?.id || ((delivery as any).mock ? 'mock-id' : undefined);
    const errorMessage = !isSuccess ? JSON.stringify((delivery as any).error) : undefined;

    // 6. Record Audit Log
    if (deduplicationKey) {
      await db.transactionalEmailLog.create({
        data: {
          deduplicationKey,
          context,
          templateId,
          recipient: cleanEmail,
          subject: rendered.subject,
          status: isSuccess ? 'SENT' : 'FAILED',
          providerId,
          errorMessage,
          metadata: JSON.stringify({
            recipientName,
            organizationId,
            sourceEvent: sourceEvent || templateId,
            sentAt: new Date().toISOString(),
          }),
        },
      });
    }

    return {
      success: isSuccess,
      status: isSuccess ? 'SENT' : 'FAILED',
      messageId: providerId,
      error: errorMessage,
      rendered,
    };
  } catch (err: any) {
    console.error(`[Transactional Email Error: ${templateId}]`, err);

    if (deduplicationKey) {
      try {
        await db.transactionalEmailLog.create({
          data: {
            deduplicationKey,
            context,
            templateId,
            recipient: cleanEmail,
            subject: `[Failed Render] ${templateId}`,
            status: 'FAILED',
            errorMessage: err.message || String(err),
            metadata: JSON.stringify({
              recipientName,
              organizationId,
              sourceEvent: sourceEvent || templateId,
            }),
          },
        });
      } catch (logErr) {
        console.error('[Transactional Email Log Failure]', logErr);
      }
    }

    return {
      success: false,
      status: 'FAILED',
      error: err.message || 'Unknown email service failure',
    };
  }
}
