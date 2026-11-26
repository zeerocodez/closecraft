# The Digital Sales School

Landing page and authenticated affiliate portal, with persistent D1 records.

## Included

- Course offer, eight-module curriculum, learning-route selector and enquiry form.
- A real seven-page sample lesson from the DSS training slides.
- Affiliate applications, approval status, referral links and visit deduplication.
- Verified-sales ledger, clearance balances, payout records and CSV export.
- Clearly labelled dashboard demonstration. Demonstration data never enters the database.
- Owner controls for course price, checkout URLs and affiliate terms.

## Launch setup

1. Set the Sites runtime variable DSS_ADMIN_EMAIL to the owner's ChatGPT account email. The admin page is closed until this allowlist value is set.
2. Open /admin and add the actual Selar or Nestuge checkout links. Add the course price.
3. Set the affiliate commission rate, clearance period and minimum payout. Read the published terms before opening approvals.
4. Keep the site private while reviewing the offer and terms. Public access requires an explicit access change by the owner.

## Reconciliation

Checkout links redirect to the configured external product. Payment and delivery are completed by that platform. This site does not have Selar or Nestuge payment webhooks or banking integrations.

The admin checks paid orders and attribution against platform records, then records each verified order reference. References are unique. Commission amounts are calculated in integer kobo and stored on the sale so later policy changes do not rewrite a credited amount.

Refunds reverse unpaid commission. Payout history records transfers already completed separately. Each settled or reversed sale has a unique claim, making concurrent settlement attempts fail atomically instead of paying the same sale twice.

Referral links count one visit per browser and partner per day using a visitor cookie. The link identifies the referring partner in a browsing session and a saved enrolment enquiry. This is not automatic cross-platform purchase attribution. Confirm platform attribution manually before recording a sale.

## Access and privacy

Identity comes from hosted ChatGPT sign-in. Affiliate APIs scope records to the authenticated user. Admin APIs require the configured account email. Writes require same-origin requests. The host starts owner-private.

No personal customer data, testimonials, income claims or payment records are seeded. The only example amounts live in the labelled dashboard preview.

## Verification

Run the TypeScript check and the rules tests, then build with the Sites build helper. Database migrations are schema-only and generated under drizzle.

Browser interaction and visual rendering could not be verified in this environment because the supported browser-control skill was unavailable.

## Export note

This source export omits the live Site project ID. The copyable-code guide contains the exact custom DSS modules, formatted for reading. The deployed source remains unchanged.
