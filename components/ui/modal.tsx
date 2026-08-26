"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  onSubmit,
  submitLabel = "Save"
}: ModalProps) {
  // Close on Escape and lock body scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg animate-rise rounded-[32px] border border-line bg-panel p-6 shadow-luxe backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-inkMuted">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-inkMuted transition hover:bg-slate-900/5 dark:hover:bg-white/10"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">{children}</div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {onSubmit ? <Button onClick={onSubmit}>{submitLabel}</Button> : null}
        </div>
      </div>
    </div>
  );
}
