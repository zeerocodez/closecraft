import type { Metadata } from 'next';
import FullCalculatorPageClient from '@/components/tools/FullCalculatorPageClient';
import JsonLd from '@/components/seo/JsonLd';
import { getSoftwareApplicationJsonLd } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Revenue Leakage ROI Calculator — CloseCraft HQ',
  description: 'Estimate how much revenue your business is losing to delayed lead responses and neglected follow-ups. Calculate your recovered sales potential with CloseCraft.',
  openGraph: {
    title: 'Revenue Leakage ROI Calculator — CloseCraft HQ',
    description: 'Estimate how much revenue your business is losing to delayed lead responses and neglected follow-ups.',
    url: 'https://www.closecrafthq.com/calculator',
    siteName: 'CloseCraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revenue Leakage ROI Calculator — CloseCraft HQ',
    description: 'Estimate how much revenue your business is losing to delayed lead responses.',
    creator: '@closecrafthq',
  },
};

export default function CalculatorPage() {
  const jsonLd = getSoftwareApplicationJsonLd({
    name: 'CloseCraft Revenue Leakage ROI Calculator',
    url: 'https://www.closecrafthq.com/calculator',
    description: 'Estimate how much revenue your business is losing to delayed lead responses and neglected follow-ups. Calculate your recovered sales potential.',
    applicationCategory: 'CalculatorApplication',
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <FullCalculatorPageClient />
    </>
  );
}

