"use client";

import { ReactNode } from "react";

interface ShinyButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

export function ShinyButton({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
}: ShinyButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`shiny-button ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {!disabled && (
        <div className="shiny-button-shine" />
      )}
    </button>
  );
}
