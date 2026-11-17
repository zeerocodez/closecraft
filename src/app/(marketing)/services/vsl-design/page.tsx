import type { Metadata } from 'next';
import GrowthServiceDetailClient from '@/components/growth/GrowthServiceDetailClient';

export const metadata: Metadata = {
  title: 'Video Sales Letter (VSL) Design — CloseCraft Growth Services',
  description: 'Strategic video sales presentations that systematically dismantle objections and sell high-value offers.',
  openGraph: {
    title: 'Video Sales Letter (VSL) Design — CloseCraft Growth Services',
    description: 'Strategic video sales presentations that systematically dismantle objections and sell high-value offers.',
    url: 'https://www.closecrafthq.com/services/vsl-design',
    siteName: 'CloseCraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Sales Letter (VSL) Design — CloseCraft Growth Services',
    description: 'Strategic video sales presentations that systematically dismantle objections.',
    creator: '@closecrafthq',
  },
};

export default function VslDesignPage() {
  return (
    <GrowthServiceDetailClient
      serviceKey="VSL_DESIGN"
      categoryBadge="CLOSING ENGINE"
      problemStatement="Selling complex or high-ticket offers requires educating prospects, validating credibility, and dismantling deep-seated objections. When done via unstructured phone calls or static text, conversion rates suffer. A structured VSL delivers a perfectly calibrated sales presentation 24/7 without fatigue."
      targetAudience="For high-ticket service providers, premium course creators, B2B software vendors, and enterprise agencies selling products or services priced above ₦100,000 ($250+) that require deep persuasion."
      workflowExplanation="We deploy our proven psychological persuasion blueprint: Hook & Disruption → Problem Agitation → Failed Solutions → The New Mechanism → Offer Breakdown → Proof & Case Studies → Guarantee & Urgency → Clear Call to Action. We script, record, animate slides, and build a dedicated VSL landing player."
      nextStepCopy="Click GET STARTED to submit your offer specifics. We will review your value proposition and outline the recommended VSL persuasion framework."
    />
  );
}

