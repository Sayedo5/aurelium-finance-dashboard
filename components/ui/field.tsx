"use client";

import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-control border border-line bg-surface text-sm text-ink transition duration-150 " +
  "ease-smooth placeholder:text-inkSubtle hover:border-lineStrong focus:border-aurum-400 " +
  "focus:outline-none focus:ring-2 focus:ring-aurum-400/25 disabled:opacity-50";

/** Shared label + control wrapper so every form row lines up identically. */
export function Field({
  label,
  hint,
  htmlFor,
  className,
  children
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-inkMuted">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-inkSubtle">{hint}</p> : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, icon: Icon, ...props },
  ref
) {
  if (!Icon) {
    return <input ref={ref} className={cn(control, "h-10 px-3.5", className)} {...props} />;
  }

  return (
    <div className="relative">
      <Icon
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSubtle"
      />
      <input ref={ref} className={cn(control, "h-10 pl-10 pr-3.5", className)} {...props} />
    </div>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(control, "h-10 appearance-none pl-3.5 pr-9", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-inkSubtle"
        />
      </div>
    );
  }
);

/** Accessible on/off switch used throughout Settings. */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-pill transition-colors duration-200 ease-smooth",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:opacity-50",
        checked ? "bg-aurum-400" : "bg-lineStrong"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-raised transition-transform duration-200 ease-smooth",
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

/**
 * Segmented control — the app's single answer to "pick one of a few".
 * Used for range toggles, direction tabs and budget filters.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const groupId = useId();

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "inline-flex rounded-control border border-line bg-surfaceMuted p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            id={`${groupId}-${option.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-[0.5rem] font-semibold transition duration-150 ease-smooth",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs",
              active
                ? "bg-surface text-ink shadow-raised"
                : "text-inkMuted hover:text-ink"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
