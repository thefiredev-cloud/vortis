'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('vortis-cookie-consent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('vortis-cookie-consent', 'all');
    localStorage.setItem('vortis-cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('vortis-cookie-consent', 'essential');
    localStorage.setItem('vortis-cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-1">Cookie Preferences</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.
                By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our{' '}
                <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300 underline">
                  Cookie Policy
                </Link>{' '}
                for more information.
              </p>
            </div>
          </div>
          <button
            onClick={acceptEssential}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close cookie banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:justify-end">
          <button
            onClick={acceptEssential}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white
                       bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm font-medium text-white
                       bg-gradient-to-r from-emerald-500 to-cyan-500
                       hover:from-emerald-600 hover:to-cyan-600
                       rounded-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
