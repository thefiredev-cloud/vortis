"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export function LiveCounter() {
  const [count, setCount] = useState(8234);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
      <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
      <span className="text-xs text-slate-400">
        <span className="text-emerald-400 font-semibold">
          {count.toLocaleString()}
        </span>{" "}
        analyses run today
      </span>
    </div>
  );
}
