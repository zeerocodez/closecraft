import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import LoopGuide from "@/components/guide/LoopGuide";
import CookieConsent from "@/components/layout/CookieConsent";
import "./globals.css";

const inter = Inter({
 subsets: ["latin"],
 variable: "--font-inter",
 weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
 subsets: ["latin"],
 variable: "--font-plus-jakarta",
 weight: ["600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B1117",
};

export const metadata: Metadata = {
  title: "Closecraft | Know Who Is Following Up",
  description: "Closecraft helps service businesses manage enquiries, enforce follow-up accountability, and close more of the leads they already have.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/closecraft-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/images/icon-192x192.png',
  },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <link 
 href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
 rel="stylesheet" 
 />
 </head>
 <body
 suppressHydrationWarning
 className={`${inter.variable} ${plusJakartaSans.variable} font-body-lg antialiased bg-surface text-on-surface flex flex-col min-h-screen selection:bg-primary selection:text-on-primary`}
 >
 {children}
 <LoopGuide />
 <CookieConsent />
 </body>
 </html>
 );
}
