import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import JsonLd from '@/components/seo/JsonLd';
import { getOrganizationJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Contact Closecraft — Sales, Support & Partnerships',
  description: 'Reach the Closecraft sales and solutions engineering team. Inquire about managed sales outsourcing, revenue software, or Digital Sales School partnerships.',
  alternates: {
    canonical: 'https://www.closecrafthq.com/contact',
  },
  openGraph: {
    title: 'Contact Closecraft — Sales, Support & Partnerships',
    description: 'Reach the Closecraft sales and solutions engineering team. Inquire about managed sales outsourcing, revenue software, or Digital Sales School partnerships.',
    url: 'https://www.closecrafthq.com/contact',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'Contact Closecraft',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Closecraft — Sales, Support & Partnerships',
    description: 'Direct contact channels for Closecraft revenue systems.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
    site: '@closecrafthq',
  },
};

export default function ContactPage() {
  const orgSchema = getOrganizationJsonLd();
  const breadcrumbsSchema = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  return (
    <>
      <JsonLd data={[orgSchema, breadcrumbsSchema]} />
      <ContactClient />
    </>
  );
}
