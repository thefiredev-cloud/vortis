import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vortis - AI-Powered Trading Intelligence",
  description: "Access comprehensive financial intelligence from 8,000+ public companies. Analyze SEC filings, earnings transcripts, and institutional holdings in seconds.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vortis",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vortis.ai",
    siteName: "Vortis",
    title: "Vortis - AI-Powered Trading Intelligence",
    description: "Access comprehensive financial intelligence from 8,000+ public companies. Analyze SEC filings, earnings transcripts, and institutional holdings in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vortis - AI-Powered Trading Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vortis - AI-Powered Trading Intelligence",
    description: "Access comprehensive financial intelligence from 8,000+ public companies. Analyze SEC filings, earnings transcripts, and institutional holdings in seconds.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vortis" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
