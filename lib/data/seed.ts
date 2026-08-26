/**
 * Deterministic pseudo-randomness.
 *
 * Every figure in this dataset is derived from a string seed, never from
 * `Math.random()` or `Date.now()`. That keeps the server and client renders
 * byte-identical (no hydration mismatch) and means a given invoice or bill
 * always carries the same amount across reloads and deploys.
 */

/** FNV-1a — cheap, well-distributed, and stable across JS engines. */
export function hash(seed: string): number {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Float in [0, 1) derived from `seed`. */
export function rand(seed: string): number {
  return hash(seed) / 4294967296;
}

/** Integer in [min, max] inclusive. */
export function randInt(seed: string, min: number, max: number): number {
  return min + Math.floor(rand(seed) * (max - min + 1));
}

/** Picks one element of `list`, deterministically. */
export function pick<T>(seed: string, list: readonly T[]): T {
  return list[Math.floor(rand(seed) * list.length) % list.length];
}

/** Symmetric jitter of at most ±`spread` around zero. */
export function jitter(seed: string, spread: number): number {
  if (spread === 0) return 0;
  return (rand(seed) - 0.5) * 2 * spread;
}

/** Rounds to cents so amounts never carry float noise. */
export function money(value: number): number {
  return Math.round(value * 100) / 100;
}

/* ---------------------------------------------------------------------------
 * Dates
 *
 * The dataset is anchored to a fixed "today" so relative figures — overdue
 * invoices, upcoming bills, quarter-to-date tax — never drift as real time
 * passes and never differ between server and client.
 * ------------------------------------------------------------------------ */

/** The reporting date the whole application treats as "now". */
export const TODAY = "2026-07-31";

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}

export function addDays(key: string, days: number): string {
  const date = parseDate(key);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

export function addMonths(monthKey: string, months: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86400000);
}

/** Clamps a day-of-month to a month that may be shorter. */
export function safeDate(monthKey: string, day: number): string {
  const clamped = Math.min(day, daysInMonth(monthKey));
  return `${monthKey}-${String(clamped).padStart(2, "0")}`;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export function monthLabel(monthKey: string): string {
  const month = Number(monthKey.split("-")[1]);
  return MONTH_LABELS[month - 1];
}

/** Includes the year when the window spans more than one, e.g. "Dec ’25". */
export function monthLabelWithYear(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${MONTH_LABELS[Number(month) - 1]} ’${year.slice(2)}`;
}

/** Builds `count` consecutive month keys ending at `endMonthKey`, oldest first. */
export function monthRange(endMonthKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addMonths(endMonthKey, index - count + 1));
}
