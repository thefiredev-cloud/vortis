"use client";

import { useState } from "react";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ManageSubscriptionButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ManageSubscriptionButton({
  className = "",
  variant = "default",
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManage = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error(data.error || "Failed to open subscription management");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const baseStyles =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    default:
      "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white",
    outline:
      "bg-transparent border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10",
    ghost: "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white",
  };

  return (
    <button
      onClick={handleManage}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <Settings className="h-4 w-4" />
          <span>Manage Subscription</span>
        </>
      )}
    </button>
  );
}
