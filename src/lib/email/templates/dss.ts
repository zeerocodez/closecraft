import {
  RenderedEmail,
  DSS01Data,
  DSS02Data,
  DSS03Data,
  DSS04Data,
  DSS05Data,
  DSS06Data,
  DSS07Data,
  DSS08Data,
  DSS09Data,
  DSS10Data,
  DSS11Data,
} from '../types';
import { wrapEmailHtml, escapeHtml, EMAIL_CONFIG } from '../base-layout';

function fallbackName(name?: string) {
  return name && name.trim() ? name.trim() : 'there';
}

function fallbackSupport(url?: string) {
  return url || EMAIL_CONFIG.dss.supportUrl;
}

export function renderDSS01(data: DSS01Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'We’ve received your DSS application';
  const preheader = 'Here’s what happens next.';

  const reviewBlockHtml =
    data.review_required !== false
      ? '<p style="margin: 0 0 16px 0;">Our team will review your application. We’ll email you when there’s an update. This message does not confirm a place or payment.</p>'
      : '<p style="margin: 0 0 16px 0;">You can view your application and the available enrolment steps below.</p>';

  const reviewBlockText =
    data.review_required !== false
      ? 'Our team will review your application. We’ll email you when there’s an update. This message does not confirm a place or payment.'
      : 'You can view your application and the available enrolment steps below.';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">Thanks for applying to <strong>${escapeHtml(data.programme_name)}</strong>.</p>
    <p style="margin: 0 0 16px 0;">We’ve received your application for <strong>${escapeHtml(data.cohort_name)}</strong>.</p>
    ${reviewBlockHtml}
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      Your application reference is <strong>${escapeHtml(data.application_reference)}</strong>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View My Application',
    buttonUrl: data.application_url,
  });

  const text = `Hi ${firstName},

Thanks for applying to ${data.programme_name}.
We’ve received your application for ${data.cohort_name}.

${reviewBlockText}

View My Application: ${data.application_url}

Your application reference is ${data.application_reference}.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-01', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS02(data: DSS02Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your DSS application has been accepted';
  const preheader = 'Review your programme details and complete enrolment.';
  const supportUrl = fallbackSupport(data.support_url);

  const windowHtml = data.offer_expiry_datetime
    ? `<p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B;">Your payment window ends on ${escapeHtml(data.offer_expiry_datetime)}.</p>`
    : '';

  const windowText = data.offer_expiry_datetime
    ? `Your payment window ends on ${data.offer_expiry_datetime}.\n\n`
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      Your application for <strong>${escapeHtml(data.programme_name)}</strong>, <strong>${escapeHtml(data.cohort_name)}</strong>, has been accepted.
    </p>
    <p style="margin: 0 0 16px 0;">
      Review the programme details and your current fee, then complete payment to confirm enrolment under the cohort’s terms.
    </p>
    ${windowHtml}
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      If you have questions before paying, visit <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Review My Offer',
    buttonUrl: data.offer_url,
  });

  const text = `Hi ${firstName},

Your application for ${data.programme_name}, ${data.cohort_name}, has been accepted.

Review the programme details and your current fee, then complete payment to confirm enrolment under the cohort’s terms.

Review My Offer: ${data.offer_url}

${windowText}If you have questions before paying, visit ${supportUrl}.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-02', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS03(data: DSS03Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = `DSS payment received — ${data.order_reference}`;
  const preheader = 'Your payment details are inside.';
  const supportUrl = fallbackSupport(data.support_url);

  const discountHtml = data.discount_amount
    ? `<tr><td><strong>Early bird discount — cohort001:</strong></td><td style="color: #00A86B;">−${escapeHtml(data.discount_amount)}</td></tr>`
    : '';
  const discountText = data.discount_amount
    ? `Early bird discount — cohort001: −${data.discount_amount}\n`
    : '';

  const taxFeeHtml =
    data.tax_or_fee_label && data.tax_or_fee_amount
      ? `<tr><td><strong>${escapeHtml(data.tax_or_fee_label)}:</strong></td><td>${escapeHtml(data.tax_or_fee_amount)}</td></tr>`
      : '';
  const taxFeeText =
    data.tax_or_fee_label && data.tax_or_fee_amount
      ? `${data.tax_or_fee_label}: ${data.tax_or_fee_amount}\n`
      : '';

  const accessStatusHtml =
    data.access_status === 'ACTIVE'
      ? '<p style="margin: 16px 0 0 0; color: #0F172A;"><strong>Your enrolment is confirmed. Your programme access details are available below.</strong></p>'
      : '<p style="margin: 16px 0 0 0; color: #0F172A;"><strong>Your payment is confirmed. We’re preparing your programme access and will email you when it’s ready.</strong></p>';

  const accessStatusText =
    data.access_status === 'ACTIVE'
      ? 'Your enrolment is confirmed. Your programme access details are available below.'
      : 'Your payment is confirmed. We’re preparing your programme access and will email you when it’s ready.';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      We’ve received your payment for <strong>${escapeHtml(data.programme_name)}</strong>, <strong>${escapeHtml(data.cohort_name)}</strong>.
    </p>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0F172A;">Your receipt</h3>
      <table role="presentation" width="100%" border="0" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #334155;">
        <tr><td width="48%"><strong>Programme fee:</strong></td><td>${escapeHtml(data.original_fee)}</td></tr>
        ${discountHtml}
        ${taxFeeHtml}
        <tr style="border-top: 1px solid #E2E8F0;"><td style="padding-top: 6px;"><strong>Amount paid:</strong></td><td style="padding-top: 6px;"><strong>${escapeHtml(data.amount_paid)}</strong></td></tr>
        <tr><td><strong>Payment reference:</strong></td><td>${escapeHtml(data.payment_reference)}</td></tr>
        <tr><td><strong>Order reference:</strong></td><td>${escapeHtml(data.order_reference)}</td></tr>
      </table>
      ${accessStatusHtml}
    </div>

    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      Need help? Visit <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a> and include your order reference.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View My Receipt',
    buttonUrl: data.receipt_url,
  });

  const text = `Hi ${firstName},

We’ve received your payment for ${data.programme_name}, ${data.cohort_name}.

Your receipt
Programme fee: ${data.original_fee}
${discountText}${taxFeeText}Amount paid: ${data.amount_paid}
Payment reference: ${data.payment_reference}
Order reference: ${data.order_reference}

${accessStatusText}

View My Receipt: ${data.receipt_url}

Need help? Visit ${supportUrl} and include your order reference.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-03', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS04(data: DSS04Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = `You’re enrolled in ${data.programme_name}`;
  const preheader = 'Your DSS dashboard is ready.';

  const startHtml = data.start_datetime
    ? `<p style="margin: 0 0 12px 0;"><strong>Programme starts:</strong> ${escapeHtml(data.start_datetime)}.</p>`
    : '<p style="margin: 0 0 12px 0;">We’ll email you when the cohort schedule is confirmed.</p>';

  const startText = data.start_datetime
    ? `Programme starts: ${data.start_datetime}.\n`
    : 'We’ll email you when the cohort schedule is confirmed.\n';

  const scheduleNoteHtml = data.has_live_schedule
    ? '<p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B;">You’ll find the live-session schedule and joining instructions in your dashboard.</p>'
    : '';

  const scheduleNoteText = data.has_live_schedule
    ? 'You’ll find the live-session schedule and joining instructions in your dashboard.\n\n'
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      Your enrolment in <strong>${escapeHtml(data.programme_name)}</strong>, <strong>${escapeHtml(data.cohort_name)}</strong>, is confirmed.
    </p>
    <p style="margin: 0 0 16px 0;">
      Your learner dashboard is ready. Sign in with your Closecraft account to view the available programme materials and instructions.
    </p>
    ${startHtml}
    ${scheduleNoteHtml}
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Open My DSS Dashboard',
    buttonUrl: data.dashboard_url,
  });

  const text = `Hi ${firstName},

Your enrolment in ${data.programme_name}, ${data.cohort_name}, is confirmed.

Your learner dashboard is ready. Sign in with your Closecraft account to view the available programme materials and instructions.

Open My DSS Dashboard: ${data.dashboard_url}

${startText}${scheduleNoteText}DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-04', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS05(data: DSS05Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = `Your DSS cohort schedule ${data.schedule_action_label}`;
  const preheader = `Check the latest dates for ${data.cohort_name}.`;

  const updatedBlockHtml =
    data.schedule_action_label === 'updated' && data.changed_session_title
      ? `<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13px; color: #334155;">
          <strong>Changed session:</strong> ${escapeHtml(data.changed_session_title)}<br>
          <strong>Previous time:</strong> ${escapeHtml(data.previous_datetime || 'N/A')}<br>
          <strong>New time:</strong> ${escapeHtml(data.new_datetime || 'N/A')}
        </div>`
      : '';

  const updatedBlockText =
    data.schedule_action_label === 'updated' && data.changed_session_title
      ? `Changed session: ${data.changed_session_title}. Previous time: ${data.previous_datetime || 'N/A'}. New time: ${data.new_datetime || 'N/A'}.\n\n`
      : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      The schedule for <strong>${escapeHtml(data.cohort_name)}</strong> has been <strong>${escapeHtml(data.schedule_action_label)}</strong>.
    </p>
    ${updatedBlockHtml}
    <p style="margin: 0 0 16px 0;">
      You can view the current workshop dates, times and joining instructions in your dashboard.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      All times in this email use ${escapeHtml(data.display_timezone)}.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View My Schedule',
    buttonUrl: data.schedule_url,
  });

  const text = `Hi ${firstName},

The schedule for ${data.cohort_name} has been ${data.schedule_action_label}.

${updatedBlockText}You can view the current workshop dates, times and joining instructions in your dashboard.

View My Schedule: ${data.schedule_url}

All times in this email use ${data.display_timezone}.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-05', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS06(data: DSS06Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = `DSS session reminder: ${data.session_title}`;
  const preheader = `Your workshop starts on ${data.session_datetime}.`;

  const prepNoteHtml = data.approved_preparation_note
    ? `<p style="margin: 16px 0 0 0; font-size: 13px; color: #0F172A;"><strong>Before the workshop:</strong> ${escapeHtml(data.approved_preparation_note)}</p>`
    : '';

  const prepNoteText = data.approved_preparation_note
    ? `Before the workshop: ${data.approved_preparation_note}\n\n`
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">Your next DSS workshop is <strong>${escapeHtml(data.session_title)}</strong>.</p>
    <p style="margin: 0 0 8px 0;"><strong>When:</strong> ${escapeHtml(data.session_datetime)}</p>
    <p style="margin: 0 0 16px 0;"><strong>Programme:</strong> ${escapeHtml(data.programme_name)}</p>
    <p style="margin: 0 0 16px 0;">
      Open your dashboard for the joining link and any preparation instructions.
    </p>
    ${prepNoteHtml}
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View Session Details',
    buttonUrl: data.session_url,
  });

  const text = `Hi ${firstName},

Your next DSS workshop is ${data.session_title}.
When: ${data.session_datetime}
Programme: ${data.programme_name}

Open your dashboard for the joining link and any preparation instructions.

View Session Details: ${data.session_url}

${prepNoteText}DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-06', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS07(data: DSS07Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your DSS feedback is ready';
  const preheader = `Review feedback for ${data.assignment_title}.`;

  const revisionHtml = data.revision_due_datetime
    ? `<p style="margin: 16px 0 0 0; font-size: 13px; color: #64748B;">Please submit your revision by ${escapeHtml(data.revision_due_datetime)}.</p>`
    : '';

  const revisionText = data.revision_due_datetime
    ? `Please submit your revision by ${data.revision_due_datetime}.\n\n`
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">Feedback is ready for <strong>${escapeHtml(data.assignment_title)}</strong>.</p>
    <p style="margin: 0 0 16px 0;">
      Open your submission to review the assessment and any recommended next steps.
    </p>
    ${revisionHtml}
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View My Feedback',
    buttonUrl: data.feedback_url,
  });

  const text = `Hi ${firstName},

Feedback is ready for ${data.assignment_title}.

Open your submission to review the assessment and any recommended next steps.

View My Feedback: ${data.feedback_url}

${revisionText}DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-07', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS08(data: DSS08Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Action needed on your DSS completion review';
  const preheader = 'Check the items to complete before your final decision.';

  const revisionHtml = data.revision_due_datetime
    ? `<p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B;">Submit the requested updates by ${escapeHtml(data.revision_due_datetime)}.</p>`
    : '';

  const revisionText = data.revision_due_datetime
    ? `Submit the requested updates by ${data.revision_due_datetime}.\n\n`
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      Your completion review for <strong>${escapeHtml(data.programme_name)}</strong> needs a little more work.
    </p>
    <p style="margin: 0 0 16px 0;">
      Open your review to see the required corrections or missing submissions.
    </p>
    ${revisionHtml}
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      Your review will be updated after the required work has been assessed.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View Required Actions',
    buttonUrl: data.completion_review_url,
  });

  const text = `Hi ${firstName},

Your completion review for ${data.programme_name} needs a little more work.

Open your review to see the required corrections or missing submissions.

View Required Actions: ${data.completion_review_url}

${revisionText}Your review will be updated after the required work has been assessed.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-08', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS09(data: DSS09Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your DSS Certificate of Completion is ready';
  const preheader = 'View your certificate and completed programme record.';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">Congratulations on completing <strong>${escapeHtml(data.programme_name)}</strong>.</p>
    <p style="margin: 0 0 16px 0;">
      Your completion has been confirmed, and your Certificate of Completion is ready.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      You can also review your submitted work and completion record in your DSS dashboard.
    </p>
    <p style="margin: 0; font-size: 14px; color: #1E293B;">
      Thank you for the work you put into the programme.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View My Certificate',
    buttonUrl: data.certificate_url,
  });

  const text = `Hi ${firstName},

Congratulations on completing ${data.programme_name}.

Your completion has been confirmed, and your Certificate of Completion is ready.

View My Certificate: ${data.certificate_url}

You can also review your submitted work and completion record in your DSS dashboard.

Thank you for the work you put into the programme.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-09', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS10(data: DSS10Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your DSS payment wasn’t completed';
  const preheader = 'Check your payment status before trying again.';
  const supportUrl = fallbackSupport(data.support_url);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      Your payment for <strong>${escapeHtml(data.programme_name)}</strong> wasn’t completed.
    </p>
    <p style="margin: 0 0 16px 0;">
      Please review the order status and current total before trying again.
    </p>
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      If your bank shows a debit, check the order status or contact <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a> with reference <strong>${escapeHtml(data.order_reference)}</strong> before making another payment.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'Review My Payment',
    buttonUrl: data.order_url,
  });

  const text = `Hi ${firstName},

Your payment for ${data.programme_name} wasn’t completed.

Please review the order status and current total before trying again.

Review My Payment: ${data.order_url}

If your bank shows a debit, check the order status or contact ${supportUrl} with reference ${data.order_reference} before making another payment.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-10', context: 'DSS', subject, preheader, html, text };
}

export function renderDSS11(data: DSS11Data): RenderedEmail {
  const firstName = fallbackName(data.first_name);
  const subject = 'Your DSS refund has been processed';
  const preheader = `Review the refund details for ${data.order_reference}.`;
  const supportUrl = fallbackSupport(data.support_url);

  const accessChangeHtml = data.approved_access_change_message
    ? `<p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B;">${escapeHtml(data.approved_access_change_message)}</p>`
    : '';

  const accessChangeText = data.approved_access_change_message
    ? `${data.approved_access_change_message}\n\n`
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin: 0 0 16px 0;">
      A refund of <strong>${escapeHtml(data.refund_amount)}</strong> has been processed for <strong>${escapeHtml(data.programme_name)}</strong>.
    </p>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0F172A;">Refund details</h3>
      <table role="presentation" width="100%" border="0" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #334155;">
        <tr><td width="48%"><strong>Order reference:</strong></td><td>${escapeHtml(data.order_reference)}</td></tr>
        <tr><td><strong>Refund reference:</strong></td><td>${escapeHtml(data.refund_reference)}</td></tr>
        <tr><td><strong>Refund amount:</strong></td><td>${escapeHtml(data.refund_amount)}</td></tr>
        <tr><td><strong>Processed on:</strong></td><td>${escapeHtml(data.refund_processed_datetime)}</td></tr>
      </table>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748B;">
      Your bank or payment provider determines when the funds appear in your account.
    </p>
    ${accessChangeHtml}
    <p style="margin: 20px 0 12px 0; font-size: 13px; color: #64748B;">
      For questions, visit <a href="${supportUrl}" style="color: #0066FF;">${supportUrl}</a>.
    </p>
  `;

  const html = wrapEmailHtml({
    context: 'DSS',
    subject,
    preheader,
    contentHtml,
    buttonText: 'View Refund Details',
    buttonUrl: data.refund_details_url,
  });

  const text = `Hi ${firstName},

A refund of ${data.refund_amount} has been processed for ${data.programme_name}.

Refund details
Order reference: ${data.order_reference}
Refund reference: ${data.refund_reference}
Refund amount: ${data.refund_amount}
Processed on: ${data.refund_processed_datetime}

Your bank or payment provider determines when the funds appear in your account.

View Refund Details: ${data.refund_details_url}

${accessChangeText}For questions, visit ${supportUrl}.

DSS by Closecraft
${EMAIL_CONFIG.dss.brandName} · ${EMAIL_CONFIG.dss.legalEntityName}`;

  return { templateId: 'DSS-11', context: 'DSS', subject, preheader, html, text };
}

export function renderDSSEmail(templateId: string, data: any): RenderedEmail {
  switch (templateId) {
    case 'DSS-01': return renderDSS01(data);
    case 'DSS-02': return renderDSS02(data);
    case 'DSS-03': return renderDSS03(data);
    case 'DSS-04': return renderDSS04(data);
    case 'DSS-05': return renderDSS05(data);
    case 'DSS-06': return renderDSS06(data);
    case 'DSS-07': return renderDSS07(data);
    case 'DSS-08': return renderDSS08(data);
    case 'DSS-09': return renderDSS09(data);
    case 'DSS-10': return renderDSS10(data);
    case 'DSS-11': return renderDSS11(data);
    default:
      throw new Error(`Unsupported DSS email template: ${templateId}`);
  }
}

