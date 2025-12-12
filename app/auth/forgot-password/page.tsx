"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

/**
 * Forgot Password Page - Redirect to Login
 *
 * Since Vortis uses Google OAuth authentication only,
 * password reset is not applicable. This page informs users
 * and redirects them to the login page.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <AuthLayout
      title="Password reset not available"
      subtitle="Vortis uses secure Google authentication"
      showBackLink={false}
    >
      {/* Info Message */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-blue-400 font-medium text-sm mb-1">
            Google Sign-In Only
          </h3>
          <p className="text-slate-300 text-sm">
            Vortis uses Google OAuth for secure authentication. You don&apos;t need to
            manage a separate password. Simply sign in with your Google account.
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-4 text-slate-400 text-sm mb-8">
        <p>
          If you&apos;re having trouble accessing your account:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Make sure you&apos;re using the correct Google account</li>
          <li>Check if you have access to your Google account</li>
          <li>
            Visit{" "}
            <a
              href="https://accounts.google.com/signin/recovery"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Google Account Recovery
            </a>{" "}
            if you need to reset your Google password
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <Link
        href="/auth/login"
        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
      >
        <span>Go to login</span>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>

      {/* Auto-redirect notice */}
      <p className="mt-4 text-xs text-center text-slate-500">
        You&apos;ll be redirected to the login page in a few seconds...
      </p>
    </AuthLayout>
  );
}
