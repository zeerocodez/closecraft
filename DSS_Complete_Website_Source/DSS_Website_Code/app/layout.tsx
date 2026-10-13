import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DSS | Learn to close the deal', description: 'Practical high-ticket closing and digital sales training. Build your sales kit through 16 lessons, with an affiliate programme for approved partners.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) { return <html lang="en"><body>{children}</body></html>; }
