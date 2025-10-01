"use client";

import { useEffect, useRef } from "react";

interface GridPatternProps {
  className?: string;
  strokeWidth?: number;
  gridSize?: number;
  opacity?: number;
}

export function GridPattern({
  className = "",
  strokeWidth = 1,
  gridSize = 50,
  opacity = 0.1,
}: GridPatternProps) {
  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="rgba(52, 211, 153, ${opacity})"
              strokeWidth={strokeWidth}
            />
          </pattern>
          <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(52, 211, 153, 0)" />
            <stop offset="50%" stopColor="rgba(52, 211, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        <rect width="100%" height="100%" fill="url(#grid-gradient)" opacity="0.2" />
      </svg>
    </div>
  );
}
