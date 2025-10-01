"use client";

import { motion } from "framer-motion";
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
    <motion.span
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent font-bold ${className}`}
    >
      {children}
    </motion.span>
  );
}
