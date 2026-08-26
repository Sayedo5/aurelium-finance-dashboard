"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { useAppContext } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

export interface Column<T> {
  /** Stable key; also the sort key when `sortable` is set. */
  id: string;
  header: string;
  /** Cell content for the desktop table. */
  cell: (row: T) => ReactNode;
  /** Comparable value. Providing it makes the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  /** Hides the column below the given breakpoint to keep narrow tables readable. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  width?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  /** Card body used below `md`, where the table is replaced entirely. */
  mobileCard: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Initial sort. Omit to keep the incoming order. */
  initialSort?: { id: string; dir: "asc" | "desc" };
  pageSize?: number;
  /** Rendered above the table, e.g. a totals strip. */
  toolbar?: ReactNode;
  minWidth?: string;
}

const hideClass: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell"
};

/**
 * One table implementation for every list in the app — invoices, clients,
 * bills, vendors, team and the audit log all render through this, so sorting,
 * pagination, density, empty states and the mobile card fallback behave
 * identically everywhere.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading = false,
  mobileCard,
  onRowClick,
  emptyTitle = "Nothing to show",
  emptyDescription = "Try adjusting the filters above.",
  emptyAction,
  initialSort,
  pageSize: initialPageSize = 12,
  toolbar,
  minWidth = "720px"
}: DataTableProps<T>) {
  const { preferences } = useAppContext();
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.id === sort.id);
    if (!column?.sortValue) return rows;

    return [...rows].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      let result = 0;
      if (typeof left === "number" && typeof right === "number") result = left - right;
      else result = String(left).localeCompare(String(right));
      return sort.dir === "asc" ? result : -result;
    });
  }, [rows, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize]
  );

  function toggleSort(column: Column<T>) {
    if (!column.sortValue) return;
    setSort((current) =>
      current?.id === column.id
        ? { id: column.id, dir: current.dir === "asc" ? "desc" : "asc" }
        : { id: column.id, dir: "desc" }
    );
    setPage(1);
  }

  const compact = preferences.density === "compact";
  const cellPad = compact ? "px-4 py-2" : "px-4 py-3";

  const empty = (
    <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  );

  return (
    <>
      {toolbar}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-line bg-surfaceMuted/60 text-label font-semibold uppercase text-inkMuted">
              {columns.map((column) => {
                const active = sort?.id === column.id;
                const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "px-4 py-2.5 font-semibold",
                      column.align === "right" && "text-right",
                      column.hideBelow && hideClass[column.hideBelow]
                    )}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        aria-label={`Sort by ${column.header}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 transition-colors hover:text-ink",
                          active ? "text-ink" : "text-inkMuted",
                          column.align === "right" && "flex-row-reverse"
                        )}
                      >
                        {column.header}
                        <Icon size={13} aria-hidden className={cn(!active && "opacity-40")} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="border-b border-line last:border-0">
                  <td colSpan={columns.length} className={cellPad}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty}</td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "border-b border-line transition-colors duration-150 last:border-0 hover:bg-surfaceMuted",
                    onRowClick &&
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aurum-400"
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        cellPad,
                        column.align === "right" && "text-right",
                        column.hideBelow && hideClass[column.hideBelow]
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: each row becomes its own card rather than a sideways scroll. */}
      <div className="divide-y divide-line md:hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4">
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : pageRows.length === 0 ? (
          empty
        ) : (
          pageRows.map((row) => {
            const content = <div className="p-4">{mobileCard(row)}</div>;
            return onRowClick ? (
              <button
                key={rowKey(row)}
                type="button"
                onClick={() => onRowClick(row)}
                className="block w-full text-left transition-colors hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aurum-400"
              >
                {content}
              </button>
            ) : (
              <div key={rowKey(row)}>{content}</div>
            );
          })
        )}
      </div>

      {!loading && sorted.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-inkMuted">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of{" "}
              {sorted.length}
            </p>
            <label className="flex items-center gap-1.5 text-xs text-inkMuted">
              <span className="hidden sm:inline">Rows</span>
              <select
                value={pageSize}
                aria-label="Rows per page"
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-control border border-line bg-surface px-2 py-1 text-xs outline-none transition focus:border-aurum-400"
              >
                {[12, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            />
            <span className="numeric px-2 text-sm text-inkMuted">
              {safePage} / {pageCount}
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={safePage === pageCount}
              aria-label="Next page"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
