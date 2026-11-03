import type { Metadata } from 'next';
import LeadGenClient from './LeadGenClient';

export const metadata: Metadata = {
  title: 'Managed Facebook & Instagram Lead Generation — Closecraft',
  description: 'Bring in enquiries your business is ready to follow up. Get hands-on Facebook and Instagram campaign management, connected to a clearer follow-up process through Closecraft.',
  openGraph: {
    title: 'Managed Facebook & Instagram Lead Generation — Closecraft',
    description: 'Targeted paid advertising campaign setup and ongoing management on Facebook and Instagram, connected directly to your Closecraft follow-up workflow.',
    url: 'https://www.closecrafthq.com/services/lead-generation',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Managed Facebook & Instagram Lead Generation — Closecraft',
    description: 'Targeted paid advertising campaign management connected directly to follow-up.',
    creator: '@closecrafthq',
  },
};

export default function LeadGenerationPage() {
  return <LeadGenClient />;
}

