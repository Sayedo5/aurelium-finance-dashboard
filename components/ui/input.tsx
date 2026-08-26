import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100 dark:bg-slate-950/50",
          className
        )}
        {...props}
      />
    );
  }
);
