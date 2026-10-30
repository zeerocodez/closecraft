import {
  RenderedEmail,
  CC01Data,
  CC02Data,
  CC03Data,
  CC04Data,
  CC05Data,
  CC06Data,
  CC07Data,
  CC08Data,
  CC09Data,
  CC10Data,
} from '../types';
import { wrapEmailHtml, escapeHtml, EMAIL_CONFIG } from '../base-layout';

function fallbackName(name?: string) {
  return name && name.trim() ? name.trim() : 'there';
}

function fallbackSupport(url?: string) {
  return url || EMAIL_CONFIG.closecraft.supportUrl;
}

export function renderCC01(data: CC01Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = data.verification_code
    ? `${data.verification_code} is your Closecraft verification code`
    : 'Verify your email for Closecraft';
  const preheader = data.verification_code
    ? `Your verification code is ${data.verification_code}. Enter it to activate your workspace.`
    : 'Confirm your address to continue setting up your account.';
  const expiryDesc = data.verification_expiry_description || 'in 24 hours';

  const codeBoxHtml = data.verification_code
    ? `
    <div style="background-color: #0F172A; border: 1px solid #1E293B; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; font-weight: 700;">Your 6-Digit Verification Code</p>
      <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.3em; color: #45bfae; font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; line-height: 1.2;">
        ${escapeHtml(data.verification_code)}
      </div>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748B;">Enter this code on the verification screen to activate your account.</p>
    </div>
    `
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">Please confirm this email address to continue setting up your Closecraft account.</p>
    ${codeBoxHtml}
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      This link and verification code expire ${escapeHtml(expiryDesc)}. If expired, request a new code from the verification screen.
    </p>
    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B;">
      If you didn’t create this account, you can ignore this email.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Verify My Email',
    buttonUrl: data.verification_url,
  });

  const codeBoxText = data.verification_code
    ? `\nYour 6-digit verification code is: ${data.verification_code}\n`
    : '';

  const text = `Hi ${firstName},

Please confirm this email address to continue setting up your Closecraft account.
${codeBoxText}
Verify My Email: ${data.verification_url}

This link and verification code expire ${expiryDesc}. If expired, request a new code from the verification screen.

If you didn’t create this account, you can ignore this email.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}
Support: ${fallbackSupport(data.support_url)}`;

  return { templateId: 'CC-01', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC02(data: CC02Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your Closecraft workspace is ready';
  const preheader = 'Your seven-day Starter trial has started.';
  const supportUrl = fallbackSupport(data.support_url);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">Your workspace, <strong>${escapeHtml(data.workspace_name)}</strong>, is ready.</p>
    <p style="margin: 0 0 16px 0;">
      Your seven-day Starter trial ends on <strong>${escapeHtml(data.trial_end_datetime)}</strong>. No card is required, and you won’t be charged automatically when it ends.
    </p>
    <p style="margin: 0 0 16px 0;">
      Open your workspace to complete setup and start using the features available on your plan.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      To continue with paid features after the trial, choose a plan and complete payment from Billing.
    </p>
    <p style="margin: 0; font-size: 13px; color: #64748B;">
      Need help getting started? Visit <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Open My Workspace',
    buttonUrl: data.dashboard_url,
  });

  const text = `Hi ${firstName},

Your workspace, ${data.workspace_name}, is ready.

Your seven-day Starter trial ends on ${data.trial_end_datetime}. No card is required, and you won’t be charged automatically when it ends.

Open your workspace to complete setup and start using the features available on your plan.

Open My Workspace: ${data.dashboard_url}

To continue with paid features after the trial, choose a plan and complete payment from Billing.

Need help getting started? Visit ${supportUrl}.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-02', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC03(data: CC03Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your Closecraft trial ends tomorrow';
  const preheader = `Review your options before ${data.trial_end_datetime}.`;

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      The Starter trial for <strong>${escapeHtml(data.workspace_name)}</strong> ends on <strong>${escapeHtml(data.trial_end_datetime)}</strong>.
    </p>
    <p style="margin: 0 0 16px 0;">
      If you’d like to keep using paid workspace features, choose a plan and complete payment before then. You won’t be charged automatically.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      If you don’t upgrade, paid features and trial automations will pause when the trial ends. Your account will remain available, with retained records handled under the applicable data policy.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View Plans and Billing',
    buttonUrl: data.billing_url,
  });

  const text = `Hi ${firstName},

The Starter trial for ${data.workspace_name} ends on ${data.trial_end_datetime}.

If you’d like to keep using paid workspace features, choose a plan and complete payment before then. You won’t be charged automatically.

View Plans and Billing: ${data.billing_url}

If you don’t upgrade, paid features and trial automations will pause when the trial ends. Your account will remain available, with retained records handled under the applicable data policy.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-03', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC04(data: CC04Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your Closecraft trial has ended';
  const preheader = 'Choose a plan when you’re ready to continue.';
  const supportUrl = fallbackSupport(data.support_url);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      The Starter trial for <strong>${escapeHtml(data.workspace_name)}</strong> ended on <strong>${escapeHtml(data.trial_end_datetime)}</strong>.
    </p>
    <p style="margin: 0 0 16px 0;">
      Paid features and trial automations are now paused. You have not been charged.
    </p>
    <p style="margin: 0 0 16px 0;">
      You can still sign in to your account and visit Billing to choose a plan.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      For questions about your account or retained records, visit <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Choose a Plan',
    buttonUrl: data.billing_url,
  });

  const text = `Hi ${firstName},

The Starter trial for ${data.workspace_name} ended on ${data.trial_end_datetime}.

Paid features and trial automations are now paused. You have not been charged.

You can still sign in to your account and visit Billing to choose a plan.

Choose a Plan: ${data.billing_url}

For questions about your account or retained records, visit ${supportUrl}.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-04', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC05(data: CC05Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = `Payment received for ${data.workspace_name}`;
  const preheader = `Your ${data.plan_name} plan is active.`;

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      We’ve received <strong>${escapeHtml(data.amount_paid)}</strong> for <strong>${escapeHtml(data.workspace_name)}</strong>. Your ${escapeHtml(data.plan_name)} plan is active.
    </p>
    
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0F172A;">Payment details</h3>
      <table role="presentation" width="100%" border="0" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #334155;">
        <tr><td width="40%"><strong>Plan:</strong></td><td>${escapeHtml(data.plan_name)}</td></tr>
        <tr><td><strong>Billing period:</strong></td><td>${escapeHtml(data.billing_period)}</td></tr>
        <tr><td><strong>Amount paid:</strong></td><td>${escapeHtml(data.amount_paid)}</td></tr>
        <tr><td><strong>Payment reference:</strong></td><td>${escapeHtml(data.payment_reference)}</td></tr>
      </table>
    </div>

    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      You can view your receipt and billing details at <a href="${data.billing_url}" style="color: #0066FF;">${data.billing_url}</a>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Open My Workspace',
    buttonUrl: data.dashboard_url,
  });

  const text = `Hi ${firstName},

We’ve received ${data.amount_paid} for ${data.workspace_name}. Your ${data.plan_name} plan is active.

Payment details:
- Plan: ${data.plan_name}
- Billing period: ${data.billing_period}
- Amount paid: ${data.amount_paid}
- Payment reference: ${data.payment_reference}

Open My Workspace: ${data.dashboard_url}

You can view your receipt and billing details at ${data.billing_url}.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-05', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC06(data: CC06Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your Closecraft payment wasn’t completed';
  const preheader = 'Review your billing details to try again.';
  const supportUrl = fallbackSupport(data.support_url);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      We couldn’t complete the payment of <strong>${escapeHtml(data.amount_due)}</strong> for <strong>${escapeHtml(data.workspace_name)}</strong>.
    </p>
    <p style="margin: 0 0 16px 0;">
      Please open Billing to check the current payment status and try again if needed.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      If your bank shows a debit, check the status before paying again or contact us at <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a> with reference <strong>${escapeHtml(data.order_reference)}</strong>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Review Payment',
    buttonUrl: data.billing_url,
  });

  const text = `Hi ${firstName},

We couldn’t complete the payment of ${data.amount_due} for ${data.workspace_name}.

Please open Billing to check the current payment status and try again if needed.

Review Payment: ${data.billing_url}

If your bank shows a debit, check the status before paying again or contact us at ${supportUrl} with reference ${data.order_reference}.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-06', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC07(data: CC07Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = `Cancellation confirmed for ${data.workspace_name}`;
  const preheader = 'Review when your paid access ends.';
  const supportUrl = fallbackSupport(data.support_url);

  const recurringNote = data.recurring_disabled
    ? '<p style="margin: 0 0 16px 0;">You won’t be charged for another renewal under this subscription.</p>'
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      Your cancellation request for <strong>${escapeHtml(data.workspace_name)}</strong> has been confirmed.
    </p>
    <p style="margin: 0 0 16px 0;">
      Your paid access continues until <strong>${escapeHtml(data.access_end_datetime)}</strong>.
    </p>
    ${recurringNote}
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      If you need help with access or records, visit <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View Billing',
    buttonUrl: data.billing_url,
  });

  const text = `Hi ${firstName},

Your cancellation request for ${data.workspace_name} has been confirmed.

Your paid access continues until ${data.access_end_datetime}.
${data.recurring_disabled ? "You won’t be charged for another renewal under this subscription.\n" : ''}
View Billing: ${data.billing_url}

If you need help with access or records, visit ${supportUrl}.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-07', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC08(data: CC08Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Reset your Closecraft password';
  const preheader = 'Use this secure link to choose a new password.';
  const expiryDesc = data.reset_expiry_description || 'in 1 hour';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">We received a request to reset your password.</p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      This link expires ${escapeHtml(expiryDesc)}.
    </p>
    <p style="margin: 0; font-size: 13px; color: #64748B;">
      If you didn’t request a password reset, you can ignore this email. Your password won’t change unless the reset is completed.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Reset My Password',
    buttonUrl: data.reset_url,
  });

  const text = `Hi ${firstName},

We received a request to reset your password.

Reset My Password: ${data.reset_url}

This link expires ${expiryDesc}.

If you didn’t request a password reset, you can ignore this email. Your password won’t change unless the reset is completed.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-08', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC09(data: CC09Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your Closecraft password was changed';
  const preheader = 'Review this account security update.';
  const supportUrl = fallbackSupport(data.support_url);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      Your Closecraft password was changed on <strong>${escapeHtml(data.security_event_datetime)}</strong>.
    </p>
    <p style="margin: 0 0 16px 0;">If you made this change, no action is needed.</p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      If you don’t recognize it, visit <a href="${data.account_recovery_url}" style="color: #0066FF;">account recovery</a> immediately to secure your account or contact <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Secure My Account',
    buttonUrl: data.account_recovery_url,
  });

  const text = `Hi ${firstName},

Your Closecraft password was changed on ${data.security_event_datetime}.

If you made this change, no action is needed.

If you don’t recognize it, visit ${data.account_recovery_url} immediately to secure your account or contact ${supportUrl}.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-09', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderCC10(data: CC10Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = `You’re invited to ${data.workspace_name} on Closecraft`;
  const preheader = 'Review your invitation and join the workspace.';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      <strong>${escapeHtml(data.inviter_name)}</strong> has invited you to join <strong>${escapeHtml(data.workspace_name)}</strong> on Closecraft as <strong>${escapeHtml(data.invited_role_label)}</strong>.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      The invitation expires on ${escapeHtml(data.invitation_expiry_datetime)}.
    </p>
    <p style="margin: 0; font-size: 13px; color: #64748B;">
      Accept only if you recognize the workspace and expected this invitation. If it wasn’t intended for you, you can ignore it.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'CLOSECRAFT',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Review Invitation',
    buttonUrl: data.invitation_url,
  });

  const text = `Hi ${firstName},

${data.inviter_name} has invited you to join ${data.workspace_name} on Closecraft as ${data.invited_role_label}.

Review Invitation: ${data.invitation_url}

The invitation expires on ${data.invitation_expiry_datetime}.

Accept only if you recognize the workspace and expected this invitation. If it wasn’t intended for you, you can ignore it.

Closecraft
${EMAIL_CONFIG.closecraft.brandName} · ${EMAIL_CONFIG.closecraft.legalEntityName}`;

  return { templateId: 'CC-10', context: 'CLOSECRAFT', subject, preheader, html, text };
}

export function renderClosecraftEmail(templateId: string, data: any): RenderedEmail {
  switch (templateId) {
    case 'CC-01': return renderCC01(data);
    case 'CC-02': return renderCC02(data);
    case 'CC-03': return renderCC03(data);
    case 'CC-04': return renderCC04(data);
    case 'CC-05': return renderCC05(data);
    case 'CC-06': return renderCC06(data);
    case 'CC-07': return renderCC07(data);
    case 'CC-08': return renderCC08(data);
    case 'CC-09': return renderCC09(data);
    case 'CC-10': return renderCC10(data);
    default:
      throw new Error(`Unsupported Closecraft email template: ${templateId}`);
  }
}

