'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { OrbBackground } from '@/components/ui/orb-background';

export default function PricingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Pricing page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <OrbBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Unable to Load Pricing
          </h1>
          <p className="text-slate-400 mb-6 leading-relaxed">
            We encountered an issue loading the pricing information. This might be a temporary problem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5
                         bg-gradient-to-r from-emerald-500 to-cyan-500
                         hover:from-emerald-600 hover:to-cyan-600
                         text-white font-medium rounded-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5
                         bg-white/10 hover:bg-white/20
                         text-white font-medium rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
