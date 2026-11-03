import { sendTransactionalEmail } from '@/lib/email';

export type NotificationCategory = 'SALES' | 'DSS' | 'GENERAL';

export interface NotificationRecipients {
  primary: string;
  cc: string[];
  all: string[];
}

/**
 * Resolves the targeted email distribution list based on the nature of the request.
 * - SALES: sales@closecrafthq.com (enquiries for Lead Gen, Software, Managed Sales, Audits)
 * - DSS: dss@closecrafthq.com (DSS Sprint applications, Team Training, Admissions)
 * - GENERAL: info@closecrafthq.com (Company info, general inquiries, newsletters)
 * 
 * Every alert also copies info@closecrafthq.com and the primary administrator.
 */
export function getNotificationRecipients(category: NotificationCategory): NotificationRecipients {
  const salesEmail = 'sales@closecrafthq.com';
  const infoEmail = 'info@closecrafthq.com';
  const dssEmail = 'dss@closecrafthq.com';
  const adminEmail = process.env.OPERATOR_ALERT_EMAIL || process.env.ADMIN_ALERT_EMAIL || process.env.GMAIL_USER || 'zeerocodes@gmail.com';

  switch (category) {
    case 'DSS':
      return {
        primary: dssEmail,
        cc: [infoEmail, adminEmail],
        all: Array.from(new Set([dssEmail, infoEmail, adminEmail])),
      };
    case 'SALES':
      return {
        primary: salesEmail,
        cc: [infoEmail, adminEmail],
        all: Array.from(new Set([salesEmail, infoEmail, adminEmail])),
      };
    case 'GENERAL':
    default:
      return {
        primary: infoEmail,
        cc: [salesEmail, adminEmail],
        all: Array.from(new Set([infoEmail, salesEmail, adminEmail])),
      };
  }
}

/**
 * Maps a serviceType code to the relevant notification category.
 */
export function getCategoryForServiceType(serviceType: string): NotificationCategory {
  const st = (serviceType || '').toUpperCase();
  if (st === 'TEAM_TRAINING' || st.includes('DSS') || st.includes('TRAINING')) {
    return 'DSS';
  }
  return 'SALES';
}

/**
 * Dispatches an internal notification alert to the relevant inboxes concurrently.
 */
export async function dispatchNotificationAlert({
  category,
  subject,
  html,
  text,
}: {
  category: NotificationCategory;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const recipients = getNotificationRecipients(category);

  try {
    await Promise.allSettled(
      recipients.all.map((to) =>
        sendTransactionalEmail({
          to,
          subject,
          html,
          text,
        })
      )
    );
  } catch (err: any) {
    console.warn('[Notification Router] Alert dispatch error:', err?.message || err);
  }
}
