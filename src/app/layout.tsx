import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#f8fafc",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased light ${inter.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] text-[#0f172a]">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)',
            },
          }}
        />
      </body>
    </html>
  );
}
