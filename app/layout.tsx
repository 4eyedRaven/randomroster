// app/layout.tsx
import type { Metadata } from "next";
import localFont from 'next/font/local';
import "../styles/globals.css";
import ClientWrapper from "../components/ClientWrapper";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

// Import Geist as a local font
const geist = localFont({
  src: [
    {
      path: '../public/fonts/Geist/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist',
  display: 'swap',
});

// Import Geist Mono as a local font
const geistMono = localFont({
  src: [
    {
      path: '../public/fonts/GeistMono/GeistMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeistMono/GeistMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
  display: 'swap',
});

// Remove themeColor from metadata and add a separate viewport export.
export const metadata: Metadata = {
  title: "Random Roster",
  description: "Random Roster is a web app for managing classes and generating randomized rosters.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// New viewport export for themeColor
export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <ClientWrapper>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </ClientWrapper>
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}