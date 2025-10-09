"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Critical error logging
    console.error("CRITICAL ERROR:", error);

    // Send to error tracking service
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: true,
      });
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#000000",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                display: "inline-flex",
                padding: "16px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "50%",
                marginBottom: "24px",
              }}
            >
              <AlertTriangle
                style={{
                  width: "64px",
                  height: "64px",
                  color: "#f87171",
                }}
                aria-hidden="true"
              />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "16px",
                color: "#ffffff",
              }}
            >
              Critical Application Error
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: "18px",
                color: "#cbd5e1",
                marginBottom: "32px",
                lineHeight: "1.6",
              }}
            >
              A critical error has occurred and the application needs to restart.
              This issue has been logged and our team will investigate.
            </p>

            {/* Error Details */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "32px",
                textAlign: "left",
              }}
            >
              <details>
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#94a3b8",
                    fontWeight: "500",
                    marginBottom: "12px",
                  }}
                >
                  Error Details
                </summary>
                <div
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "8px",
                    padding: "12px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#f87171",
                    overflowX: "auto",
                    marginTop: "12px",
                  }}
                >
                  <p style={{ margin: 0, wordBreak: "break-all" }}>
                    {error.message}
                  </p>
                </div>
                {error.digest && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "8px",
                      marginBottom: 0,
                    }}
                  >
                    Error ID: {error.digest}
                  </p>
                )}
              </details>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "16px 24px",
                  background: "linear-gradient(to right, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                aria-label="Restart application"
              >
                <RefreshCw style={{ width: "20px", height: "20px" }} aria-hidden="true" />
                <span>Restart Application</span>
              </button>

              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/";
                  }
                }}
                style={{
                  padding: "16px 24px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                }}
                aria-label="Clear data and restart"
              >
                Clear Data & Restart
              </button>
            </div>

            {/* Help Text */}
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginTop: "32px",
              }}
            >
              If this problem persists, please contact{" "}
              <a
                href="mailto:support@vortis.app"
                style={{
                  color: "#10b981",
                  textDecoration: "underline",
                }}
              >
                support@vortis.app
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
