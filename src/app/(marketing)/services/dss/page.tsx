import type { Metadata } from 'next';
import DSSProductClient from './DSSProductClient';

export const metadata: Metadata = {
  title: 'Digital Sales School (DSS) Products & Services — Closecraft',
  description: 'Digital Sales School (DSS) combines customized corporate sales playbooks, AI buyer simulation drills, and verifiable competency certification for ambitious sales teams and professionals.',
  openGraph: {
    title: 'Digital Sales School (DSS) Products & Services — Closecraft',
    description: 'Transform sales capability with AI buyer roleplay drills, objection playbooks, and verified competency certification.',
    url: 'https://www.closecrafthq.com/services/dss',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'Digital Sales School (DSS) Products & Services',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Sales School (DSS) — Closecraft Products',
    description: 'AI Buyer roleplays, corporate enablement playbooks, and verified sales certification.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
  },
};

export default function DSSProductPage() {
  return <DSSProductClient />;
}

