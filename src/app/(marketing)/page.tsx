import type { Metadata } from "next";
import LandingClientWrapper from "./LandingClientWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { getSoftwareApplicationJsonLd, getFaqJsonLd } from "@/lib/seo/schema";
import { HOMEPAGE_FAQS } from "@/lib/data/homepage-faqs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "CloseCraft | AI Revenue Operations, Lead Recovery & Fulfilment Platform",
  description: "Recover more opportunities. Convert more customers. Deliver what you promise. CloseCraft connects inbound inquiry triage, AI lead recovery, and customer commitment fulfilment for fast-growing businesses.",
  keywords: [
    "AI revenue operations platform",
    "AI CRM software",
    "lead recovery software",
    "WhatsApp CRM for business",
    "sales follow up automation",
    "how to recover lost sales leads",
    "customer commitment tracker",
    "sales pipeline management",
    "omnichannel revenue inbox",
    "stop losing leads"
  ],
  openGraph: {
    title: "CloseCraft | AI Revenue Operations, Lead Recovery & Fulfilment Platform",
    description: "Recover more opportunities. Convert more customers. Deliver what you promise. CloseCraft connects inbound inquiry triage, AI lead recovery, and customer commitment fulfilment for fast-growing businesses.",
    url: "https://www.closecrafthq.com",
    siteName: "CloseCraft",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/closecraft-og.png",
        width: 1200,
        height: 630,
        alt: "CloseCraft - AI Revenue Operations, Lead Recovery & Fulfilment Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloseCraft | AI Revenue Operations, Lead Recovery & Fulfilment Platform",
    description: "Recover more opportunities. Convert more customers. Deliver what you promise. Connect inbound triage, lead recovery, and fulfilment tracking.",
    images: ["/images/closecraft-og.png"],
    creator: "@closecrafthq",
  },
};

export default async function MarketingPage() {
  const jsonLdData = [
    getSoftwareApplicationJsonLd(),
    getFaqJsonLd(HOMEPAGE_FAQS.map((faq) => ({ question: faq.q, answer: faq.a }))),
  ];

  return (
    <>
      <JsonLd data={jsonLdData} />
      <LandingClientWrapper eco={null} flags={null} />
    </>
  );
}
