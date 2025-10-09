import { Loader2 } from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";

/**
 * OAuth Callback Loading State
 *
 * Displayed while processing OAuth authentication
 * after user authorizes via Google.
 */
export default function AuthCallbackLoading() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      <OrbBackground />

      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Vortis
          </h1>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            {/* Inner glow */}
            <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <p className="text-white text-lg font-medium">Signing you in...</p>
          <p className="text-slate-400 text-sm">
            Please wait while we verify your account
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
