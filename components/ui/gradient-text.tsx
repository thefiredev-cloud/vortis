"use client";

import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className = "",
  from = "from-emerald-400",
  to = "to-cyan-400",
  animate = true,
}: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent font-bold ${
        animate ? "fade-in-up" : ""
      } ${className}`}
      style={animate ? { animationDuration: "0.8s" } : undefined}
    >
      {children}
    </span>
  );
}
