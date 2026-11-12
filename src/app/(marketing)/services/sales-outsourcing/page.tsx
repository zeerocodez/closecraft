import type { Metadata } from 'next';
import SalesOutsourcingClient from './SalesOutsourcingClient';
import JsonLd from '@/components/seo/JsonLd';
import { getServiceJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Managed Sales Outsourcing for High-Ticket Businesses — Closecraft',
  description: 'Deploy a dedicated team of certified remote appointment setters, closers, and pipeline managers. Fast response times, enterprise playbooks, and zero hiring overhead.',
  alternates: {
    canonical: 'https://www.closecrafthq.com/services/sales-outsourcing',
  },
  openGraph: {
    title: 'Managed Sales Outsourcing for High-Ticket Businesses — Closecraft',
    description: 'Deploy a dedicated team of certified remote appointment setters, closers, and pipeline managers. Fast response times, enterprise playbooks, and zero hiring overhead.',
    url: 'https://www.closecrafthq.com/services/sales-outsourcing',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'Closecraft Managed Sales Outsourcing',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Managed Sales Outsourcing for High-Ticket Businesses — Closecraft',
    description: 'Deploy a dedicated team of certified remote appointment setters, closers, and pipeline managers.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
    site: '@closecrafthq',
  },
};

export default function SalesOutsourcingPage() {
  const serviceSchema = getServiceJsonLd({
    name: 'Managed Sales Outsourcing',
    description: 'End-to-end remote sales team deployment including appointment setters, high-ticket closers, and pipeline management.',
    url: '/services/sales-outsourcing',
    serviceType: 'Sales Outsourcing & Revenue Operations',
    category: 'Sales Execution & Pipeline Management',
    offers: {
      price: 'Contact for Enterprise Retainer',
      priceCurrency: 'NGN',
    },
  });

  const breadcrumbsSchema = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/#services' },
    { name: 'Sales Outsourcing', url: '/services/sales-outsourcing' },
  ]);

  const faqsSchema = getFaqJsonLd([
    {
      question: 'What is managed sales outsourcing with CloseCraft?',
      answer: 'Managed sales outsourcing provides your business with a complete, fully trained remote sales team handling your leads from initial enquiry to signed agreement.',
    },
    {
      question: 'How fast can our outsourced sales team deploy?',
      answer: 'Following your onboarding diagnostic and playbook calibration, your dedicated representatives typically activate within 5 to 7 business days.',
    },
    {
      question: 'What tools and CRM do you operate on?',
      answer: 'We integrate directly with your CloseCraft SaaS workspace, and can synchronize updates into HubSpot, Salesforce, or your existing lead database via automated webhooks.',
    },
  ]);

  return (
    <>
      <JsonLd data={[serviceSchema, breadcrumbsSchema, faqsSchema]} />
      <SalesOutsourcingClient />
    </>
  );
}

