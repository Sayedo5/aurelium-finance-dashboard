"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary. It replaces the whole document, so it cannot rely on
 * the app's providers or Tailwind theme tokens — the styles here are inline.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Aurelium] Fatal error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#070a10",
          color: "#eef2f8",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem"
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.16em", color: "#e8b34a" }}>
            AURELIUM LEDGER
          </p>
          <h1 style={{ marginTop: "0.75rem", fontSize: "1.125rem" }}>Something went badly wrong</h1>
          <p style={{ marginTop: "0.5rem", color: "#97a3b8", lineHeight: 1.6 }}>
            The application could not recover. Reloading usually resolves it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.625rem",
              border: "none",
              background: "#e8b34a",
              color: "#3d1f0c",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Reload the dashboard
          </button>
        </div>
      </body>
    </html>
  );
}
