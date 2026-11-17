import type { Metadata } from 'next';
import GrowthServiceDetailClient from '@/components/growth/GrowthServiceDetailClient';

export const metadata: Metadata = {
  title: 'AI Video Creation — CloseCraft Growth Services',
  description: 'Dynamic, persuasive short-form videos designed for modern attention spans to turn social viewers into qualified prospects.',
  openGraph: {
    title: 'AI Video Creation — CloseCraft Growth Services',
    description: 'Dynamic, persuasive short-form videos designed for modern attention spans to turn social viewers into qualified prospects.',
    url: 'https://www.closecrafthq.com/services/ai-video',
    siteName: 'CloseCraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video Creation — CloseCraft Growth Services',
    description: 'Dynamic, persuasive short-form videos designed for modern attention spans.',
    creator: '@closecrafthq',
  },
};

export default function AiVideoPage() {
  return (
    <GrowthServiceDetailClient
      serviceKey="AI_VIDEO_CREATION"
      categoryBadge="VIDEO MARKETING"
      problemStatement="Video is the highest-converting medium across digital channels, but traditional video production is prohibitively expensive, slow, and hard to iterate. Our AI video workflows produce compelling, high-converting short-form videos with native sound design, kinetic captions, and professional voiceovers at a fraction of standard production costs."
      targetAudience="For founders, product marketers, and direct-response advertisers who need persuasive TikTok, Instagram Reels, and YouTube Shorts video ads that capture cold attention and drive click-throughs to sales pages."
      workflowExplanation="We analyze your offer's primary hook and objections. Our scriptwriters craft a tight, high-tempo narrative, generate accent-matched voiceovers, compose dynamic motion graphics and B-roll visuals, sync engaging captions, and deliver finished video assets optimized for social platforms."
      nextStepCopy="Click GET STARTED to submit your video brief. We will evaluate your offer and provide recommended script hooks and format options."
    />
  );
}

