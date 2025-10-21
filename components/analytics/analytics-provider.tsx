'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  page: (name?: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  track: () => {},
  identify: () => {},
  page: () => {},
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname, searchParams]);

  const track = (event: string, properties?: Record<string, any>) => {
    // In production, send to your analytics service (e.g., Segment, Mixpanel, PostHog)
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', { event, properties });
    }

    // Example: Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }

    // Example: Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
      }).catch((error) => {
        console.error('Analytics tracking failed:', error);
      });
    }
  };

  const identify = (userId: string, traits?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Identify:', { userId, traits });
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', { user_id: userId, ...traits });
    }
  };

  const page = (name?: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Page View:', { name, properties });
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: name || document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...properties,
      });
    }
  };

  const trackPageView = (pathname: string) => {
    page(undefined, { path: pathname });
  };

  return (
    <AnalyticsContext.Provider value={{ track, identify, page }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Convenience hook for tracking events
export function useTrack() {
  const { track } = useAnalytics();
  return track;
}

// Convenience hook for identifying users
export function useIdentify() {
  const { identify } = useAnalytics();
  return identify;
}
