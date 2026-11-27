// Unified Inbox sources: WhatsApp, Meta Ads, and Web Capture enquiries
// must all land in the inbox as threads with source badges and filters,
// and the inbox layout must stay roomy rather than cramped.
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Enquiry thread creation at ingestion', () => {
  it('shared helper creates a conversation plus the enquiry as first message', () => {
    const src = read('src/lib/inbox/enquiryThread.ts');
    assert.ok(src.includes('export async function ensureEnquiryThread'));
    assert.ok(src.includes("senderType: 'PROSPECT'"), 'the enquiry itself is the first prospect message');
    assert.ok(src.includes("params.phone ? 'WHATSAPP' : 'WEB'"), 'reply channel is WhatsApp when the lead has a phone');
  });

  it('helper is idempotent — an existing conversation is returned untouched', () => {
    const src = read('src/lib/inbox/enquiryThread.ts');
    const findIdx = src.indexOf('db.conversation.findFirst');
    const createIdx = src.indexOf('db.conversation.create');
    assert.ok(findIdx !== -1 && createIdx !== -1 && findIdx < createIdx);
    assert.ok(src.includes('if (existing) return existing'));
  });

  it('Meta Ads webhook surfaces the enquiry in the inbox', () => {
    const src = read('src/app/api/webhooks/facebook/route.ts');
    assert.ok(src.includes("import { ensureEnquiryThread } from '@/lib/inbox/enquiryThread'"));
    assert.ok(src.includes('await ensureEnquiryThread({'));
    assert.ok(src.includes("source: 'FACEBOOK_LEAD_AD'"), 'lead source stays the origin marker');
  });

  it('web capture endpoints surface the enquiry in the inbox', () => {
    for (const p of ['src/app/api/leads/capture/route.ts', 'src/app/api/leads/embed/route.ts']) {
      const src = read(p);
      assert.ok(src.includes('await ensureEnquiryThread({'), `${p} must create the inbox thread`);
    }
  });
});

describe('Inbox source model', () => {
  it('classifies enquiry sources from Lead.source', () => {
    const src = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(src.includes('export function getEnquirySource'));
    assert.ok(src.includes("s.includes('FACEBOOK')") && src.includes("return 'META_ADS'"));
    assert.ok(src.includes("s.includes('WEBSITE')") && src.includes("return 'WEB'"));
    assert.ok(src.includes("s.includes('WHATSAPP')") && src.includes("return 'WHATSAPP'"));
  });

  it('offers source filters with counts for all three sources', () => {
    const src = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(src.includes('sourceCounts.META_ADS'));
    assert.ok(src.includes('sourceCounts.WEB'));
    assert.ok(src.includes('sourceCounts.WHATSAPP'));
    assert.ok(src.includes('Meta Ads ({sourceCounts.META_ADS})'));
    assert.ok(src.includes('Web Capture ({sourceCounts.WEB})'));
  });

  it('cards badge the enquiry source, not the reply channel', () => {
    const src = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(src.includes('ENQUIRY_SOURCE_LABEL[source]'));
    assert.ok(src.includes("META_ADS: 'Meta Ads'"));
    assert.ok(src.includes("WEB: 'Web Capture'"));
  });
});

describe('Inbox readability pass', () => {
  it('list pane is wider with roomier cards and two-line previews', () => {
    const src = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(src.includes('lg:w-[340px]'));
    assert.ok(src.includes('line-clamp-2'));
    assert.ok(src.includes('p-4 rounded-2xl cursor-pointer'));
  });

  it('thread and composer have generous padding', () => {
    const src = read('src/app/(saas)/inbox/InboxClient.tsx');
    assert.ok(src.includes('md:px-8 md:py-8'));
    assert.ok(src.includes('p-4 md:p-5 bg-[#0a0d12] border-t'));
  });

  it('page frame breathes', () => {
    const src = read('src/app/(saas)/inbox/page.tsx');
    assert.ok(src.includes('p-4 sm:p-6'));
    assert.ok(src.includes('WhatsApp &bull; Meta Ads &bull; Web Capture'));
  });
});
