import { cn } from "@/lib/utils";

/** Shimmering placeholder. Matches the footprint of the content it stands in for. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-control", className)} aria-hidden />;
}
