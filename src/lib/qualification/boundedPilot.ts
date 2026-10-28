import { BoundedPilotSpec } from './types';

export function generateBoundedPilotSpec(params: {
  businessName: string;
  enquiryRange?: string | null;
  currency?: string;
  proposedFee?: number;
}): BoundedPilotSpec {
  const currency = params.currency || 'NGN';
  const fee = params.proposedFee || (currency === 'NGN' ? 150000 : 350);
  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() + 30);

  return {
    question: `Can vetted Closecraft sales assistance convert ${params.businessName}'s existing enquiry flow into verified customer sales at an acceptable customer acquisition cost?`,
    scope: 'Active new inbound enquiries across WhatsApp and web forms received during the 30-day pilot window.',
    capacity: 'Up to 40 dedicated sales engagement hours over 30 calendar days.',
    period: '30 Calendar Days (Starting upon verified activation & mutual sales brief approval)',
    fee,
    currency,
    clientObligations: [
      'Provide accurate product pricing sheet and confirmed refund/fulfillment boundaries.',
      'Assign an internal contact with 4-hour WhatsApp response availability for custom quotes.',
      'Conduct a 30-minute kickoff sales brief review with the assigned sales professional.'
    ],
    evidenceToCollect: [
      'Lead response time from ingestion to first human contact (SLA benchmark: < 15 minutes).',
      'Conversation qualification rate (% of enquiries completing discovery).',
      'Objection patterns and reasons for loss.',
      'Verified closed deals and revenue collected.'
    ],
    reviewDate,
    stopConditions: [
      'Client fails to provide verified delivery materials or confirm custom quotes within 48 hours.',
      'Unresolved operational blocker exceeding 5 business days without mutual rescheduling.',
      'Breach of professional conduct or customer communication boundaries.'
    ],
  };
}
