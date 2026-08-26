import { cn } from "@/lib/utils";
import type { TxStatus } from "@/lib/types";

const statusStyles: Record<TxStatus, string> = {
  cleared: "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
};

export function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        statusStyles[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Pill({
  children,
  className,
  color
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-inkMuted",
        className
      )}
    >
      {color ? (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {children}
    </span>
  );
}
