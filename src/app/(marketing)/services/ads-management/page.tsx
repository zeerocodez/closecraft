import type { Metadata } from 'next';
import GrowthServiceDetailClient from '@/components/growth/GrowthServiceDetailClient';

export const metadata: Metadata = {
  title: 'Facebook & Instagram Ads Management — CloseCraft Growth Services',
  description: 'Targeted Meta advertising campaigns designed to generate qualified inbound buyer enquiries and sync directly into your CloseCraft follow-up workspace.',
  openGraph: {
    title: 'Facebook & Instagram Ads Management — CloseCraft Growth Services',
    description: 'Targeted Meta advertising campaigns designed to generate qualified inbound buyer enquiries and sync directly into your CloseCraft follow-up workspace.',
    url: 'https://www.closecrafthq.com/services/ads-management',
    siteName: 'CloseCraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facebook & Instagram Ads Management — CloseCraft Growth Services',
    description: 'Targeted Meta advertising campaigns connected directly to follow-up.',
    creator: '@closecrafthq',
  },
};

export default function AdsManagementPage() {
  return (
    <GrowthServiceDetailClient
      serviceKey="ADS_MANAGEMENT"
      categoryBadge="PAID ACQUISITION"
      problemStatement="Businesses waste advertising budgets targeting the wrong audiences, running uninspiring ad creatives, and driving traffic that never converts. Most dangerously, generated leads are not followed up quickly, causing ad spend to be wasted. We engineer high-intent Meta campaigns designed to sync immediately into CloseCraft."
      targetAudience="For businesses ready to scale inbound customer acquisition—including B2B service firms, training institutions, real estate developments, healthcare providers, and high-value merchants—who want predictable leads and a structured follow-up process."
      workflowExplanation="We audit your offer and historical data, construct target customer avatars, build creative angles and hooks, configure Meta Pixel and Conversion API, launch A/B split tests, and pipe every lead directly into your CloseCraft queue with SLA response tracking."
      nextStepCopy="Click GET STARTED to submit your campaign requirements through our project brief. Our ads strategist will review your goals and connect via official WhatsApp with a tailored campaign proposal."
    />
  );
}

