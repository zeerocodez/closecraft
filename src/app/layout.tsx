import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import LoopGuide from "@/components/guide/LoopGuide";
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

export const metadata: Metadata = {
  title: "Closecraft | Learn to Close. Get Paid to Close.",
  description: "Sales closer training and placement for the remote economy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} font-body-lg antialiased bg-surface text-on-surface flex flex-col min-h-screen selection:bg-primary selection:text-on-primary`}
      >
        {children}
        <LoopGuide />
      </body>
    </html>
  );
}
