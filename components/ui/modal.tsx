"use client";

import { useEffect, useRef } from "react";
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
  submitting?: boolean;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  onSubmit,
  submitLabel = "Save",
  submitting = false
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Trap focus: a dialog the keyboard can walk out of is not modal.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    // Move focus into the dialog on the next frame, after it paints.
    const raf = requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>('input, select, textarea, button:not([aria-label="Close dialog"])')
        ?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg animate-rise rounded-panel border border-line bg-surface p-6 shadow-overlay"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-base font-semibold tracking-tight">
              {title}
            </h2>
            <p id="modal-description" className="mt-1.5 text-sm leading-relaxed text-inkMuted">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 shrink-0 rounded-control p-2 text-inkMuted transition hover:bg-surfaceMuted hover:text-ink"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">{children}</div>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {onSubmit ? (
            <Button variant="accent" onClick={onSubmit} loading={submitting}>
              {submitLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
