import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes the default padding so a table or list can meet the card edge. */
  flush?: boolean;
  /** Adds a hover lift. Only for cards that are themselves clickable. */
  interactive?: boolean;
}

export function Card({ className, flush = false, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "panel",
        flush ? "overflow-hidden" : "p-5 sm:p-6",
        interactive &&
          "cursor-pointer transition duration-200 ease-smooth hover:-translate-y-0.5 hover:border-lineStrong hover:shadow-lift",
        className
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  /** Filters, toggles or buttons that act on this card's content. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Every card heading uses this, so title/description/action alignment and the
 * wrap behaviour on narrow screens are identical across the app.
 */
export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-[0.9375rem] font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-inkMuted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
