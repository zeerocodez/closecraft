import React from 'react';
import type { Metadata } from 'next';
import DSSLandingClient from './DSSLandingClient';

export const metadata: Metadata = {
  title: 'Digital Sales School (DSS) | Master High-Ticket Closing',
  description:
    'Learn the skill behind the sale. Master high-ticket closing, discovery calls, and objection handling in an 8-week intensive. Powered by Closecraft.',
};

export default function DSSPage() {
  return <DSSLandingClient />;
}
