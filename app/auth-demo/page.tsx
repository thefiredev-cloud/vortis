"use client";

import { useState } from "react";
import {
  GoogleSignInButton,
  GoogleSignInButtonDark,
  AuthCard,
  AuthError,
  InlineAuthError,
} from "@/components/auth";
import { OrbBackground } from "@/components/ui/orb-background";

/**
 * Auth Components Demo Page
 *
 * Visual testing and demonstration of all auth components.
 * This page is for development/testing only.
 */
export default function AuthDemoPage() {
  const [lightError, setLightError] = useState<string | null>(null);
  const [darkError, setDarkError] = useState<string | null>(null);
  const [showFullError, setShowFullError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Auth Components Demo
          </h1>
          <p className="text-sm text-gray-600">
            Visual testing for Google OAuth components
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* Section 1: Light Theme Button */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            1. Google Sign-In Button (Light Theme)
          </h2>
          <p className="text-gray-600 mb-6">
            Official Google branding on light backgrounds
          </p>

          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md">
            <GoogleSignInButton
              text="Continue with Google"
              onSignInStart={() => {
                console.log("Light button: Sign-in started");
                setLightError(null);
              }}
              onError={(error) => {
                console.error("Light button error:", error);
                setLightError(error.message);
              }}
            />

            {/* States */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() =>
                  setLightError("Example error: Network request failed")
                }
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Simulate Error
              </button>
              <button
                onClick={() => setLightError(null)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Clear Error
              </button>
            </div>

            {lightError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {lightError}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Dark Theme Button */}
        <section className="relative">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            2. Google Sign-In Button (Dark Theme)
          </h2>
          <p className="text-gray-600 mb-6">
            Optimized for Vortis dark backgrounds
          </p>

          <div className="relative bg-black rounded-xl p-8 overflow-hidden">
            <OrbBackground />

            <div className="relative z-10 max-w-md mx-auto">
              <GoogleSignInButtonDark
                text="Sign up with Google"
                onSignInStart={() => {
                  console.log("Dark button: Sign-in started");
                  setDarkError(null);
                }}
                onError={(error) => {
                  console.error("Dark button error:", error);
                  setDarkError(error.message);
                }}
              />

              {/* Test Controls */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() =>
                    setDarkError("Example error: Authentication cancelled by user")
                  }
                  className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm text-white"
                >
                  Simulate Error
                </button>
                <button
                  onClick={() => setDarkError(null)}
                  className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm text-white"
                >
                  Clear Error
                </button>
              </div>

              {darkError && <InlineAuthError error={darkError} className="mt-4" />}
            </div>
          </div>
        </section>

        {/* Section 3: Button States */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            3. Button States
          </h2>
          <p className="text-gray-600 mb-6">
            Different button states and configurations
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Normal */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Normal</h3>
              <GoogleSignInButton text="Continue with Google" />
            </div>

            {/* Disabled */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Disabled</h3>
              <GoogleSignInButton text="Continue with Google" disabled />
            </div>

            {/* Custom Text */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Custom Text</h3>
              <GoogleSignInButton text="Sign in to Vortis" />
            </div>

            {/* Dark Disabled */}
            <div className="bg-black rounded-xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10" />
              <h3 className="font-semibold text-white mb-3 relative">
                Dark Disabled
              </h3>
              <GoogleSignInButtonDark text="Sign up with Google" disabled />
            </div>
          </div>
        </section>

        {/* Section 4: Error Components */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            4. Error Components
          </h2>
          <p className="text-gray-600 mb-6">
            Error display variants
          </p>

          <div className="space-y-6">
            {/* Inline Error */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Inline Error</h3>
              <InlineAuthError error="This is an example error message that appears inline within forms." />
            </div>

            {/* Full Error Component */}
            <div className="bg-black rounded-xl p-6 relative overflow-hidden">
              <OrbBackground />
              <div className="relative z-10">
                <h3 className="font-semibold text-white mb-4">
                  Full Error Component
                </h3>
                <button
                  onClick={() => setShowFullError(!showFullError)}
                  className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded"
                >
                  {showFullError ? "Hide" : "Show"} Full Error
                </button>

                {showFullError && (
                  <AuthError
                    error="Technical error details: OAuth callback failed with status 401"
                    errorCode="access_denied"
                    onRetry={() => {
                      console.log("Retry clicked");
                      setShowFullError(false);
                    }}
                    showLoginLink={true}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Auth Card */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            5. Auth Card Component
          </h2>
          <p className="text-gray-600 mb-6">
            Glass-morphism card for auth content
          </p>

          <div className="bg-black rounded-xl p-6 relative overflow-hidden">
            <OrbBackground />
            <div className="relative z-10 max-w-md mx-auto">
              <AuthCard>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Welcome to Vortis
                </h3>
                <p className="text-slate-400 mb-6">
                  Sign in to access your trading intelligence dashboard
                </p>
                <GoogleSignInButtonDark />
                <p className="mt-6 text-xs text-center text-slate-500">
                  By continuing, you agree to our Terms and Privacy Policy
                </p>
              </AuthCard>
            </div>
          </div>
        </section>

        {/* Section 6: Accessibility Tests */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            6. Accessibility Tests
          </h2>
          <p className="text-gray-600 mb-6">
            Keyboard navigation and screen reader support
          </p>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <strong>Keyboard Navigation:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tab: Focus on button</li>
                  <li>Enter/Space: Activate button</li>
                  <li>Shift+Tab: Focus previous element</li>
                </ul>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Screen Reader:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Button has descriptive aria-label</li>
                  <li>Loading state announced (aria-busy)</li>
                  <li>Errors announced (aria-live)</li>
                </ul>
              </div>

              <div className="mt-4">
                <GoogleSignInButton text="Test Accessibility" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Integration Test */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            7. Full Integration Example
          </h2>
          <p className="text-gray-600 mb-6">
            Complete login flow simulation
          </p>

          <div className="bg-black rounded-xl p-6 relative overflow-hidden min-h-[500px] flex items-center justify-center">
            <OrbBackground />

            <div className="relative z-10 w-full max-w-md px-6">
              {/* Logo */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Vortis
                </h1>
              </div>

              {/* Auth Card */}
              <AuthCard>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Sign in to Vortis
                </h2>
                <p className="text-slate-400 mb-6">
                  Access your AI-powered trading intelligence dashboard
                </p>

                <GoogleSignInButtonDark
                  text="Continue with Google"
                  onSignInStart={() => console.log("Full integration test started")}
                />

                {/* Terms */}
                <p className="mt-6 text-xs text-center text-slate-500">
                  By continuing, you agree to our{" "}
                  <span className="text-emerald-400">Terms of Service</span> and{" "}
                  <span className="text-emerald-400">Privacy Policy</span>
                </p>

                {/* Divider */}
                <div className="my-8 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/5 px-4 text-slate-400">
                      New to Vortis?
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <button className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Create your free account
                  </button>
                </div>
              </AuthCard>

              {/* Back Link */}
              <div className="mt-6 text-center">
                <button className="text-slate-400 hover:text-white text-sm transition-colors">
                  ← Back to home
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Notes */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">
            Developer Notes
          </h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Note:</strong> This demo page is for testing only. Remove before
              production deployment.
            </p>
            <p>
              <strong>OAuth Flow:</strong> In development, clicking buttons will
              initiate real OAuth. Cancel the popup to test error states.
            </p>
            <p>
              <strong>Console Logs:</strong> Open browser console to see callback
              events.
            </p>
            <p>
              <strong>Accessibility:</strong> Test with keyboard (Tab, Enter) and
              screen readers (VoiceOver, NVDA).
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>Auth Components Demo • Vortis Trading Intelligence</p>
          <p className="mt-1">
            See{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              /components/auth/README.md
            </code>{" "}
            for documentation
          </p>
        </div>
      </div>
    </div>
  );
}
