import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== 're_dummy_key' ? new Resend(resendApiKey) : null;

// Helper to create an SMTP transporter (Gmail or custom SMTP)
function getSmtpConfig() {
  const gmailUser = process.env.GMAIL_USER || process.env.GMAIL_ADDRESS;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASS;

  if (gmailUser && gmailPass) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''), // Strip spaces from 16-character App Passwords
        },
      }),
      fromEmail: gmailUser,
      isGmail: true,
    };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

  if (smtpHost && smtpUser && smtpPass) {
    return {
      transporter: nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }),
      fromEmail: smtpUser,
      isGmail: false,
    };
  }

  return null;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) {
  const smtpConfig = getSmtpConfig();
  let defaultSender = process.env.EMAIL_FROM || 'Closecraft <info@closecrafthq.com>';
  if (smtpConfig?.isGmail && smtpConfig.fromEmail) {
    defaultSender = `Closecraft <${smtpConfig.fromEmail}>`;
  }
  const sender = from || defaultSender;

  try {
    // 1. Try Gmail / Custom SMTP if configured
    if (smtpConfig) {
      try {
        const info = await smtpConfig.transporter.sendMail({
          from: sender,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ' '),
        });
        console.log(`[SMTP/Gmail Email Dispatched] To: ${to}, MessageId: ${info.messageId}`);
        return { success: true, data: { id: info.messageId }, provider: 'SMTP' };
      } catch (smtpErr: any) {
        console.error('[SMTP Email Delivery Failed]:', smtpErr.message);
        if (smtpConfig.isGmail) {
          console.error('[Gmail SMTP Tip]: Please ensure you use a 16-character Google App Password (not your account password) with GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
        }
        return { success: false, error: smtpErr.message, provider: 'SMTP' };
      }
    }

    // 2. Try Resend if configured
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) {
        console.error('[Resend Email Error]', error);
        return { success: false, error, provider: 'RESEND' };
      }

      console.log(`[Resend Email Dispatched] To: ${to}, Id: ${data?.id}`);
      return { success: true, data, provider: 'RESEND' };
    }

    // 3. Fallback: Log to console in local development / when credentials unconfigured
    console.log('\n======================================================');
    console.log(`[TRANSACTIONAL EMAIL DISPATCH (DEV MOCK)]`);
    console.log(`To: ${to}`);
    console.log(`From: ${sender}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}`);
    console.log('======================================================\n');

    return {
      success: true,
      data: { id: `mock-${Date.now()}` },
      provider: 'DEV_MOCK',
    };
  } catch (err: any) {
    console.error('[sendTransactionalEmail Critical Exception]:', err);
    return { success: false, error: err?.message || 'Unknown email delivery error' };
  }
}
