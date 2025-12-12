"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CheckoutButtonProps {
  planName: "starter" | "pro" | "enterprise";
  priceId: string;
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  planName,
  priceId: _priceId,
  className,
  children,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const paymentsEnabled = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_'));

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Get current user
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please sign in to continue");
        router.push("/auth/login?redirect=/pricing");
        return;
      }

      if (!paymentsEnabled) {
        toast.info("Payments are disabled in this preview.");
        return;
      }

      // Create checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planName,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error("Checkout error:", data.error);
        toast.error(data.error || "Failed to create checkout session");
        return;
      }

      // Redirect to Stripe Checkout using the session URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
