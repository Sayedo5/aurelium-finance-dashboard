import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";
import type {
  AuditSeverity,
  BillStatus,
  ClientStatus,
  InvoiceStatus,
  MemberStatus,
  RoleId,
  TxStatus
} from "@/lib/types";

const chip =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-medium";

/* Tone palette shared by every status badge, so "settled" looks the same
   whether it is a cleared transaction, a paid invoice or a paid bill. */
const tones = {
  good: "bg-gain-100 text-gain-700 dark:bg-gain-900/40 dark:text-gain-300",
  warn: "bg-caution-100 text-caution-700 dark:bg-caution-900/40 dark:text-caution-300",
  bad: "bg-loss-100 text-loss-700 dark:bg-loss-900/40 dark:text-loss-300",
  info: "bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-300",
  accent: "bg-aurum-100 text-aurum-800 dark:bg-aurum-950/60 dark:text-aurum-300",
  neutral: "bg-surfaceMuted text-inkMuted ring-1 ring-line"
} as const;

type Tone = keyof typeof tones;

function Dot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />;
}

export function Badge({
  tone = "neutral",
  children,
  dot = false,
  className
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(chip, tones[tone], className)}>
      {dot ? <Dot /> : null}
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Domain status badges
 * ------------------------------------------------------------------------ */

const txTone: Record<TxStatus, Tone> = { cleared: "good", pending: "warn", failed: "bad" };

export function StatusBadge({ status, className }: { status: TxStatus; className?: string }) {
  return (
    <Badge tone={txTone[status]} dot className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

const invoiceTone: Record<InvoiceStatus, Tone> = {
  draft: "neutral",
  sent: "info",
  paid: "good",
  overdue: "bad",
  void: "neutral"
};

export function InvoiceStatusBadge({
  status,
  className
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  return (
    <Badge tone={invoiceTone[status]} dot className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

const billTone: Record<BillStatus, Tone> = {
  draft: "neutral",
  scheduled: "info",
  paid: "good",
  overdue: "bad"
};

export function BillStatusBadge({ status, className }: { status: BillStatus; className?: string }) {
  return (
    <Badge tone={billTone[status]} dot className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

const clientTone: Record<ClientStatus, Tone> = {
  active: "good",
  prospect: "accent",
  churned: "neutral"
};

export function ClientStatusBadge({
  status,
  className
}: {
  status: ClientStatus;
  className?: string;
}) {
  return (
    <Badge tone={clientTone[status]} dot className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

const memberTone: Record<MemberStatus, Tone> = {
  active: "good",
  invited: "warn",
  suspended: "bad"
};

export function MemberStatusBadge({
  status,
  className
}: {
  status: MemberStatus;
  className?: string;
}) {
  return (
    <Badge tone={memberTone[status]} dot className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

const roleTone: Record<RoleId, Tone> = {
  owner: "accent",
  admin: "info",
  accountant: "good",
  analyst: "neutral",
  viewer: "neutral"
};

export function RoleBadge({ roleId, label }: { roleId: RoleId; label: string }) {
  return <Badge tone={roleTone[roleId]}>{label}</Badge>;
}

const severityTone: Record<AuditSeverity, Tone> = {
  info: "neutral",
  notice: "info",
  critical: "warn"
};

export function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  return (
    <Badge tone={severityTone[severity]} className="capitalize">
      {severity}
    </Badge>
  );
}

/* ---------------------------------------------------------------------------
 * Generic chips
 * ------------------------------------------------------------------------ */

/** Neutral chip. `color` prints a category dot ahead of the label. */
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
        "inline-flex items-center gap-2 whitespace-nowrap rounded-pill border border-line px-2.5 py-1 text-xs font-medium text-inkMuted",
        className
      )}
    >
      {color ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}

/**
 * Period-over-period change. `invert` flips the colouring for figures where a
 * rise is bad news — expenses going up is not a green event.
 */
export function DeltaBadge({
  value,
  invert = false,
  className
}: {
  value: number;
  invert?: boolean;
  className?: string;
}) {
  const flat = Math.abs(value) < 0.05;
  const good = invert ? value <= 0 : value >= 0;
  const Icon = flat ? Minus : value >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-pill px-2 py-0.5 text-xs font-semibold",
        flat ? tones.neutral : good ? tones.good : tones.bad,
        className
      )}
    >
      <Icon size={12} aria-hidden />
      {formatPercent(value)}
    </span>
  );
}

/** Circular initials chip used for people throughout the app. */
export function Avatar({
  initials,
  size = "md",
  className
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-[11px]",
    lg: "h-12 w-12 text-sm"
  };

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-control bg-surfaceMuted font-bold text-aurum-700 ring-1 ring-line dark:text-aurum-400",
        sizes[size],
        className
      )}
    >
      {initials}
    </span>
  );
}
