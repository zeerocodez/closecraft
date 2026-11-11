import type { Metadata } from 'next';
import LeadManagementClient from './LeadManagementClient';

export const metadata: Metadata = {
  title: 'Lead Management & Automated Follow-Up — Closecraft',
  description: 'Respond in under 15 minutes. Automatically capture, organize, and nurture inbound customer enquiries with unified multi-channel follow-up.',
  openGraph: {
    title: 'Lead Management & Automated Follow-Up — Closecraft',
    description: 'Transform raw enquiries into qualified pipeline. Omnichannel CRM, <15 min automated response, and human handoff.',
    url: 'https://www.closecrafthq.com/services/lead-management',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'CloseCraft Lead Management',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lead Management & Automated Follow-Up — Closecraft',
    description: 'Automated 15-minute qualification and multi-channel lead management.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
  },
};

export default function LeadManagementPage() {
  return <LeadManagementClient />;
}
