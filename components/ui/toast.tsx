"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";

const toneIcon = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert
};

const toneStyle = {
  success: "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200",
  info: "bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
};

export function ToastViewport() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = toneIcon[toast.tone];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex animate-rise items-start gap-3 rounded-3xl border border-line bg-panel p-4 shadow-luxe backdrop-blur-xl"
          >
            <span className={`mt-0.5 shrink-0 rounded-full p-2 ${toneStyle[toast.tone]}`}>
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-inkMuted">{toast.body}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-full p-1 text-inkMuted transition hover:text-ink dark:hover:text-white"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
