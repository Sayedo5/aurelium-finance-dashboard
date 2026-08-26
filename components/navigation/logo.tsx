import { cn } from "@/lib/utils";

/**
 * The mark is a gold "A" monogram on ink — the one place the accent runs at
 * full saturation, so the brand reads immediately in either theme.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-gradient-to-br from-aurum-300 to-aurum-500 text-[0.9375rem] font-bold text-aurum-950 shadow-raised"
      >
        A
      </span>
      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-semibold leading-tight tracking-tight text-ink">
          Aurelium
        </span>
        <span className="block text-[0.6875rem] font-medium uppercase leading-tight tracking-[0.16em] text-inkSubtle">
          Ledger
        </span>
      </span>
    </div>
  );
}
