import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-ink text-white shadow-soft hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100":
            variant === "primary",
          "border border-line bg-white/60 text-ink hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900":
            variant === "secondary",
          "text-ink hover:bg-slate-900/5 dark:text-ink dark:hover:bg-white/5": variant === "ghost",
          "bg-danger text-white hover:bg-red-600": variant === "danger"
        },
        className
      )}
      {...props}
    />
  );
});
