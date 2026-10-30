import React from 'react';
import type { Metadata } from 'next';
import DSSLandingClient from './DSSLandingClient';

export const metadata: Metadata = {
  title: 'Digital Sales School | Four-Week Remote Sales Sprint',
  description:
    'Build practical appointment-setting and closing skills through 12 live workshops. Explore the four-week DSS sprint and apply for the next confirmed cohort.',
};

export default function DSSPage() {
  return <DSSLandingClient />;
}
