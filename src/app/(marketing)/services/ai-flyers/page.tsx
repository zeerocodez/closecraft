import type { Metadata } from 'next';
import GrowthServiceDetailClient from '@/components/growth/GrowthServiceDetailClient';

export const metadata: Metadata = {
  title: 'AI Image & Flyer Creation — CloseCraft Growth Services',
  description: 'High-impact promotional graphics and social banners engineered to stop the scroll and drive qualified customer interest.',
  openGraph: {
    title: 'AI Image & Flyer Creation — CloseCraft Growth Services',
    description: 'High-impact promotional graphics and social banners engineered to stop the scroll and drive qualified customer interest.',
    url: 'https://www.closecrafthq.com/services/ai-flyers',
    siteName: 'CloseCraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image & Flyer Creation — CloseCraft Growth Services',
    description: 'High-impact promotional graphics engineered to stop the scroll.',
    creator: '@closecrafthq',
  },
};

export default function AiFlyersPage() {
  return (
    <GrowthServiceDetailClient
      serviceKey="AI_FLYER_DESIGN"
      categoryBadge="CREATIVE & VISUALS"
      problemStatement="Generic, low-quality social media graphics get ignored in crowded feeds. Hiring traditional graphic design agencies takes weeks and costs excessive retainers for simple campaign variations. We combine hybrid AI models and professional design polish to deliver scroll-stopping promotional creatives in days."
      targetAudience="For marketing teams, business owners, and event organizers who need rapid, high-converting visual assets for product launches, seasonal promotions, flash sales, webinars, and daily social media marketing."
      workflowExplanation="You supply your offer details, brand colors, and key messaging. Our design team deploys proprietary creative prompts and custom typography layers, generates multiple aesthetic variations, refines the winning concepts, and delivers production-ready files in all required aspect ratios."
      nextStepCopy="Click GET STARTED to outline your promotional visual requirements. We will review your brand assets and deliver a creative production plan."
    />
  );
}

