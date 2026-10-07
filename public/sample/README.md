# CloseCraft sample landing page

A responsive design concept for the CloseCraft revenue workspace and Digital Sales School. It uses a navy, cream and lime palette, an illustrative sales workspace, product sections, native FAQ disclosures and mobile navigation.

## Preview

- Next.js route: `/sample` (`npm run dev`, then visit `http://localhost:3000/sample`).
- Portable preview: download `index.html` and open it in a browser, or visit `/sample/index.html` in the running app. It uses system fonts and native HTML interactions; app links require the CloseCraft server.
- Screenshots: `desktop-preview.png` and `mobile-preview.png`.

The primary revenue audit CTA links to the existing homepage's `#audit` section. Log in and sales school links use existing application routes. The workspace illustration contains sample contacts and is marked PREVIEW; it does not expose customer records or claim live analytics.

The original homepage is unchanged. This route can be reviewed before promoting the design to the homepage.

## Validation

The sample route returns HTTP 200. Chromium checks passed at desktop, 390px and 320px widths with no horizontal overflow or page errors. Mobile navigation, anchor links and FAQ interaction were checked. The portable HTML's FAQ and mobile layout were also checked. ESLint passes on the sample route and all 29 repository tests pass. The existing Prisma download restriction still prevents a complete production build.
