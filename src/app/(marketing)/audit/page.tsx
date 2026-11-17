import type { Metadata } from 'next';
import FullDiagnosticAuditClient from '@/components/tools/FullDiagnosticAuditClient';
import JsonLd from '@/components/seo/JsonLd';
import { getSoftwareApplicationJsonLd } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Interactive Follow-Up Diagnostic Audit — CloseCraft HQ',
  description: 'Identify where your business is losing revenue to delayed inquiries and forgotten follow-ups. Get an instant diagnostic breakdown and customized action plan.',
  openGraph: {
    title: 'Interactive Follow-Up Diagnostic Audit — CloseCraft HQ',
    description: 'Pinpoint where your follow-up breaks down and calculate your monthly revenue at risk.',
    url: 'https://www.closecrafthq.com/audit',
    siteName: 'CloseCraft',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Follow-Up Diagnostic Audit — CloseCraft HQ',
    description: 'Identify where your business is losing revenue to delayed inquiries.',
    creator: '@closecrafthq',
  },
};

export default function AuditPage() {
  const jsonLd = getSoftwareApplicationJsonLd({
    name: 'CloseCraft Follow-Up Diagnostic Audit',
    url: 'https://www.closecrafthq.com/audit',
    description: 'Identify where your sales follow-up process breaks down and calculate your monthly revenue at risk across our 4 connected growth stages.',
    applicationCategory: 'AssessmentApplication',
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <FullDiagnosticAuditClient />
    </>
  );
}

