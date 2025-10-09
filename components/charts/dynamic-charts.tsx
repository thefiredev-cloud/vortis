"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import chart components with ssr:false to reduce initial bundle
export const PriceChart = dynamic(
  () => import("./price-chart").then((mod) => ({ default: mod.PriceChart })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    ),
  }
);

export const MACDChart = dynamic(
  () => import("./macd-chart").then((mod) => ({ default: mod.MACDChart })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[250px] md:h-[300px] flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    ),
  }
);
