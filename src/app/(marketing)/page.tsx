import type { Metadata } from "next";
import LandingClientWrapper from "./LandingClientWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { getSoftwareApplicationJsonLd, getFaqJsonLd } from "@/lib/seo/schema";
import { HOMEPAGE_FAQS } from "@/lib/data/homepage-faqs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "CloseCraft HQ | AI Revenue Operations, Lead Recovery and Fulfilment Platform",
  description: "Recover more opportunities. Convert more enquiries. Deliver what you promise. CloseCraft HQ connects inbound WhatsApp and ad enquiry triage, AI lead recovery, and customer commitment fulfilment for Real Estate, Education, and fast-growing businesses in Lagos and globally.",
  keywords: [
    "CloseCraft HQ",
    "AI revenue operations platform",
    "AI CRM software",
    "lead recovery software",
    "WhatsApp CRM for business Lagos",
    "real estate lead follow up Nigeria",
    "education student enrollment software",
    "sales follow up automation",
    "how to recover lost sales leads",
    "stop losing leads"
  ],
  openGraph: {
    title: "CloseCraft HQ | AI Revenue Operations, Lead Recovery and Fulfilment Platform",
    description: "Recover more opportunities. Convert more enquiries. Deliver what you promise. CloseCraft HQ connects inbound triage, AI lead recovery, and commitment fulfilment.",
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
    description: "Recover more opportunities. Convert more enquiries. Deliver what you promise with CloseCraft HQ.",
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
