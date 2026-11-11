import type { Metadata } from 'next';
import SalesClosingClient from './SalesClosingClient';

export const metadata: Metadata = {
  title: 'High-Ticket Remote Sales Closing — Closecraft',
  description: 'Vetted, high-performing remote sales closers trained through the Digital Sales School. Discovery calls, objection handling, and deal closing on performance.',
  openGraph: {
    title: 'High-Ticket Remote Sales Closing — Closecraft',
    description: 'Expert remote sales closers conducting discovery calls, proposals, and contract closing for ambitious B2B and high-ticket companies.',
    url: 'https://www.closecrafthq.com/services/sales-closing',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'CloseCraft Sales Closing',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'High-Ticket Remote Sales Closing — Closecraft',
    description: 'Trained remote sales closers accelerating your revenue conversion.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
  },
};

export default function SalesClosingPage() {
  return <SalesClosingClient />;
}
