/**
 * Closecraft Welcome Sequence V1 Email Templates
 *
 * Sequence steps:
 * 1. SHARED_WELCOME (Day 0 - Immediate): Shared welcome + track orientation
 *
 * Business Track:
 * 2. BIZ_02 (Day 2 at 10am): Where most sales conversations fall apart
 * 3. BIZ_03 (Day 4 at 10am): The Next Best Action framework
 * 4. BIZ_04 (Day 7 at 10am): How growing teams stop revenue leakage
 * 5. BIZ_05 (Day 10 at 10am): Put your follow-up to the test (7-day Starter trial)
 *
 * Learning Track (DSS):
 * 2. DSS_02 (Day 2 at 10am): The remote sales qualification standard
 * 3. DSS_03 (Day 4 at 10am): Practicing difficult conversations before buyer calls
 * 4. DSS_04 (Day 7 at 10am): Building a verifiable sales portfolio
 * 5. DSS_05 (Day 10 at 10am): Ready to sprint? Next DSS cohort details
 */

export interface WelcomeEmailData {
  first_name?: string;
  email: string;
  unsubscribe_url?: string;
  preference_url?: string;
  app_url?: string;
  dss_url?: string;
  trial_url?: string;
}

export interface RenderedWelcomeEmail {
  messageKey: string;
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function wrapMarketingEmailHtml({
  subject,
  preheader,
  contentHtml,
  unsubscribeUrl,
  preferenceUrl,
}: {
  subject: string;
  preheader: string;
  contentHtml: string;
  unsubscribeUrl: string;
  preferenceUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #070A0E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0D131F; border-radius: 12px; border: 1px solid #1E293B; overflow: hidden; }
    .header { padding: 32px 32px 24px; text-align: left; border-bottom: 1px solid #1E293B; background: #070A0E; }
    .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #CBD5E1; }
    .footer { padding: 24px 32px; font-size: 12px; line-height: 1.5; color: #64748B; border-top: 1px solid #1E293B; text-align: left; }
    .button { display: inline-block; padding: 12px 24px; background-color: #248277; color: #ffffff !important; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px; margin: 16px 0; }
    .card { background-color: #131C2E; border: 1px solid #1E293B; border-radius: 8px; padding: 16px; margin: 16px 0; }
    a { color: #38BDF8; text-decoration: underline; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #070A0E; padding: 24px 12px;">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <span style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px; color: #FFFFFF;">
              Closecraft<span style="color: #248277;">.</span>
            </span>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; color: #94A3B8;">
              <strong>Closecraft</strong> · Practical sales follow-up software & enablement.
            </p>
            <p style="margin: 0 0 12px 0;">
              By Zeerocodes Automation Limited · Lagos, Nigeria.
            </p>
            <p style="margin: 0 0 8px 0;">
              You received this email because you confirmed your subscription to Closecraft sales lessons.
            </p>
            <p style="margin: 0;">
              <a href="${escapeHtml(unsubscribeUrl)}" style="color: #94A3B8;">Unsubscribe with one click</a>
              ${preferenceUrl ? ` · <a href="${escapeHtml(preferenceUrl)}" style="color: #94A3B8;">Update email preferences</a>` : ''}
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// STEP 1: SHARED WELCOME (Day 0 - Immediate)
// -----------------------------------------------------------------------------
export function renderSharedWelcome(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const preferenceUrl = data.preference_url || 'https://www.closecrafthq.com/preferences';
  const subject = 'Welcome to Closecraft — practical sales lessons each week';
  const preheader = 'Here is what to expect, plus your first practical follow-up example.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Thank you for subscribing to Closecraft sales lessons.</p>
    <p>Every week, we share practical examples of how modern sales teams work their leads, prevent forgotten follow-up, and guide prospects from initial enquiry to a clear buying decision.</p>

    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">What you'll receive</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Follow-up message examples you can adapt directly for WhatsApp and email</li>
        <li>How to identify why deals stall and when to assign a next action</li>
        <li>Practical appointment-setting and qualification frameworks</li>
      </ul>
    </div>

    <p><strong>Choose your preferred learning track:</strong></p>
    <p>To ensure you get the most relevant lessons, let us know what you want to focus on:</p>
    <ul>
      <li><strong>Business track:</strong> Best if you manage enquiries, lead follow-up, or sales reps for a business.</li>
      <li><strong>Learning track (DSS):</strong> Best if you are developing your own remote appointment-setting and sales closing skills.</li>
    </ul>

    <p style="margin-top: 24px;">
      <a href="${escapeHtml(preferenceUrl)}" class="button">Set Your Track Preference</a>
    </p>

    <p style="font-size: 13px; color: #94A3B8;">
      If you don't choose a track, we'll send our core business follow-up lessons. You can update this at any time.
    </p>

    <p>Best regards,<br><strong>Closecraft Editorial Team</strong></p>
  `;

  const text = `Hi ${firstName},

Thank you for subscribing to Closecraft sales lessons.

Every week, we share practical examples of how modern sales teams work their leads, prevent forgotten follow-up, and guide prospects from initial enquiry to a clear buying decision.

WHAT YOU'LL RECEIVE:
- Follow-up message examples you can adapt directly for WhatsApp and email
- How to identify why deals stall and when to assign a next action
- Practical appointment-setting and qualification frameworks

CHOOSE YOUR PREFERRED LEARNING TRACK:
Set your preference here: ${preferenceUrl}
1. Business track: Best if you manage enquiries, lead follow-up, or sales reps for a business.
2. Learning track (DSS): Best if you are developing your own remote appointment-setting and sales closing skills.

If you don't choose a track, we'll send our core business follow-up lessons. You can update this at any time.

Best regards,
Closecraft Editorial Team

Unsubscribe: ${unsubscribeUrl}
Zeerocodes Automation Limited · Lagos, Nigeria
`;

  return {
    messageKey: 'SHARED_WELCOME',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl, preferenceUrl }),
    text,
  };
}

// -----------------------------------------------------------------------------
// BUSINESS TRACK (Steps 2–5)
// -----------------------------------------------------------------------------
export function renderBiz02(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'Where most sales conversations fall apart';
  const preheader = 'The 32-minute window and why follow-up gets dropped.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>When an inbound enquiry arrives, prospect attention is at its peak. Yet in over 70% of growing sales teams, enquiries sit unassigned for hours or days.</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">The two fatal bottlenecks:</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li><strong>No clear owner:</strong> When multiple people look at an inbox, everyone assumes someone else is handling it.</li>
        <li><strong>No scheduled next step:</strong> Reps say "I'll check back later", but without a timestamped action, "later" becomes never.</li>
      </ol>
    </div>
    <p>Tomorrow, inspect your current leads. Ask: <em>Does every active prospect have an unambiguous owner and a scheduled next action due date?</em></p>
    <p>Best regards,<br>Closecraft Team</p>
  `;

  return {
    messageKey: 'BIZ_02',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nWhere most sales conversations fall apart: No clear owner, and no scheduled next step.\n\nInspect your pipeline: does every lead have an owner and a due date?\n\nClosecraft Team\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

export function renderBiz03(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'The Next Best Action framework';
  const preheader = 'Never leave an enquiry without a scheduled next step.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>A CRM should not be a static graveyard of contacts. Every viable lead must have a clear state, a measurable opportunity, and a deterministically assigned Next Best Action.</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">The 3 deterministic actions:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>RESPOND:</strong> Unanswered inbound question or active prospect reply requiring immediate answer.</li>
        <li><strong>ESCALATE:</strong> Complex commercial objection, pricing dispute, or enterprise authority requirement.</li>
        <li><strong>WAIT:</strong> Scheduled follow-up with clear SLA trigger (e.g., waiting for client budget sign-off on Thursday).</li>
      </ul>
    </div>
    <p>When your reps log into their daily view, they shouldn't wonder what to do. The system should tell them: <em>Priority → Reason → Action → Outcome.</em></p>
    <p>Best regards,<br>Closecraft Team</p>
  `;

  return {
    messageKey: 'BIZ_03',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nThe Next Best Action framework: RESPOND, ESCALATE, or WAIT.\n\nEvery viable lead requires a clear next action with a due timestamp.\n\nClosecraft Team\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

export function renderBiz04(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'How growing teams stop revenue leakage';
  const preheader = 'Real examples of deals rescued from forgotten inboxes.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Revenue leakage doesn't happen because sales reps don't care. It happens because conversations fragment across WhatsApp, email threads, notes, and unrecorded calls.</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">The 3 signs of revenue leakage:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Proposals sent without an agreed review date</li>
        <li>Promising leads going cold after one unanswered message</li>
        <li>No visibility into stalled deals until month-end review</li>
      </ul>
    </div>
    <p>Detecting leakage in real-time allows supervisors to reassign neglected opportunities before prospects turn to competitors.</p>
    <p>Best regards,<br>Closecraft Team</p>
  `;

  return {
    messageKey: 'BIZ_04',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nRevenue leakage happens when conversations fragment across WhatsApp and email.\n\nCatching stalled deals early protects existing pipeline value.\n\nClosecraft Team\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

export function renderBiz05(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const trialUrl = data.trial_url || 'https://www.closecrafthq.com/signup';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'Put your follow-up to the test (7-day Starter trial)';
  const preheader = 'Try Starter free for 7 days with no credit card required.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Over the last 10 days, we've walked through why follow-up stalls and how structured Next Best Actions change revenue velocity.</p>
    <p>Now, test it with the enquiries you already have.</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">7-Day Starter Trial:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>No credit card required to start</li>
        <li>Shared workspace for up to 3 team members</li>
        <li>1,000 active lead allowance with Next Best Action engine</li>
        <li>No automatic billing when your trial ends</li>
      </ul>
    </div>
    <p style="margin-top: 24px;">
      <a href="${escapeHtml(trialUrl)}" class="button">Start My 7-Day Free Trial</a>
    </p>
    <p>Best regards,<br>Closecraft Team</p>
  `;

  return {
    messageKey: 'BIZ_05',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nPut your follow-up to the test with our 7-day Starter trial.\n\nNo credit card required: ${trialUrl}\n\nClosecraft Team\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

// -----------------------------------------------------------------------------
// DSS LEARNING TRACK (Steps 2–5)
// -----------------------------------------------------------------------------
export function renderDSS02(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'The remote sales qualification standard';
  const preheader = 'How top appointment setters qualify intent without sounding pushy.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Amateur reps jump straight into pitching product features. Professional appointment setters and closers evaluate four core pillars before scheduling a discovery call:</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">The 4 Qualification Pillars:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>Commercial Fit:</strong> Does the prospect actually have the problem you solve?</li>
        <li><strong>Buying Intent:</strong> Are they actively seeking a solution, or casually browsing?</li>
        <li><strong>Timeline Urgency:</strong> When do they need this implemented?</li>
        <li><strong>Authority:</strong> Who else is involved in the commercial decision?</li>
      </ul>
    </div>
    <p>In our next lesson, we'll examine how to practice difficult objection conversations in a safe simulation before facing real buyers.</p>
    <p>Best regards,<br>Digital Sales School</p>
  `;

  return {
    messageKey: 'DSS_02',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nThe 4 qualification pillars: Fit, Intent, Urgency, Authority.\n\nMaster qualification before booking calls.\n\nDigital Sales School\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

export function renderDSS03(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'Practicing difficult conversations before buyer calls';
  const preheader = 'Why mock role-play with instant AI feedback changes outcomes.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Most reps "practice" on live prospects. That means every objection they fumble costs real deals and real commission.</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">How elite performers train:</h3>
      <p style="margin: 0;">They drill objection patterns repeatedly in realistic role-plays. In DSS, students practice with our AI Buyer simulator across dozens of realistic buyer personas, receiving scored feedback on 8 criteria before every live clinic.</p>
    </div>
    <p>Confidence is not a personality trait. It is the result of deliberate repetition.</p>
    <p>Best regards,<br>Digital Sales School</p>
  `;

  return {
    messageKey: 'DSS_03',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nDon't practice on live prospects. Drill objection patterns with structured simulation.\n\nDigital Sales School\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

export function renderDSS04(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'Building a verifiable sales portfolio';
  const preheader = 'Employers look for evidence, not just certificates.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Anyone can claim they can close deals on a resume. Forward-thinking companies hire reps who provide verifiable proof of competence.</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">What makes a sales portfolio compelling:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Scored roleplay transcripts demonstrating objection handling</li>
        <li>Structured handover notes and CRM qualification evidence</li>
        <li>Audited benchmarks against the DSS 8-criterion rubric</li>
      </ul>
    </div>
    <p>Best regards,<br>Digital Sales School</p>
  `;

  return {
    messageKey: 'DSS_04',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nEmployers look for evidence, not just certificates. Build a verifiable sales portfolio.\n\nDigital Sales School\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

export function renderDSS05(data: WelcomeEmailData): RenderedWelcomeEmail {
  const firstName = data.first_name ? data.first_name.trim() : 'there';
  const dssUrl = data.dss_url || 'https://www.closecrafthq.com/dss/apply';
  const unsubscribeUrl = data.unsubscribe_url || 'https://www.closecrafthq.com/unsubscribe';
  const subject = 'Ready to sprint? Next DSS cohort details';
  const preheader = 'Apply for the upcoming 4-week remote sales sprint.';

  const contentHtml = `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Over the last 10 days, we've covered the fundamentals of qualification, deliberate practice, and building verifiable sales competency.</p>
    <p>If you're ready to accelerate your remote sales career, applications are open for the flagship 4-week DSS Remote Sales Sprint.</p>
    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 16px;">Flagship Programme Facts:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>4 intensive weeks: 24 topics across 12 live workshops</li>
        <li>Unlimited role-play drills in the AI Practice Studio</li>
        <li>Portfolio development and certified competency credential</li>
        <li>Rigorous 12/16 passing threshold</li>
      </ul>
    </div>
    <p style="margin-top: 24px;">
      <a href="${escapeHtml(dssUrl)}" class="button">Apply for the Sprint</a>
    </p>
    <p>Best regards,<br>Digital Sales School</p>
  `;

  return {
    messageKey: 'DSS_05',
    subject,
    preheader,
    html: wrapMarketingEmailHtml({ subject, preheader, contentHtml, unsubscribeUrl }),
    text: `Hi ${firstName},\n\nApply for the 4-week Digital Sales School sprint: ${dssUrl}\n\nDigital Sales School\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

