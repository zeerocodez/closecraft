import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import AffiliateProgramClient from './AffiliateProgramClient';

export const metadata: Metadata = {
  title: 'Affiliate Partner Programme — Closecraft',
  description: 'Earn up to 15% recurring commissions promoting CloseCraft to founders, B2B companies, and sales leaders. Dedicated partner dashboard, 60-day attribution, and direct bank payouts.',
  openGraph: {
    title: 'Affiliate Partner Programme — Closecraft',
    description: 'Earn 15% recurring monthly commissions referring businesses to CloseCraft managed sales services.',
    url: 'https://www.closecrafthq.com/affiliate',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'CloseCraft Affiliate Partner Programme',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CloseCraft Affiliate Programme — 15% Recurring Commission',
    description: 'Refer businesses to CloseCraft and earn reliable monthly commissions.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
  },
};

export default async function AffiliateMarketingPage() {
  const session = await auth();
  let existingProfile: any = null;

  if (session?.user?.id) {
    existingProfile = await db.affiliateProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        referralCode: true,
        status: true,
        commissionRate: true,
      },
    });
  }

  return (
    <AffiliateProgramClient
      currentUser={session?.user || null}
      existingProfile={existingProfile}
    />
  );
}
