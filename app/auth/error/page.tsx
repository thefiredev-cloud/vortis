"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthError } from "@/components/auth/auth-error";

/**
 * Authentication Error Page
 *
 * Displays user-friendly error messages when OAuth fails.
 * Provides retry and navigation options.
 */
export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorCodeParam = searchParams.get("error_code");
    const errorDescription = searchParams.get("error_description");

    if (errorParam) {
      setError(errorDescription || decodeURIComponent(errorParam));
    }

    if (errorCodeParam) {
      setErrorCode(errorCodeParam);
    }
  }, [searchParams]);

  const handleRetry = () => {
    router.push("/auth/login");
  };

  return (
    <AuthLayout showBackLink={false}>
      <AuthError
        error={error}
        errorCode={errorCode}
        onRetry={handleRetry}
        showLoginLink={true}
      />
    </AuthLayout>
  );
}
