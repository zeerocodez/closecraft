import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
// Fallback to a dummy key to prevent crashes in local dev without an API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    // If no real API key is set, log to console instead of trying to hit the API
    if (!process.env.RESEND_API_KEY) {
      console.log('=========================================');
      console.log(`[MOCK EMAIL SENT TO: ${to}]`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);
      console.log('=========================================');
      return { success: true, mock: true };
    }

    const { data, error } = await resend.emails.send({
      from: 'CloseCraft <onboarding@closecraft.app>', // Change to your verified domain
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Email Delivery Error]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Email Delivery Error]', error);
    return { success: false, error };
  }
}
