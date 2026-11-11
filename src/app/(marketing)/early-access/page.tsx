import type { Metadata } from 'next';
import EarlyAccessClient from './EarlyAccessClient';

export const metadata: Metadata = {
  title: 'CloseCraft Early Access — From Lead Generation to Sales Closing',
  description: 'One integrated growth system. Acquire potential customers, manage enquiries, follow up in under 15 minutes, book appointments, and close more sales with CloseCraft Early Access.',
  openGraph: {
    title: 'CloseCraft Early Access — From Lead Generation to Sales Closing',
    description: 'Transform customer acquisition and sales conversion with an integrated growth system combining managed ads, CRM follow-up, remote setters, and trained closers.',
    url: 'https://www.closecrafthq.com/early-access',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'Closecraft Early Access Programme',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CloseCraft Early Access — From Lead Generation to Sales Closing',
    description: 'From lead generation to sales closing. One integrated growth system for ambitious businesses.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
  },
};

export default function EarlyAccessPage() {
  return <EarlyAccessClient />;
}
