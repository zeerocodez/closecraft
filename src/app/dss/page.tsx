import React from 'react';
import type { Metadata } from 'next';
import DSSLandingClient from './DSSLandingClient';

export const metadata: Metadata = {
  title: 'Digital Sales School (DSS) | Productized Sales Tracks & Closing Academy',
  description:
    'Learn the skill behind the sale. 4 productized sales tracks: Setters Route (₦100k / $100), Closers Route (₦100k / $100), Live Role Plays/Internship (₦100k / $100), and Both Routes (₦150k / $150). Powered by Closecraft.',
};

export default function DSSPage() {
  return <DSSLandingClient />;
}
