import type { Metadata } from 'next';
import GrowthServiceDetailClient from '@/components/growth/GrowthServiceDetailClient';

export const metadata: Metadata = {
  title: 'Landing Page Design — CloseCraft Growth Services',
  description: 'High-converting sales and lead capture pages designed to turn cold clicks into qualified buyers with direct CRM integration.',
  openGraph: {
    title: 'Landing Page Design — CloseCraft Growth Services',
    description: 'High-converting sales and lead capture pages designed to turn cold clicks into qualified buyers with direct CRM integration.',
    url: 'https://www.closecrafthq.com/services/landing-pages',
    siteName: 'CloseCraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landing Page Design — CloseCraft Growth Services',
    description: 'High-converting sales and lead capture pages with direct CRM integration.',
    creator: '@closecrafthq',
  },
};

export default function LandingPagesPage() {
  return (
    <GrowthServiceDetailClient
      serviceKey="LANDING_PAGE_DESIGN"
      categoryBadge="CONVERSION RATE"
      problemStatement="Most websites act as digital brochures that confuse visitors with excessive navigation and weak calls to action, causing 97%+ of paid ad traffic to bounce without taking action. We engineer high-converting, single-purpose landing pages that guide visitors step-by-step toward booking, applying, or purchasing."
      targetAudience="For businesses running paid campaigns or social marketing who need a dedicated conversion page that turns cold traffic into qualified enquiries and synchronizes every lead directly into their sales pipeline."
      workflowExplanation="We structure direct-response copy that addresses customer pain points and objections. We design a responsive, mobile-first page layout using high-contrast design tokens, implement lead capture forms, verify tracking pixels, and integrate submission webhooks directly into CloseCraft."
      nextStepCopy="Click GET STARTED to share your offer details and target audience. We will outline a high-converting page wireframe and project timeline."
    />
  );
}

