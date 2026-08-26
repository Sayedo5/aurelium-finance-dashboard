"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, Pill } from "@/components/ui/badge";
import { useAppContext } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { accountMap, accounts, categories, categoryMap, months, transactions } from "@/lib/mock-data";
import { signedAmount } from "@/lib/selectors";
import { cn, formatCurrency, formatDate, formatSigned } from "@/lib/utils";
import type { CategoryId, TxDirection, TxStatus } from "@/lib/types";

type SortKey = "date" | "merchant" | "amount";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 12;

const directionTabs: Array<{ id: TxDirection | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expenses" }
];

const statusOptions: Array<TxStatus | "all"> = ["all", "cleared", "pending", "failed"];

export function TransactionsPage() {
  const loading = useSimulatedLoading();
  const { addToast } = useAppContext();

  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<TxDirection | "all">("all");
  const [categoryId, setCategoryId] = useState<CategoryId | "all">("all");
  const [accountId, setAccountId] = useState<string>("all");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [fromMonth, setFromMonth] = useState(months[0].key);
  const [toMonth, setToMonth] = useState(months[months.length - 1].key);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // Compare on the YYYY-MM prefix so the range is inclusive of both months.
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

    const sorted = [...rows].sort((a, b) => {
      let result = 0;
      if (sortKey === "date") result = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      if (sortKey === "merchant") result = a.merchant.localeCompare(b.merchant);
      if (sortKey === "amount") result = signedAmount(a) - signedAmount(b);
      return sortDir === "asc" ? result : -result;
    });

    return sorted;
  }, [query, direction, categoryId, accountId, status, fromMonth, toMonth, sortKey, sortDir]);

  const totals = useMemo(() => {
    const income = filtered
      .filter((tx) => tx.direction === "income" && tx.status !== "failed")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = filtered
      .filter((tx) => tx.direction === "expense" && tx.status !== "failed")
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeFilters =
    (direction !== "all" ? 1 : 0) +
    (categoryId !== "all" ? 1 : 0) +
    (accountId !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
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

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="inline-block w-3" />;
    return sortDir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="py-4">
          <p className="text-sm text-inkMuted">Income in view</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-brand-600 dark:text-brand-300">
            {formatCurrency(totals.income)}
          </p>
        </Card>
        <Card className="py-4">
          <p className="text-sm text-inkMuted">Expenses in view</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
            {formatCurrency(totals.expense)}
          </p>
        </Card>
        <Card className="py-4">
          <p className="text-sm text-inkMuted">Net in view</p>
          <p
            className={cn(
              "mt-1.5 text-2xl font-semibold tabular-nums",
              totals.net >= 0 ? "text-brand-600 dark:text-brand-300" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {formatSigned(totals.net)}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-line p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkMuted" size={16} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search merchant, memo or ID…"
                className="w-full rounded-2xl border border-line bg-white/60 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100 dark:bg-slate-950/50 dark:focus:ring-accent-900/40"
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-inkMuted hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            <div className="flex rounded-2xl border border-line bg-white/60 p-1 dark:bg-slate-950/50">
              {directionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setDirection(tab.id);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
                    direction === tab.id
                      ? "bg-ink text-white shadow-soft dark:bg-white dark:text-slate-950"
                      : "text-inkMuted hover:text-ink dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFiltersOpen((open) => !open)}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl border border-line px-3.5 py-2.5 text-sm font-medium transition",
                filtersOpen ? "bg-ink text-white dark:bg-white dark:text-slate-950" : "bg-white/60 hover:bg-white dark:bg-slate-950/50"
              )}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilters > 0 ? (
                <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {activeFilters}
                </span>
              ) : null}
            </button>

            <button
              onClick={() =>
                addToast({
                  title: "Export queued",
                  body: `${filtered.length} transactions will be emailed as CSV.`,
                  tone: "success"
                })
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/60 px-3.5 py-2.5 text-sm font-medium transition hover:bg-white dark:bg-slate-950/50"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {filtersOpen ? (
            <div className="mt-4 grid animate-rise gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-inkMuted">Category</span>
                <select
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value as CategoryId | "all");
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-line bg-white/60 px-3 py-2.5 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-inkMuted">Account</span>
                <select
                  value={accountId}
                  onChange={(event) => {
                    setAccountId(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-line bg-white/60 px-3 py-2.5 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
                >
                  <option value="all">All accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-inkMuted">Status</span>
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as TxStatus | "all");
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-line bg-white/60 px-3 py-2.5 text-sm capitalize outline-none focus:border-accent-400 dark:bg-slate-950/50"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All statuses" : option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-inkMuted">From</span>
                <select
                  value={fromMonth}
                  onChange={(event) => {
                    setFromMonth(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-line bg-white/60 px-3 py-2.5 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
                >
                  {months.map((month) => (
                    <option key={month.key} value={month.key}>
                      {month.label} 2026
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-inkMuted">To</span>
                <select
                  value={toMonth}
                  onChange={(event) => {
                    setToMonth(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-line bg-white/60 px-3 py-2.5 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
                >
                  {months.map((month) => (
                    <option key={month.key} value={month.key}>
                      {month.label} 2026
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {activeFilters > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-inkMuted">
                {filtered.length} of {transactions.length} transactions
              </span>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-inkMuted transition hover:text-ink dark:hover:text-white"
              >
                <X size={12} /> Clear filters
              </button>
            </div>
          ) : null}
        </div>

        {/* Horizontal scroll keeps the table intact on narrow screens. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-inkMuted">
                <th className="px-5 py-3 font-semibold">
                  <button
                    onClick={() => toggleSort("date")}
                    className="inline-flex items-center gap-1.5 transition hover:text-ink dark:hover:text-white"
                  >
                    Date <SortIcon column="date" />
                  </button>
                </th>
                <th className="px-5 py-3 font-semibold">
                  <button
                    onClick={() => toggleSort("merchant")}
                    className="inline-flex items-center gap-1.5 transition hover:text-ink dark:hover:text-white"
                  >
                    Merchant <SortIcon column="merchant" />
                  </button>
                </th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Account</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">
                  <button
                    onClick={() => toggleSort("amount")}
                    className="inline-flex items-center gap-1.5 transition hover:text-ink dark:hover:text-white"
                  >
                    Amount <SortIcon column="amount" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="border-b border-line/60">
                    <td colSpan={6} className="px-5 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium">No transactions match these filters</p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 rounded-2xl border border-line px-4 py-2 text-sm font-medium transition hover:bg-white/70 dark:hover:bg-white/5"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                pageRows.map((tx) => {
                  const category = categoryMap[tx.categoryId];
                  const signed = signedAmount(tx);
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-line/60 transition last:border-0 hover:bg-white/60 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-inkMuted">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{tx.merchant}</p>
                        <p className="mt-0.5 text-xs text-inkMuted">{tx.memo}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Pill color={category.color}>{category.label}</Pill>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-inkMuted">
                        {accountMap[tx.accountId].name}
                        <span className="ml-1 text-xs">··{accountMap[tx.accountId].mask}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums",
                          signed >= 0 ? "text-brand-600 dark:text-brand-300" : "text-ink"
                        )}
                      >
                        {formatSigned(signed, 2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
            <p className="text-xs text-inkMuted">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage === 1}
                className="grid h-9 w-9 place-items-center rounded-xl border border-line transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/5"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-sm tabular-nums text-inkMuted">
                {safePage} / {pageCount}
              </span>
              <button
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={safePage === pageCount}
                className="grid h-9 w-9 place-items-center rounded-xl border border-line transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/5"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}
