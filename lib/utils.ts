import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's stock scale, so custom `text-*` font
 * sizes look like text *colours* to it — `cn("text-metric", "text-gain-600")`
 * would silently drop the size. Registering them here keeps size and colour in
 * separate conflict groups, which is what every toned StatCard relies on.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["label", "metric", "metricLg"] }],
      rounded: [{ rounded: ["control", "card", "panel", "pill"] }],
      shadow: [{ shadow: ["raised", "card", "lift", "overlay", "glow"] }]
    }
  }
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------------------------------------------------------------------------
 * Currency
 *
 * The display currency is a user preference, so every formatter takes it as an
 * argument. `useFormat()` in lib/hooks binds the current preference once so
 * components never have to thread it through by hand.
 * ------------------------------------------------------------------------ */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD";

/**
 * Static conversion factors against the USD ledger. A real product would price
 * these from a rates feed; fixed values keep the mock data deterministic.
 */
export const currencyRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36
};

export function convert(value: number, currency: CurrencyCode = "USD") {
  return value * currencyRates[currency];
}

export function formatCurrency(value: number, fractionDigits = 0, currency: CurrencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(convert(value, currency));
}

/** Expenses render as -$1,240 rather than ($1,240) so the sign scans instantly. */
export function formatSigned(value: number, fractionDigits = 0, currency: CurrencyCode = "USD") {
  const formatted = formatCurrency(Math.abs(value), fractionDigits, currency);
  return value < 0 ? `-${formatted}` : formatted;
}

export function formatCompactCurrency(value: number, currency: CurrencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1
  }).format(convert(value, currency));
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(fractionDigits)}%`;
}

/* ---------------------------------------------------------------------------
 * Dates
 * ------------------------------------------------------------------------ */

export type DateFormat = "MMM D, YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

/** Dates are date-only strings; parse as UTC so no timezone shifts the day. */
function toUtcDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

export function formatDate(value: string, format: DateFormat = "MMM D, YYYY") {
  const date = toUtcDate(value);
  if (Number.isNaN(date.getTime())) return value;

  if (format === "YYYY-MM-DD") return value;

  if (format === "DD/MM/YYYY") {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

/** "July 2026" — used for period headings where the day is meaningless. */
export function formatMonthYear(monthKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(toUtcDate(`${monthKey}-01`));
}

/* ---------------------------------------------------------------------------
 * Math
 * ------------------------------------------------------------------------ */

/** Percentage change from `previous` to `current`, guarding divide-by-zero. */
export function percentChange(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Safe percentage for progress bars — never NaN, never negative. */
export function ratioToPercent(part: number, whole: number) {
  if (!whole) return 0;
  return Math.max(0, (part / whole) * 100);
}
