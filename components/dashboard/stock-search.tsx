"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

const POPULAR_TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN"];

export function StockSearch() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanTicker = ticker.trim().toUpperCase();

    if (!cleanTicker) {
      setError("Please enter a stock ticker");
      return;
    }

    if (!/^[A-Z]{1,5}$/.test(cleanTicker)) {
      setError("Ticker must be 1-5 letters");
      return;
    }

    setIsLoading(true);
    // Navigate to analysis page
    router.push(`/dashboard/analyze/${cleanTicker}`);
  };

  const handleQuickSelect = (selectedTicker: string) => {
    setTicker(selectedTicker);
    setError("");
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="Enter stock ticker (e.g., AAPL, TSLA, NVDA)"
            maxLength={5}
            className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-lg touch-manipulation ${
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                : "border-white/10 focus:border-emerald-500 focus:ring-emerald-500/30"
            }`}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            "Analyze Stock"
          )}
        </button>
      </form>

      {/* Quick Select Buttons */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-slate-400 mb-2">Popular stocks:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TICKERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleQuickSelect(t)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-lg text-sm text-slate-300 hover:text-white transition-all touch-manipulation"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
