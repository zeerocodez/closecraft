import type { Metadata } from "next";
import LandingClientWrapper from "./LandingClientWrapper";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "CloseCraft | Lead Generation and Sales Growth Platform",
  description: "CloseCraft helps businesses acquire leads, manage enquiries, follow up consistently and convert more opportunities into customers.",
  keywords: [
    "Closecraft | 7-Day Free Trial for Sales Follow-Up",
    "Organise enquiries and keep follow-up moving with Closecraft. Start a 7-day Starter trial with no credit card, or request a Revenue Audit for your business.",
    "lead generation",
    "sales follow up",
    "meta ads"
  ],
  openGraph: {
    title: "CloseCraft | Lead Generation and Sales Growth Platform",
    description: "CloseCraft helps businesses acquire leads, manage enquiries, follow up consistently and convert more opportunities into customers.",
    url: "https://www.closecrafthq.com",
    siteName: "CloseCraft",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/closecraft-og.png",
        width: 1200,
        height: 630,
        alt: "CloseCraft - Lead Generation and Sales Growth Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloseCraft | Lead Generation and Sales Growth Platform",
    description: "CloseCraft helps businesses acquire leads, manage enquiries, follow up consistently and convert more opportunities into customers.",
    images: ["/images/closecraft-og.png"],
    creator: "@closecrafthq",
  },
};

export default async function MarketingPage() {
  return <LandingClientWrapper eco={null} flags={null} />;
}
