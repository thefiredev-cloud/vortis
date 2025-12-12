import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
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
  metadataBase: new URL('https://vortis.io'),
  title: {
    default: "Vortis - AI-Powered Trading Intelligence",
    template: "%s | Vortis",
  },
  description: "Access comprehensive financial intelligence from 8,000+ public companies. Analyze SEC filings, earnings transcripts, and institutional holdings in seconds with Claude Opus 4.5 AI.",
  keywords: [
    "stock analysis",
    "SEC filings",
    "trading intelligence",
    "financial AI",
    "market research",
    "earnings analysis",
    "institutional holdings",
    "13F filings",
    "technical indicators",
    "investment research",
  ],
  authors: [{ name: "Vortis", url: "https://vortis.io" }],
  creator: "Vortis",
  publisher: "Vortis",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://vortis.io",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
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
    url: "https://vortis.io",
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
    creator: "@vortis_io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = Boolean(
    clerkPublishableKey &&
    clerkPublishableKey.startsWith('pk_') &&
    !clerkPublishableKey.includes('your_publishable_key_here')
  );

  return (
    hasValidClerkKey ? (
      <ClerkProvider
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: '#10b981',
            colorBackground: '#000000',
            colorInputBackground: 'rgba(255, 255, 255, 0.05)',
            colorInputText: '#ffffff',
            colorText: '#ffffff',
            colorTextSecondary: '#94a3b8',
            borderRadius: '0.5rem',
          },
          elements: {
            formButtonPrimary:
              'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600',
            card: 'bg-black/50 backdrop-blur-xl border border-white/10',
            headerTitle: 'text-white',
            headerSubtitle: 'text-slate-400',
            socialButtonsBlockButton:
              'bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20',
            footerActionLink: 'text-emerald-400 hover:text-emerald-300',
          },
        }}
      >
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
            <Providers>{children}</Providers>
          </body>
        </html>
      </ClerkProvider>
    ) : (
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
          <Providers>
            <div className="fixed inset-x-0 top-0 z-50 bg-yellow-500 text-black text-sm text-center py-2">
              Auth disabled: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable Clerk.
            </div>
            <div className="pt-10">
              {children}
            </div>
          </Providers>
        </body>
      </html>
    )
  );
}
