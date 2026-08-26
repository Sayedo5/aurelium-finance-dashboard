"use client";

import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { useAppContext, type ToastItem } from "@/components/providers/app-provider";

const toneIcon = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: XCircle
} as const;

const toneStyle: Record<ToastItem["tone"], string> = {
  success: "bg-gain-100 text-gain-700 dark:bg-gain-900/40 dark:text-gain-300",
  info: "bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-300",
  warning: "bg-caution-100 text-caution-700 dark:bg-caution-900/40 dark:text-caution-300",
  error: "bg-loss-100 text-loss-700 dark:bg-loss-900/40 dark:text-loss-300"
};

export function ToastViewport() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2.5"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = toneIcon[toast.tone];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex animate-slideInRight items-start gap-3 rounded-card border border-line bg-surface p-3.5 shadow-overlay"
          >
            <span className={`mt-0.5 shrink-0 rounded-full p-1.5 ${toneStyle[toast.tone]}`}>
              <Icon size={15} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-inkMuted">{toast.body}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="-mr-0.5 -mt-0.5 shrink-0 rounded-control p-1.5 text-inkSubtle transition hover:bg-surfaceMuted hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
