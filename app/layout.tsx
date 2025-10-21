import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vortis - AI-Powered Trading Intelligence Platform",
    template: "%s | Vortis",
  },
  description:
    "Revolutionary AI-powered trading intelligence. Analyze SEC filings, earnings calls, and 20+ technical indicators for 8,000+ companies. Get instant insights 8-10x faster than traditional research methods.",
  keywords: [
    "stock analysis",
    "AI trading",
    "SEC filings",
    "earnings call analysis",
    "technical indicators",
    "trading intelligence",
    "stock research",
    "market analysis",
    "financial data",
    "investment research",
  ],
  authors: [{ name: "Vortis" }],
  creator: "Vortis",
  publisher: "Vortis",
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
    email: false,
    address: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://vortis.ai"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Vortis",
    title: "Vortis - AI-Powered Trading Intelligence Platform",
    description:
      "Revolutionary AI-powered trading intelligence. Analyze stocks 8-10x faster with instant SEC filing insights, earnings call analysis, and 20+ technical indicators.",
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
    title: "Vortis - AI-Powered Trading Intelligence Platform",
    description:
      "Revolutionary AI-powered trading intelligence. Analyze stocks 8-10x faster with instant insights.",
    images: ["/og-image.png"],
    creator: "@vortis",
  },
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
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
            className="antialiased"
          >
            <ErrorBoundary>
              <AnalyticsProvider>
                <PerformanceMonitor />
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: "rgba(15, 23, 42, 0.95)",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    },
                  }}
                />
              </AnalyticsProvider>
            </ErrorBoundary>
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
          className="antialiased"
        >
          <ErrorBoundary>
            <AnalyticsProvider>
              <PerformanceMonitor />
              <div className="fixed inset-x-0 top-0 z-50 bg-yellow-500 text-black text-sm text-center py-2">
                Auth disabled: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable Clerk.
              </div>
              <div className="pt-10">
                {children}
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "rgba(15, 23, 42, 0.95)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  },
                }}
              />
            </AnalyticsProvider>
          </ErrorBoundary>
        </body>
      </html>
    )
  );
}
