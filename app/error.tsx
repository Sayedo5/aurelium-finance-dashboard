"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Route-level fallback. Catches anything a page throws during render so a
 * single bad value cannot leave the user staring at a blank document.
 */
export default function RouteError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Aurelium] Route error", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-loss-100 text-loss-600 dark:bg-loss-900/40 dark:text-loss-400">
          <AlertTriangle size={20} aria-hidden />
        </span>
        <h1 className="mt-5 text-base font-semibold text-ink">This view failed to load</h1>
        <p className="mt-2 text-sm leading-relaxed text-inkMuted">
          An unexpected error interrupted rendering. No financial data was changed.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-inkSubtle">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-control bg-aurum-400 px-5 text-sm font-medium text-aurum-950 shadow-raised transition hover:bg-aurum-300"
          >
            <RotateCcw size={15} aria-hidden /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-control border border-line bg-surface px-5 text-sm font-medium text-ink transition hover:border-lineStrong"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </main>
  );
}
