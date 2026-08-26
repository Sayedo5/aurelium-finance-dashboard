"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-control font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-smooth " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas shadow-raised hover:bg-ink/90 dark:bg-ink dark:text-canvas dark:hover:bg-white",
  accent:
    "bg-aurum-400 text-aurum-950 shadow-raised hover:bg-aurum-300 dark:bg-aurum-400 dark:text-aurum-950 dark:hover:bg-aurum-300",
  secondary: "border border-line bg-surface text-ink hover:border-lineStrong hover:bg-surfaceMuted",
  ghost: "text-inkMuted hover:bg-surfaceMuted hover:text-ink",
  danger: "bg-loss-600 text-white shadow-raised hover:bg-loss-700"
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm"
};

const iconOnlySizes: Record<Size, string> = {
  sm: "h-8 w-8 px-0",
  md: "h-10 w-10 px-0",
  lg: "h-11 w-11 px-0"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  /** Swaps the leading icon for a spinner and blocks interaction. */
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref
) {
  const iconOnly = !children;
  const glyph = size === "sm" ? 14 : 16;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], iconOnly ? iconOnlySizes[size] : sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 size={glyph} className="animate-spinSlow" aria-hidden />
      ) : Icon ? (
        <Icon size={glyph} aria-hidden />
      ) : null}
      {children}
      {IconRight && !loading ? <IconRight size={glyph} aria-hidden /> : null}
    </button>
  );
});

/** Square button for a bare icon. `label` is required — it becomes the a11y name. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "children" | "iconRight"> & { label: string }
>(function IconButton({ label, variant = "secondary", ...props }, ref) {
  return <Button ref={ref} aria-label={label} title={label} variant={variant} {...props} />;
});
