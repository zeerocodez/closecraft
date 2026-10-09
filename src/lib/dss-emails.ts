import { sendTransactionalEmail } from './email';

export async function sendDSSInvoiceEmail(to: string, name: string, invoiceNumber: string, paymentOption: string, amountDueNow: string) {
  const subject = `DSS Founding Cohort - Invoice ${invoiceNumber}`;
  const html = `
    <p>Good afternoon ${name},</p>
    <p>Your DSS application has been admitted subject to the published intake confirmation conditions. Attached is invoice ${invoiceNumber} for ${paymentOption}.</p>
    <p>Please review the terms and use only the payment details on the invoice. We will check cleared payment and issue your receipt.</p>
    <p>Amount due now: ₦${amountDueNow}</p>
    <p>Regards,<br>Emmanuel Effiong<br>Digital Sales School</p>
  `;
  return sendTransactionalEmail({ to, subject, html });
}

export async function sendDSSPaymentReceipt(to: string, name: string, amountReceived: string, invoiceNumber: string, balance: string, balanceDueDate: string | null = null) {
  const subject = `DSS Payment Receipt - Invoice ${invoiceNumber}`;
  const balanceText = balanceDueDate ? ` Your tuition balance is ₦${balance}, due ${balanceDueDate}.` : ` Your tuition balance is ₦${balance}.`;
  
  const html = `
    <p>Thank you, ${name}.</p>
    <p>We have confirmed ₦${amountReceived} against invoice ${invoiceNumber}. Your receipt is attached.${balanceText}</p>
    <p>Our intake decision is due on 30 October by 7 pm WAT under the programme terms. Please keep that date in mind before making arrangements that depend on the class starting.</p>
    <p>Regards,<br>Digital Sales School</p>
  `;
  return sendTransactionalEmail({ to, subject, html });
}

export async function sendDSSIntakeConfirmation(to: string, name: string, welcomeLink: string, supportContact: string) {
  const subject = `DSS Founding Intake Confirmed - Welcome!`;
  const html = `
    <p>Hello ${name},</p>
    <p>The DSS founding intake is confirmed. Orientation is Saturday 7 November at 10 am WAT. Classes begin Monday 9 November at 7 pm.</p>
    <p>Your learner access and preparation checklist are here: <a href="${welcomeLink}">${welcomeLink}</a>.</p>
    <p>Please test the joining route and confirm you can access the materials. For help, contact ${supportContact}.</p>
    <p>Regards,<br>Digital Sales School</p>
  `;
  return sendTransactionalEmail({ to, subject, html });
}

export async function sendDSSIntakePostponed(to: string, name: string, actualReason: string, actualRefundOption: string, supportContact: string, agreedDateIfAvailable?: string) {
  const subject = `Update on DSS Founding Intake`;
  const html = `
    <p>Hello ${name},</p>
    <p>We cannot confirm the 7 November DSS intake because ${actualReason}.</p>
    <p>Under the terms you accepted, your options are ${actualRefundOption}${agreedDateIfAvailable ? ` or transfer to ${agreedDateIfAvailable}` : ''}.</p>
    <p>Please tell us your choice through ${supportContact}. We will confirm the action and completion date in writing.</p>
    <p>Regards,<br>Digital Sales School</p>
  `;
  return sendTransactionalEmail({ to, subject, html });
}

export async function sendClinicRegistration(to: string, name: string, date: string, time: string, clinicAccess: string, auditLink: string) {
  const subject = `DSS Clinic Registration Confirmation`;
  const html = `
    <p>Good afternoon ${name},</p>
    <p>You are registered for the DSS free sales clinic on ${date} at ${time} WAT. Join through <a href="${clinicAccess}">${clinicAccess}</a>.</p>
    <p>Please bring one anonymised enquiry or use our teaching example. Your free worksheet is <a href="${auditLink}">${auditLink}</a>.</p>
    <p>The clinic includes a short explanation of the paid cohort at the end.</p>
    <p>Regards,<br>Digital Sales School</p>
  `;
  return sendTransactionalEmail({ to, subject, html });
}
