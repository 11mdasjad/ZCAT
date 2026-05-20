import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#06080f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ZCAT — AI-Powered Assessment Platform",
  description: "Enterprise-grade AI-powered coding assessments, proctoring, and analytics platform for smart hiring, testing, and skill evaluation. Trusted by 500+ companies.",
  keywords: ["assessment platform", "coding test", "AI proctoring", "technical hiring", "HackerRank alternative", "online examination"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://zcat.dev"),
  openGraph: {
    title: "ZCAT — AI-Powered Assessment Platform",
    description: "Enterprise-grade AI-powered coding assessments, proctoring, and analytics.",
    siteName: "ZCAT",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased dark ${inter.variable}`}
    >
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#161b22', color: '#fff', border: '1px solid #21262d' } }} />
      </body>
    </html>
  );
}
