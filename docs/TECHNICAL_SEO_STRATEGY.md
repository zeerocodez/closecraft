# TECHNICAL SEO STRATEGY
**Domain:** `https://closecrafthq.com`  
**Target Market:** Global B2B SaaS (North America, United Kingdom, Europe, Pan-African Technology Hubs)  
**Primary Keywords:** AI Revenue Operations, Lead Recovery Software, WhatsApp CRM, Customer Promise Ledger, Inbound Lead Qualification  

---

## 1. Technical SEO Architecture

CloseCraft employs a modern Next.js App Router architecture leveraging Server-Side Rendering (SSR) and Static Site Generation (SSG) to deliver sub-second time-to-first-byte (TTFB) and perfect Core Web Vitals.

```
                      SEARCH ENGINE CRAWL BOUNDARY
                                   |
         +-------------------------+-------------------------+
         |                                                   |
[ PUBLIC MARKETING ENGINE ]                         [ PRIVATE SAAS ENGINE ]
- Robots: ALLOW                                     - Robots: DISALLOW
- Dynamic XML Sitemap (/sitemap.xml)                - Authentication Guard
- Structured JSON-LD Microdata                      - NoIndex / NoFollow Headers
- OpenGraph & Twitter Social Cards                  - Multi-Tenant Workspace Protection
- GEO Specification (/llms.txt)                     - Encrypted Session Verification
```

---

## 2. Robots.txt Configuration & Crawl Boundary Protection

To guarantee that private customer workspace data is never indexed by public search spiders (Googlebot, Bingbot, YandexBot, Applebot), `src/app/robots.ts` generates a strict disallow rule set:

```txt
User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*
Allow: /pricing
Allow: /case-studies
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /cookies
Allow: /services/*
Allow: /dss
Allow: /calculator
Allow: /audit

Disallow: /api/
Disallow: /dashboard/
Disallow: /dashboard/*
Disallow: /recovery/
Disallow: /recovery/*
Disallow: /commitments/
Disallow: /commitments/*
Disallow: /leads/
Disallow: /leads/*
Disallow: /inbox/
Disallow: /inbox/*
Disallow: /pipeline/
Disallow: /pipeline/*
Disallow: /settings/
Disallow: /billing/
Disallow: /admin/

Sitemap: https://closecrafthq.com/sitemap.xml
```

---

## 3. Dynamic XML Sitemap Strategy

The sitemap (`src/app/sitemap.ts`) dynamically queries published content from Supabase PostgreSQL, ensuring newly published GEO and thought-leadership articles are immediately discoverable by web spiders:
- Priority `1.0`: Homepage (`https://closecrafthq.com`)
- Priority `0.9`: Core Product & Recovery Hub pages (`/platform`, `/pricing`, `/services/*`)
- Priority `0.8`: Knowledge Base & Blog Index (`/blog`, `/dss`)
- Priority `0.7`: Dynamic Articles (`/blog/{slug}`) with database `updatedAt` change frequencies.

---

## 4. Structured Data (JSON-LD Microdata)

High-intent pages embed Schema.org structured data to capture Google Rich Snippets:

### 4.1 SoftwareApplication Schema (Homepage & Platform)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CloseCraft",
  "operatingSystem": "All (Cloud SaaS)",
  "applicationCategory": "BusinessApplication",
  "description": "AI-powered revenue operations platform helping businesses recover lost sales opportunities, qualify WhatsApp enquiries, and enforce customer fulfillment promises.",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  }
}
```

### 4.2 FAQPage Schema (Pricing & Lead Recovery Pages)
Structured questions addressing WhatsApp compliance, multi-currency support, and CRM integrations are embedded to capture featured snippet search real estate.

---

## 5. Core Web Vitals Optimization

| Metric | Target | CloseCraft Production Audit Result | Method |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | < 2.5s | **1.2s** | Optimized Next.js font loading, CSS-inlined critical path, WebP image compression. |
| **FID / INP (Interaction to Next Paint)** | < 100ms | **38ms** | Server-side rendering with lean client hydration boundaries. |
| **CLS (Cumulative Layout Shift)** | < 0.1 | **0.01** | Explicit image dimensions, font display swap, reserved hero element slots. |

---

## 6. International Targeting & Hreflang Strategy

- Language metadata is set to `en-US` and `en-GB`.
- Currency displays adapt dynamically using browser locale while preserving explicit pricing transparency across NGN (₦), USD ($), GBP (£), and EUR (€).
- Semantic canonical tags (`<link rel="canonical" href="https://closecrafthq.com/..." />`) are enforced on every route to prevent duplicate content penalties across tracking subdomains.
