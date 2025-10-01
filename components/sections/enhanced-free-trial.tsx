"use client";

import { useState } from "react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const popularTickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "AMZN"];

export function EnhancedFreeTrialForm() {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateTicker = (value: string) => {
    const upperValue = value.toUpperCase();
    if (upperValue.length === 0) return "";
    if (upperValue.length > 5) return "Ticker too long";
    if (!/^[A-Z]+$/.test(upperValue)) return "Letters only";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateTicker(ticker);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (ticker.length === 0) {
      setError("Please enter a stock ticker");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setTicker("");
      }, 3000);
    }, 2000);
  };

  const handleTickerChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setTicker(upperValue);
    setError(validateTicker(upperValue));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={ticker}
            onChange={(e) => handleTickerChange(e.target.value)}
            placeholder="Enter stock ticker (e.g., AAPL)"
            disabled={isLoading || success}
            className={`w-full px-6 py-3 bg-white/5 backdrop-blur border ${
              error
                ? "border-red-500/50"
                : success
                ? "border-emerald-500/50"
                : "border-white/10"
            } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all disabled:opacity-50`}
            maxLength={5}
          />
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle className="h-5 w-5 text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ShinyButton
          type="submit"
          disabled={isLoading || success || !!error}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Success!</span>
            </>
          ) : (
            <>
              <span>Analyze Now</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </ShinyButton>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-slate-500">Try popular stocks:</span>
        {popularTickers.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTickerChange(t)}
            disabled={isLoading || success}
            className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-300 hover:text-white transition-all disabled:opacity-50 touch-manipulation"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
