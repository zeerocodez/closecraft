import { EmailContext } from './types';

export const EMAIL_CONFIG = {
  closecraft: {
    brandName: 'Closecraft',
    legalEntityName: 'Zeerocodes Automation Limited',
    from: process.env.EMAIL_FROM || 'Closecraft <info@closecrafthq.com>',
    replyTo: 'info@closecrafthq.com',
    supportUrl: 'https://www.closecrafthq.com/terms',
    primaryColor: '#0066FF',
    accentColor: '#38BDF8',
  },
  dss: {
    brandName: 'DSS by Closecraft',
    legalEntityName: 'Zeerocodes Automation Limited',
    from: process.env.DSS_EMAIL_FROM || 'DSS by Closecraft <dss@closecrafthq.com>',
    replyTo: 'dss@closecrafthq.com',
    supportUrl: 'https://www.closecrafthq.com/terms',
    primaryColor: '#0066FF',
    accentColor: '#45BFAE',
  },
};

export function wrapEmailHtml({
  context,
  subject,
  preheader,
  contentHtml,
  buttonText,
  buttonUrl,
  signOffBrand,
}: {
  context: EmailContext;
  subject: string;
  preheader: string;
  contentHtml: string;
  buttonText?: string;
  buttonUrl?: string;
  signOffBrand?: string;
}): string {
  const cfg = context === 'DSS' ? EMAIL_CONFIG.dss : EMAIL_CONFIG.closecraft;
  const brand = signOffBrand || cfg.brandName;

  const buttonSection =
    buttonText && buttonUrl
      ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 16px 0;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: ${cfg.primaryColor};">
          <a href="${buttonUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px;">
            ${buttonText}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 24px 0; font-size: 12px; color: #64748B; word-break: break-all;">
      Or visit: <a href="${buttonUrl}" style="color: ${cfg.primaryColor}; text-decoration: underline;">${buttonUrl}</a>
    </p>
  `
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <!-- Preheader preview text (hidden in display) -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    ${escapeHtml(preheader)}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04); overflow: hidden;">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 24px 32px; background-color: #071126; border-bottom: 3px solid ${cfg.primaryColor};">
              <span style="font-size: 18px; font-weight: bold; color: #ffffff; letter-spacing: -0.02em;">
                ${escapeHtml(cfg.brandName)}
              </span>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #1E293B;">
              ${contentHtml}
              ${buttonSection}
              <p style="margin: 24px 0 0 0; font-size: 14px; color: #475569;">
                ${escapeHtml(brand)}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F1F5F9; border-top: 1px solid #E2E8F0; font-size: 12px; line-height: 1.5; color: #64748B;">
              <div>
                <strong>${escapeHtml(cfg.brandName)}</strong> · ${escapeHtml(cfg.legalEntityName)}
              </div>
              <div style="margin-top: 4px;">
                Support & Terms: <a href="${cfg.supportUrl}" style="color: ${cfg.primaryColor}; text-decoration: underline;">${cfg.supportUrl}</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
