import React from 'react';
import type { Metadata } from 'next';
import DSSLandingClient from './DSSLandingClient';

export const metadata: Metadata = {
  title: 'Digital Sales School | Four-Week Remote Sales Sprint',
  description:
    'Build practical appointment-setting and closing skills through 12 live workshops. Explore the four-week DSS sprint and apply for the next confirmed cohort.',
  openGraph: {
    title: 'Digital Sales School | Four-Week Remote Sales Sprint',
    description:
      'Build practical appointment-setting and closing skills through 12 live workshops. Explore the four-week DSS sprint and apply for the next confirmed cohort.',
    url: 'https://www.closecrafthq.com/dss',
    siteName: 'Digital Sales School',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/dss-og.png',
        width: 1200,
        height: 630,
        alt: 'Digital Sales School — Four-Week Remote Sales Sprint',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Sales School | Four-Week Remote Sales Sprint',
    description:
      'Build practical appointment-setting and closing skills through 12 live workshops.',
    images: ['/images/dss-og.png'],
    creator: '@closecrafthq',
  },
};

export default function DSSPage() {
  return <DSSLandingClient />;
}
