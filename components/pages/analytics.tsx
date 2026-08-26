"use client";

import { useMemo, useState } from "react";
import { Percent, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { CategoryDonut, NetCashChart, TrendLineChart } from "@/components/charts/finance-charts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useSimulatedLoading } from "@/lib/hooks";
import { monthlySeries, months, transactions } from "@/lib/mock-data";
import { currentMonth, largestExpense, previousMonth, savingsRate, spendByCategory } from "@/lib/selectors";
import { cn, formatCurrency, formatPercent, percentChange } from "@/lib/utils";

const ranges = [
  { id: "3m", label: "Last 3 months", months: 3 },
  { id: "6m", label: "Last 6 months", months: 6 }
] as const;

export function AnalyticsPage() {
  const loading = useSimulatedLoading();
  const [range, setRange] = useState<(typeof ranges)[number]["id"]>("6m");
  const [monthKey, setMonthKey] = useState(months[months.length - 1].key);

  const activeRange = ranges.find((item) => item.id === range) ?? ranges[1];
  const series = monthlySeries.slice(-activeRange.months);
  const breakdown = spendByCategory(monthKey);
  const breakdownTotal = breakdown.reduce((sum, slice) => sum + slice.value, 0);

  const averages = useMemo(() => {
    const income = series.reduce((sum, point) => sum + point.income, 0) / series.length;
    const expenses = series.reduce((sum, point) => sum + point.expenses, 0) / series.length;
    return { income, expenses, net: income - expenses };
  }, [series]);

  const merchantTotals = useMemo(() => {
    const totals = new Map<string, number>();
    transactions
      .filter((tx) => tx.direction === "expense" && tx.status !== "failed" && tx.categoryId !== "transfers")
      .forEach((tx) => {
        totals.set(tx.merchant, (totals.get(tx.merchant) ?? 0) + tx.amount);
      });
    return Array.from(totals.entries())
      .map(([merchant, value]) => ({ merchant, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, []);

  const topMerchantValue = merchantTotals[0]?.value ?? 1;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg. monthly income" value={averages.income} icon={TrendingUp} caption={activeRange.label.toLowerCase()} loading={loading} />
        <StatCard label="Avg. monthly expenses" value={averages.expenses} icon={TrendingDown} invertDelta caption={activeRange.label.toLowerCase()} loading={loading} />
        <StatCard
          label="Savings rate"
          value={savingsRate}
          icon={Percent}
          caption="of July income kept"
          loading={loading}
          format={(value) => `${value.toFixed(1)}%`}
        />
        <StatCard label="Largest single expense" value={largestExpense.amount} icon={Receipt} caption={largestExpense.merchant} loading={loading} />
      </section>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Cashflow trend</h2>
            <p className="text-sm text-inkMuted">Income, expenses and net over time</p>
          </div>
          <div className="flex rounded-2xl border border-line bg-white/60 p-1 dark:bg-slate-950/50">
            {ranges.map((item) => (
              <button
                key={item.id}
                onClick={() => setRange(item.id)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
                  range === item.id
                    ? "bg-ink text-white shadow-soft dark:bg-white dark:text-slate-950"
                    : "text-inkMuted hover:text-ink dark:hover:text-white"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5">
          {loading ? <Skeleton className="h-[280px] w-full" /> : <TrendLineChart data={series} height={280} />}
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Spend breakdown</h2>
              <p className="text-sm text-inkMuted">Expenses by category</p>
            </div>
            <select
              value={monthKey}
              onChange={(event) => setMonthKey(event.target.value)}
              className="rounded-2xl border border-line bg-white/60 px-3 py-2 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
            >
              {months.map((month) => (
                <option key={month.key} value={month.key}>
                  {month.label} 2026
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            {loading ? (
              <Skeleton className="mx-auto h-[240px] w-[240px] rounded-full" />
            ) : (
              <CategoryDonut data={breakdown} height={240} />
            )}
          </div>

          <div className="mt-4 space-y-2.5">
            {breakdown.map((slice) => (
              <div key={slice.name} className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="truncate text-inkMuted">{slice.name}</span>
                <span className="ml-auto shrink-0 text-xs text-inkMuted">
                  {breakdownTotal > 0 ? `${((slice.value / breakdownTotal) * 100).toFixed(0)}%` : "0%"}
                </span>
                <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
                  {formatCurrency(slice.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold">Net cash by month</h2>
            <p className="text-sm text-inkMuted">Positive months build reserve</p>
            <div className="mt-4">
              {loading ? <Skeleton className="h-[220px] w-full" /> : <NetCashChart data={series} height={220} />}
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Month over month</h2>
            <p className="text-sm text-inkMuted">July compared with June</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Income", current: currentMonth.income, previous: previousMonth.income, invert: false },
                { label: "Expenses", current: currentMonth.expenses, previous: previousMonth.expenses, invert: true },
                { label: "Net cash", current: currentMonth.net, previous: previousMonth.net, invert: false }
              ].map((row) => {
                const change = percentChange(row.current, row.previous);
                const good = row.invert ? change <= 0 : change >= 0;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-inkMuted">
                        was {formatCurrency(row.previous)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatCurrency(row.current)}</p>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          good ? "text-brand-600 dark:text-brand-300" : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {formatPercent(change)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      <Card>
        <h2 className="text-base font-semibold">Top merchants</h2>
        <p className="text-sm text-inkMuted">Total spend across the six-month window</p>
        <div className="mt-5 space-y-4">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)
            : merchantTotals.map((row, index) => (
                <div key={row.merchant}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{row.merchant}</span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {formatCurrency(row.value)}
                    </span>
                  </div>
                  <Progress
                    value={(row.value / topMerchantValue) * 100}
                    color="#367dff"
                    className="mt-2 h-2"
                    delayMs={index * 70}
                  />
                </div>
              ))}
        </div>
      </Card>
    </>
  );
}
