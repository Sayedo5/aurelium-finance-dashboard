"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Field, Input, SegmentedControl, Select } from "@/components/ui/field";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useDebouncedValue, useSimulatedLoading } from "@/lib/hooks";
import { accountMap, accounts, categories, categoryMap, months, transactions } from "@/lib/mock-data";
import { signedAmount } from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import type { CategoryId, Transaction, TxDirection, TxStatus } from "@/lib/types";

type SortKey = "date" | "merchant" | "amount";
type SortDir = "asc" | "desc";
type DirectionFilter = TxDirection | "all";

const directionTabs: Array<{ id: DirectionFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expenses" }
];

const statusOptions: Array<TxStatus | "all"> = ["all", "cleared", "pending", "failed"];
const pageSizes = [12, 25, 50];

export function TransactionsPage() {
  const { addToast, refreshKey, preferences } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [categoryId, setCategoryId] = useState<CategoryId | "all">("all");
  const [accountId, setAccountId] = useState<string>("all");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [fromMonth, setFromMonth] = useState(months[0].key);
  const [toMonth, setToMonth] = useState(months[months.length - 1].key);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Search results deep-link here as /transactions?q=Merchant.
  const initialQuery = searchParams.get("q");
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setPage(1);
    }
  }, [initialQuery]);

  const debouncedQuery = useDebouncedValue(query, 180);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    // Compare on the YYYY-MM prefix so the range is inclusive of both months,
    // and tolerate the user picking "from" after "to".
    const lower = fromMonth <= toMonth ? fromMonth : toMonth;
    const upper = fromMonth <= toMonth ? toMonth : fromMonth;

    const rows = transactions.filter((tx) => {
      const monthKey = tx.date.slice(0, 7);
      if (monthKey < lower || monthKey > upper) return false;
      if (direction !== "all" && tx.direction !== direction) return false;
      if (categoryId !== "all" && tx.categoryId !== categoryId) return false;
      if (accountId !== "all" && tx.accountId !== accountId) return false;
      if (status !== "all" && tx.status !== status) return false;
      if (needle) {
        const haystack = `${tx.merchant} ${tx.memo} ${tx.id} ${categoryMap[tx.categoryId].label}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      return true;
    });

    return rows.sort((a, b) => {
      let result = 0;
      if (sortKey === "date") result = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      if (sortKey === "merchant") result = a.merchant.localeCompare(b.merchant);
      if (sortKey === "amount") result = signedAmount(a) - signedAmount(b);
      // Stable tie-break so equal keys never reshuffle between renders.
      if (result === 0) result = a.id.localeCompare(b.id);
      return sortDir === "asc" ? result : -result;
    });
  }, [debouncedQuery, direction, categoryId, accountId, status, fromMonth, toMonth, sortKey, sortDir]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.status === "failed") continue;
      if (tx.direction === "income") income += tx.amount;
      else expense += tx.amount;
    }
    return { income, expense, net: income - expense };
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const activeFilters =
    (direction !== "all" ? 1 : 0) +
    (categoryId !== "all" ? 1 : 0) +
    (accountId !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (fromMonth !== months[0].key ? 1 : 0) +
    (toMonth !== months[months.length - 1].key ? 1 : 0) +
    (query.trim() ? 1 : 0);

  function resetFilters() {
    setQuery("");
    setDirection("all");
    setCategoryId("all");
    setAccountId("all");
    setStatus("all");
    setFromMonth(months[0].key);
    setToMonth(months[months.length - 1].key);
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "merchant" ? "asc" : "desc");
    }
    setPage(1);
  }

  /** Exports exactly what is on screen — the filtered set, in the current sort order. */
  function exportCsv() {
    if (filtered.length === 0) {
      addToast({
        title: "Nothing to export",
        body: "No transactions match the current filters.",
        tone: "warning"
      });
      return;
    }

    setExporting(true);
    const csv = toCsv<Transaction>(filtered, [
      { header: "ID", value: (tx) => tx.id },
      { header: "Date", value: (tx) => tx.date },
      { header: "Merchant", value: (tx) => tx.merchant },
      { header: "Memo", value: (tx) => tx.memo },
      { header: "Category", value: (tx) => categoryMap[tx.categoryId].label },
      { header: "Account", value: (tx) => accountMap[tx.accountId].name },
      { header: "Method", value: (tx) => tx.method },
      { header: "Status", value: (tx) => tx.status },
      { header: "Direction", value: (tx) => tx.direction },
      { header: "Amount (USD)", value: (tx) => signedAmount(tx).toFixed(2) }
    ]);

    const ok = downloadCsv(csvFilename("transactions", `${fromMonth}_${toMonth}`), csv);
    setExporting(false);

    addToast(
      ok
        ? {
            title: "Export downloaded",
            body: `${filtered.length} transactions saved as CSV.`,
            tone: "success"
          }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  const compact = preferences.density === "compact";
  const cellPad = compact ? "px-4 py-2" : "px-4 py-3.5";

  function SortButton({ column, label, align = "left" }: { column: SortKey; label: string; align?: "left" | "right" }) {
    const active = sortKey === column;
    const Icon = !active ? ChevronsUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(column)}
        aria-label={`Sort by ${label}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded transition-colors hover:text-ink",
          active ? "text-ink" : "text-inkMuted",
          align === "right" && "flex-row-reverse"
        )}
      >
        {label}
        <Icon size={13} aria-hidden className={cn(!active && "opacity-40")} />
      </button>
    );
  }

  return (
    <>
      <section aria-label="Totals in view" className="grid animate-rise gap-4 sm:grid-cols-3">
        {[
          { label: "Income in view", value: totals.income, tone: "gain" as const },
          { label: "Expenses in view", value: totals.expense, tone: "loss" as const },
          {
            label: "Net in view",
            value: totals.net,
            tone: totals.net >= 0 ? ("gain" as const) : ("loss" as const),
            signed: true
          }
        ].map((item) => (
          <Card key={item.label} className="py-4">
            <p className="eyebrow">{item.label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-32" />
            ) : (
              <p
                className={cn(
                  "numeric mt-2 text-2xl font-semibold",
                  item.tone === "gain" ? "text-gain-600 dark:text-gain-400" : "text-loss-600 dark:text-loss-400"
                )}
              >
                {item.signed ? fmt.signed(item.value) : fmt.money(item.value)}
              </p>
            )}
          </Card>
        ))}
      </section>

      <Card flush className="animate-rise stagger-1">
        {/* Toolbar */}
        <div className="border-b border-line p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[180px] flex-1">
              <Input
                icon={Search}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search merchant, memo or ID…"
                aria-label="Search transactions"
                className="pr-9 [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-inkSubtle transition hover:bg-surfaceMuted hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>

            <SegmentedControl
              label="Transaction direction"
              options={directionTabs}
              value={direction}
              onChange={(id) => {
                setDirection(id);
                setPage(1);
              }}
              className="h-10 items-center"
            />

            <Button
              variant={filtersOpen ? "primary" : "secondary"}
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="transaction-filters"
            >
              Filters
              {activeFilters > 0 ? (
                <span
                  className={cn(
                    "grid h-4 min-w-[1rem] place-items-center rounded-pill px-1 text-[10px] font-bold leading-none",
                    filtersOpen ? "bg-canvas text-ink" : "bg-aurum-400 text-aurum-950"
                  )}
                >
                  {activeFilters}
                </span>
              ) : null}
            </Button>

            <Button variant="secondary" icon={Download} loading={exporting} onClick={exportCsv}>
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>

          {filtersOpen ? (
            <div
              id="transaction-filters"
              className="mt-4 grid animate-rise gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            >
              <Field label="Category">
                <Select
                  value={categoryId}
                  aria-label="Filter by category"
                  onChange={(event) => {
                    setCategoryId(event.target.value as CategoryId | "all");
                    setPage(1);
                  }}
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Account">
                <Select
                  value={accountId}
                  aria-label="Filter by account"
                  onChange={(event) => {
                    setAccountId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Status">
                <Select
                  value={status}
                  aria-label="Filter by status"
                  className="capitalize"
                  onChange={(event) => {
                    setStatus(event.target.value as TxStatus | "all");
                    setPage(1);
                  }}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All statuses" : option}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="From">
                <Select
                  value={fromMonth}
                  aria-label="Range start month"
                  onChange={(event) => {
                    setFromMonth(event.target.value);
                    setPage(1);
                  }}
                >
                  {months.map((month) => (
                    <option key={month.key} value={month.key}>
                      {month.label} 2026
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="To">
                <Select
                  value={toMonth}
                  aria-label="Range end month"
                  onChange={(event) => {
                    setToMonth(event.target.value);
                    setPage(1);
                  }}
                >
                  {months.map((month) => (
                    <option key={month.key} value={month.key}>
                      {month.label} 2026
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}

          {activeFilters > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-inkMuted">
                <strong className="font-semibold text-ink">{filtered.length}</strong> of{" "}
                {transactions.length} transactions
              </span>
              <Button variant="ghost" size="sm" icon={X} onClick={resetFilters}>
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">
              Transactions, sorted by {sortKey} {sortDir === "asc" ? "ascending" : "descending"}
            </caption>
            <thead>
              <tr className="border-b border-line bg-surfaceMuted/60 text-label font-semibold uppercase text-inkMuted">
                <th scope="col" className="px-4 py-2.5">
                  <SortButton column="date" label="Date" />
                </th>
                <th scope="col" className="px-4 py-2.5">
                  <SortButton column="merchant" label="Merchant" />
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Category
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Account
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  <SortButton column="amount" label="Amount" align="right" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="border-b border-line last:border-0">
                    <td colSpan={6} className={cellPad}>
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No transactions match these filters"
                      description="Try widening the month range or clearing a filter."
                      action={
                        <Button variant="secondary" size="sm" icon={X} onClick={resetFilters}>
                          Clear filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                pageRows.map((tx) => {
                  const category = categoryMap[tx.categoryId];
                  const account = accountMap[tx.accountId];
                  const signed = signedAmount(tx);
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-line transition-colors duration-150 last:border-0 hover:bg-surfaceMuted"
                    >
                      <td className={cn(cellPad, "whitespace-nowrap text-inkMuted")}>
                        {fmt.date(tx.date)}
                      </td>
                      <td className={cellPad}>
                        <p className="font-medium text-ink">{tx.merchant}</p>
                        {!compact ? (
                          <p className="mt-0.5 max-w-[22rem] truncate text-xs text-inkMuted">
                            {tx.memo}
                          </p>
                        ) : null}
                      </td>
                      <td className={cellPad}>
                        <Pill color={category.color}>{category.label}</Pill>
                      </td>
                      <td className={cn(cellPad, "whitespace-nowrap text-inkMuted")}>
                        {account.name}
                        <span className="ml-1 text-xs text-inkSubtle">··{account.mask}</span>
                      </td>
                      <td className={cellPad}>
                        <StatusBadge status={tx.status} />
                      </td>
                      <td
                        className={cn(
                          cellPad,
                          "numeric whitespace-nowrap text-right font-semibold",
                          signed >= 0 ? "text-gain-600 dark:text-gain-400" : "text-ink"
                        )}
                      >
                        {fmt.signed(signed, 2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: each row becomes its own card rather than a sideways scroll. */}
        <div className="divide-y divide-line md:hidden">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-4">
                <Skeleton className="h-14 w-full" />
              </div>
            ))
          ) : pageRows.length === 0 ? (
            <EmptyState
              title="No transactions match these filters"
              description="Try widening the month range or clearing a filter."
              action={
                <Button variant="secondary" size="sm" icon={X} onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            pageRows.map((tx) => {
              const category = categoryMap[tx.categoryId];
              const account = accountMap[tx.accountId];
              const signed = signedAmount(tx);
              return (
                <article key={tx.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{tx.merchant}</p>
                      <p className="mt-0.5 truncate text-xs text-inkMuted">{tx.memo}</p>
                    </div>
                    <p
                      className={cn(
                        "numeric shrink-0 font-semibold",
                        signed >= 0 ? "text-gain-600 dark:text-gain-400" : "text-ink"
                      )}
                    >
                      {fmt.signed(signed, 2)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill color={category.color}>{category.label}</Pill>
                    <StatusBadge status={tx.status} />
                    <span className="text-xs text-inkMuted">{fmt.date(tx.date)}</span>
                  </div>
                  <p className="mt-2 text-xs text-inkSubtle">
                    {account.name} ··{account.mask} · {tx.method}
                  </p>
                </article>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <div className="flex items-center gap-3">
              <p className="text-xs text-inkMuted">
                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of{" "}
                {filtered.length}
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
                  {pageSizes.map((size) => (
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
                className="w-8 px-0"
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
                className="w-8 px-0"
              />
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}
