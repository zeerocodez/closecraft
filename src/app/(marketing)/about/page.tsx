import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import JsonLd from '@/components/seo/JsonLd';
import { getOrganizationJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'About Closecraft — AI Revenue Operating System & Managed Sales',
  description: 'Learn about Closecraft by Zeerocodes Automation Limited. Our mission is to help ambitious businesses eliminate lead leakage and close more deals with technology and certified sales talent.',
  alternates: {
    canonical: 'https://www.closecrafthq.com/about',
  },
  openGraph: {
    title: 'About Closecraft — AI Revenue Operating System & Managed Sales',
    description: 'Learn about Closecraft by Zeerocodes Automation Limited. We combine enterprise software, remote sales teams, and follow-up accountability.',
    url: 'https://www.closecrafthq.com/about',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'About Closecraft',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Closecraft — AI Revenue Operating System',
    description: 'Transforming enquiry handling into predictable revenue conversion.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
    site: '@closecrafthq',
  },
};

export default function AboutPage() {
  const orgSchema = getOrganizationJsonLd();
  const breadcrumbsSchema = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  return (
    <>
      <JsonLd data={[orgSchema, breadcrumbsSchema]} />
      <AboutClient />
    </>
  );
}

