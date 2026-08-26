"use client";

import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DeltaBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/lib/hooks";
import { useFormat } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Period-over-period change, already expressed as a percentage. */
  delta?: number;
  /** Set when a rising number is bad news, e.g. total expenses. */
  invertDelta?: boolean;
  caption?: string;
  loading?: boolean;
  /** Overrides currency formatting — used for rates and counts. */
  format?: (value: number) => string;
  /** Tints the value. Default is neutral ink; money in/out gets a semantic colour. */
  tone?: "neutral" | "gain" | "loss";
  className?: string;
}

function StatCardBase({
  label,
  value,
  icon: Icon,
  delta,
  invertDelta = false,
  caption,
  loading = false,
  format,
  tone = "neutral",
  className
}: StatCardProps) {
  const fmt = useFormat();
  // Hold at zero until data lands, then count once to the real figure.
  const animated = useCountUp(value, { enabled: !loading });
  const render = format ?? ((input: number) => fmt.money(input));

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition duration-200 ease-smooth hover:border-lineStrong hover:shadow-lift",
        className
      )}
    >
      {/* Gold wash on hover — the only decorative flourish, kept below the text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-aurum-400/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <p className="eyebrow truncate">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-surfaceMuted text-aurum-600 dark:text-aurum-400">
          <Icon size={17} aria-hidden />
        </span>
      </div>

      {loading ? (
        <Skeleton className="mt-3.5 h-9 w-36" />
      ) : (
        <p
          className={cn(
            "numeric mt-3.5 text-metric font-semibold",
            tone === "gain" && "text-gain-600 dark:text-gain-400",
            tone === "loss" && "text-loss-600 dark:text-loss-400"
          )}
        >
          {render(animated)}
        </p>
      )}

      <div className="mt-3 flex min-h-[1.5rem] flex-wrap items-center gap-2 text-sm">
        {loading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <>
            {delta !== undefined ? <DeltaBadge value={delta} invert={invertDelta} /> : null}
            {caption ? <span className="truncate text-xs text-inkMuted">{caption}</span> : null}
          </>
        )}
      </div>
    </Card>
  );
}

/**
 * Memoised: KPI values are stable while the rest of a page filters and sorts,
 * and each card runs its own animation frame loop worth not restarting.
 */
export const StatCard = memo(StatCardBase);
