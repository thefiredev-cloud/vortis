"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  features: string[];
  featured?: boolean;
  plan: "starter" | "pro" | "enterprise";
  isEnterprise?: boolean;
}

export function PricingCard({
  name,
  description,
  price,
  features,
  featured = false,
  plan,
  isEnterprise = false,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (isEnterprise) {
      // For enterprise, redirect to contact form
      window.location.href = "mailto:sales@vortis.ai?subject=Enterprise Plan Inquiry";
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  const checkColor = featured
    ? "text-emerald-400"
    : isEnterprise
    ? "text-purple-400"
    : "text-emerald-400";

  const cardClass = featured
    ? "bg-gradient-to-b from-emerald-500/20 to-cyan-500/10 backdrop-blur-xl border-2 border-emerald-500/70 rounded-2xl p-8 relative transform md:scale-105 shadow-2xl shadow-emerald-500/40 h-full"
    : "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300";

  return (
    <div className={cardClass}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full">
          MOST POPULAR
        </div>
      )}

      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <p className="text-slate-400 mb-6">{description}</p>

      <div className="mb-8">
        <span className="text-5xl font-bold text-white">{price}</span>
        <span className="text-slate-400">/month</span>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <Check className={`h-5 w-5 ${checkColor} mt-0.5 flex-shrink-0`} />
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      {featured ? (
        <ShinyButton
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </span>
          ) : (
            "Get Started"
          )}
        </ShinyButton>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full py-3 font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
            isEnterprise
              ? "bg-purple-600 hover:bg-purple-500 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-white"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </span>
          ) : isEnterprise ? (
            "Contact Sales"
          ) : (
            "Get Started"
          )}
        </button>
      )}
    </div>
  );
}
