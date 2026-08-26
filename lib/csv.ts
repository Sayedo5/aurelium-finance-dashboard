/**
 * Client-side CSV export.
 *
 * Builds the file in memory and hands it to the browser via an object URL, so
 * there is no server round-trip and the download works offline.
 */

/** RFC 4180: wrap in quotes when the value contains a delimiter, quote or newline. */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((column) => escapeCell(column.header)).join(",");
  const body = rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(","));
  return [head, ...body].join("\r\n");
}

/**
 * Triggers a download of `content` as `filename`.
 * Returns false when the browser blocks it, so callers can report honestly
 * instead of claiming a success that never happened.
 */
export function downloadCsv(filename: string, content: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    // The BOM makes Excel open UTF-8 correctly instead of mangling symbols.
    const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke on the next tick; revoking synchronously can cancel the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/** `aurelium-transactions-2026-07.csv` — stable, sortable, no spaces. */
export function csvFilename(base: string, suffix?: string) {
  return `aurelium-${base}${suffix ? `-${suffix}` : ""}.csv`;
}
