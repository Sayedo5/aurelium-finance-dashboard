"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/lib/hooks";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Period-over-period change, already expressed as a percentage. */
  delta?: number;
  /** Set when a rising number is bad news, e.g. total expenses. */
  invertDelta?: boolean;
  caption?: string;
  loading?: boolean;
  format?: (value: number) => string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  invertDelta = false,
  caption,
  loading = false,
  format = (input: number) => formatCurrency(input)
}: StatCardProps) {
  const animated = useCountUp(loading ? 0 : value);
  const positive = delta === undefined ? true : invertDelta ? delta <= 0 : delta >= 0;

  return (
    <Card className="group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-luxe">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-inkMuted">{label}</p>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-line bg-white/60 text-brand-600 dark:bg-slate-950/60 dark:text-brand-300">
          <Icon size={18} />
        </span>
      </div>

      {loading ? (
        <Skeleton className="mt-4 h-9 w-36" />
      ) : (
        <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">{format(animated)}</p>
      )}

      <div className="mt-3 flex items-center gap-2 text-sm">
        {loading ? (
          <Skeleton className="h-5 w-28" />
        ) : (
          <>
            {delta !== undefined ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  positive
                    ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                )}
              >
                {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {formatPercent(delta)}
              </span>
            ) : null}
            {caption ? <span className="text-inkMuted">{caption}</span> : null}
          </>
        )}
      </div>
    </Card>
  );
}
