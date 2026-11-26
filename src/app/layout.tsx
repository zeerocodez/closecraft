import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import LoopGuide from "@/components/guide/LoopGuide";
import CookieConsent from "@/components/layout/CookieConsent";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import JsonLd from "@/components/seo/JsonLd";
import { getOrganizationJsonLd, getWebSiteJsonLd } from "@/lib/seo/schema";
import "./globals.css";

const inter = Inter({
 subsets: ["latin"],
 variable: "--font-inter",
 weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
 subsets: ["latin"],
 variable: "--font-plus-jakarta",
 weight: ["600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B1117",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.closecrafthq.com"),
  title: {
    default: "CloseCraft HQ | AI Revenue Operations, Lead Recovery and Fulfilment Platform",
    template: "%s | CloseCraft HQ",
  },
  description: "CloseCraft HQ helps businesses manage enquiries, recover dormant leads, enforce follow-up accountability, and close more sales with AI speed and human judgement.",
  alternates: {
    canonical: "https://www.closecrafthq.com",
  },
  openGraph: {
    title: "CloseCraft HQ | AI Revenue Operations, Lead Recovery and Fulfilment Platform",
    description: "CloseCraft HQ helps businesses manage enquiries, recover dormant leads, enforce follow-up accountability, and close more sales.",
    url: "https://www.closecrafthq.com",
    siteName: "CloseCraft HQ",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/closecraft-og.png",
        width: 1200,
        height: 630,
        alt: "CloseCraft HQ - AI Revenue Operations, Lead Recovery and Fulfilment Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloseCraft HQ | AI Revenue Operations, Lead Recovery and Fulfilment Platform",
    description: "CloseCraft HQ helps businesses manage enquiries, recover dormant leads, and enforce follow-up accountability.",
    images: ["/images/closecraft-og.png"],
    creator: "@closecrafthq",
    site: "@closecrafthq",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/images/closecraft-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-closecraft",
  },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <link 
 href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
 rel="stylesheet" 
 />
 </head>
 <body
 suppressHydrationWarning
 className={`${inter.variable} ${plusJakartaSans.variable} font-body-lg antialiased bg-surface text-on-surface flex flex-col min-h-screen selection:bg-primary selection:text-on-primary`}
 >
 <JsonLd data={[getOrganizationJsonLd(), getWebSiteJsonLd()]} />
 <AnalyticsScripts />
 {children}
 <LoopGuide />
 <CookieConsent />
 </body>
 </html>
 );
}
