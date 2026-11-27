export type InboxChannel = 'WHATSAPP' | 'META_ADS' | 'WEB' | 'EMAIL';

const WEB_SOURCES = new Set([
  'WEBSITE_WIDGET',
  'PUBLIC_WEBSITE',
  'PUBLIC_FORM',
  'WEB_CAPTURE',
  'WEBSITE',
  'WEB',
  'LANDING_PAGE',
  'AUDIT',
  'CONTACT_FORM',
  'SERVICES_CATALOGUE',
]);

/**
 * Classifies a lead's canonical Unified Inbox channel from its source, Meta metadata,
 * or linked conversation channel without mislabeling Meta Ads / Web Capture leads as WhatsApp.
 */
export function resolveLeadInboxChannel(lead: {
  source?: string | null;
  phone?: string | null;
  metaLeadId?: string | null;
  metaFormId?: string | null;
  metaCampaignName?: string | null;
  conversations?: Array<{ channel?: string | null }>;
}): InboxChannel {
  const src = (lead.source || '').toUpperCase();
  if (
    src === 'FACEBOOK_LEAD_AD' ||
    src === 'META_ADS' ||
    Boolean(lead.metaLeadId || lead.metaFormId || lead.metaCampaignName)
  ) {
    return 'META_ADS';
  }
  if (src === 'WHATSAPP') {
    return 'WHATSAPP';
  }
  if (WEB_SOURCES.has(src)) {
    return 'WEB';
  }

  const convChannel = (lead.conversations?.[0]?.channel || '').toUpperCase();
  if (convChannel === 'META_ADS') return 'META_ADS';
  if (convChannel === 'WEB') return 'WEB';
  if (convChannel === 'WHATSAPP') return 'WHATSAPP';
  if (convChannel === 'EMAIL') return 'EMAIL';

  return lead.phone ? 'WHATSAPP' : 'WEB';
}

export function formatInboxChannelLabel(channel: InboxChannel): string {
  switch (channel) {
    case 'META_ADS':
      return 'Meta Ads';
    case 'WEB':
      return 'Web Capture';
    case 'WHATSAPP':
      return 'WhatsApp';
    default:
      return 'Email';
  }
}
