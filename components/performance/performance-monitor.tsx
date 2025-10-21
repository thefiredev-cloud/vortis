'use client';

import { useEffect } from 'react';

/**
 * Performance monitoring component for tracking Web Vitals and custom metrics
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Track Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        reportMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            reportMetric('CLS', clsScore);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      // Time to First Byte (TTFB)
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      if (navigationEntry) {
        reportMetric('TTFB', navigationEntry.responseStart - navigationEntry.requestStart);
      }
    }

    // Track custom performance metrics
    const measureLoadTime = () => {
      if (document.readyState === 'complete') {
        const navTiming = performance.getEntriesByType('navigation')[0] as any;
        if (navTiming) {
          reportMetric('DOM_CONTENT_LOADED', navTiming.domContentLoadedEventEnd - navTiming.fetchStart);
          reportMetric('LOAD_COMPLETE', navTiming.loadEventEnd - navTiming.fetchStart);
        }
      }
    };

    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, []);

  return null;
}

/**
 * Report performance metric to analytics
 */
function reportMetric(name: string, value: number) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance Metric - ${name}:`, Math.round(value), 'ms');
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'performance_metric', {
      metric_name: name,
      metric_value: Math.round(value),
    });
  }

  // Send to custom endpoint if configured
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'performance_metric',
        properties: {
          metric: name,
          value: Math.round(value),
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Get performance rating based on Web Vitals thresholds
 */
export function getPerformanceRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metric];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}
