import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";

export const metadata: Metadata = {
  title: "ZCAT — AI-Powered Assessment Platform",
  description: "Enterprise-grade AI-powered coding assessments, proctoring, and analytics platform for smart hiring, testing, and skill evaluation. Trusted by 500+ companies.",
  keywords: ["assessment platform", "coding test", "AI proctoring", "technical hiring", "HackerRank alternative", "online examination"],
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
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#161b22', color: '#fff', border: '1px solid #21262d' } }} />
      </body>
    </html>
  );
}
