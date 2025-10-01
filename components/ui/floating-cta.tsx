"use client";

import { useEffect, useState } from "react";
import { ShinyButton } from "./shiny-button";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function FloatingCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 800px down
      const shouldShow = window.scrollY > 800 && !dismissed;
      setShow(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-area-inset-bottom"
        >
          <div className="relative bg-gradient-to-r from-emerald-500/95 to-cyan-500/95 backdrop-blur-xl rounded-full shadow-2xl shadow-emerald-500/50 px-6 py-3 flex items-center gap-3 border border-white/20">
            <Link href="/pricing">
              <ShinyButton className="bg-transparent hover:bg-white/10 transition-all flex items-center gap-2 text-white font-semibold text-sm md:text-base">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </ShinyButton>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors touch-manipulation"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
