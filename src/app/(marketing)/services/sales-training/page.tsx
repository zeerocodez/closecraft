import type { Metadata } from 'next';
import SalesTrainingClient from './SalesTrainingClient';

export const metadata: Metadata = {
  title: 'DSS Sales Team Training & Enablement Playbooks — Closecraft',
  description: 'Empower your internal sales representatives with battle-tested playbooks, AI roleplay simulations, objection handling drills, and DSS sales certification.',
  openGraph: {
    title: 'DSS Sales Team Training & Enablement Playbooks — Closecraft',
    description: 'Transform your internal sales team through systematic qualification frameworks, AI buyer roleplay practice, and DSS certification.',
    url: 'https://www.closecrafthq.com/services/sales-training',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'CloseCraft Sales Enablement & Training',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSS Sales Training & Enablement — Closecraft',
    description: 'Battle-tested sales playbooks, AI drills, and team training.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
  },
};

export default function SalesTrainingPage() {
  return <SalesTrainingClient />;
}
