import type { Metadata } from 'next';
import AppointmentSettingClient from './AppointmentSettingClient';

export const metadata: Metadata = {
  title: 'Dedicated Remote Appointment Setting — Closecraft',
  description: 'Convert raw enquiries into confirmed calendar bookings. Dedicated, DSS-trained remote SDRs qualify inbound leads and schedule meetings for your closers.',
  openGraph: {
    title: 'Dedicated Remote Appointment Setting — Closecraft',
    description: 'Trained remote appointment setters qualifying your inbound enquiries and booking confirmed meetings directly into your sales diary.',
    url: 'https://www.closecrafthq.com/services/appointment-setting',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'CloseCraft Appointment Setting',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dedicated Remote Appointment Setting — Closecraft',
    description: 'Vetted remote SDRs qualifying leads and filling your sales calendar.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
  },
};

export default function AppointmentSettingPage() {
  return <AppointmentSettingClient />;
}
