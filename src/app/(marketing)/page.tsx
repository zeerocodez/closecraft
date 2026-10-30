import type { Metadata } from "next";
import LandingClientWrapper from "./LandingClientWrapper";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Closecraft | 7-Day Free Trial for Sales Follow-Up",
  description: "Organise enquiries and keep follow-up moving with Closecraft. Start a 7-day Starter trial with no credit card, or request a Revenue Audit for your business.",
  openGraph: {
    title: "Closecraft | 7-Day Free Trial for Sales Follow-Up",
    description: "Organise enquiries and keep follow-up moving with Closecraft. Start a 7-day Starter trial with no credit card, or request a Revenue Audit for your business.",
    url: "https://www.closecrafthq.com",
    siteName: "Closecraft",
    locale: "en_US",
    type: "website",
  },
};

export default async function MarketingPage() {
  return <LandingClientWrapper eco={null} flags={null} />;
}
