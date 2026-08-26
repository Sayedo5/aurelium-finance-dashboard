"use client";

import { useMemo, useState } from "react";
import { Download, Percent, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { CategoryDonut, NetCashChart, TrendLineChart } from "@/components/charts/finance-charts";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/states";
import { SegmentedControl, Select } from "@/components/ui/field";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { monthlySeries, months } from "@/lib/mock-data";
import {
  currentMonth,
  largestExpense,
  merchantTotals,
  previousMonth,
  savingsRate,
  spendByCategory
} from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, formatMonthYear, formatPercent, percentChange, ratioToPercent } from "@/lib/utils";
import type { MonthlyPoint } from "@/lib/types";

type RangeId = "3m" | "6m";

const ranges: Array<{ id: RangeId; label: string }> = [
  { id: "3m", label: "3 months" },
  { id: "6m", label: "6 months" }
];

const rangeMonths: Record<RangeId, number> = { "3m": 3, "6m": 6 };

const TOP_MERCHANTS = 8;

export function AnalyticsPage() {
  const { refreshKey, addToast } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [range, setRange] = useState<RangeId>("6m");
  const [monthKey, setMonthKey] = useState(months[months.length - 1].key);

  const series = useMemo(() => monthlySeries.slice(-rangeMonths[range]), [range]);
  const breakdown = useMemo(() => spendByCategory(monthKey), [monthKey]);
  const breakdownTotal = useMemo(
    () => breakdown.reduce((sum, slice) => sum + slice.value, 0),
    [breakdown]
  );

  const averages = useMemo(() => {
    const income = series.reduce((sum, point) => sum + point.income, 0) / series.length;
    const expenses = series.reduce((sum, point) => sum + point.expenses, 0) / series.length;
    return { income, expenses, net: income - expenses };
  }, [series]);

  const topMerchants = useMemo(() => merchantTotals.slice(0, TOP_MERCHANTS), []);
  const topMerchantValue = topMerchants[0]?.value ?? 1;

  const comparisons = [
    { label: "Income", current: currentMonth.income, previous: previousMonth.income, invert: false },
    { label: "Expenses", current: currentMonth.expenses, previous: previousMonth.expenses, invert: true },
    { label: "Net cash", current: currentMonth.net, previous: previousMonth.net, invert: false }
  ];

  function exportSeries() {
    const csv = toCsv<MonthlyPoint>(series, [
      { header: "Month", value: (point) => point.month },
      { header: "Income (USD)", value: (point) => point.income.toFixed(2) },
      { header: "Expenses (USD)", value: (point) => point.expenses.toFixed(2) },
      { header: "Net (USD)", value: (point) => point.net.toFixed(2) },
      {
        header: "Savings rate (%)",
        value: (point) => (point.income > 0 ? ((point.net / point.income) * 100).toFixed(1) : "0.0")
      }
    ]);

    const ok = downloadCsv(csvFilename("cashflow", range), csv);
    addToast(
      ok
        ? { title: "Cashflow exported", body: `${series.length} months saved as CSV.`, tone: "success" }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  return (
    <>
      <section aria-label="Analytics summary" className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Avg. monthly income"
          value={averages.income}
          icon={TrendingUp}
          caption={`last ${rangeMonths[range]} months`}
          loading={loading}
          tone="gain"
        />
        <StatCard
          label="Avg. monthly expenses"
          value={averages.expenses}
          icon={TrendingDown}
          caption={`last ${rangeMonths[range]} months`}
          loading={loading}
          tone="loss"
        />
        <StatCard
          label="Savings rate"
          value={savingsRate}
          icon={Percent}
          caption="of July income kept"
          loading={loading}
          format={(value) => `${value.toFixed(1)}%`}
        />
        <StatCard
          label="Largest single expense"
          value={largestExpense.amount}
          icon={Receipt}
          caption={largestExpense.merchant}
          loading={loading}
        />
      </section>

      <Card className="animate-rise stagger-1">
        <CardHeader
          title="Cashflow trend"
          description="Income, expenses and net over time"
          actions={
            <>
              <SegmentedControl
                label="Trend range"
                options={ranges}
                value={range}
                onChange={setRange}
              />
              <Button variant="secondary" size="md" icon={Download} onClick={exportSeries}>
                <span className="hidden sm:inline">Export</span>
              </Button>
            </>
          }
        />
        <div className="mt-5">
          {loading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ErrorBoundary section="Cashflow trend">
              <TrendLineChart data={series} height={280} />
            </ErrorBoundary>
          )}
        </div>
      </Card>

      <section className="grid animate-rise gap-4 stagger-2 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Spend breakdown"
            description={`Expenses by category, ${formatMonthYear(monthKey)}`}
            actions={
              <Select
                value={monthKey}
                aria-label="Breakdown month"
                onChange={(event) => setMonthKey(event.target.value)}
                className="w-auto"
              >
                {months.map((month) => (
                  <option key={month.key} value={month.key}>
                    {month.label} 2026
                  </option>
                ))}
              </Select>
            }
          />

          <div className="mt-4">
            {loading ? (
              <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
            ) : (
              <ErrorBoundary section="Spend breakdown">
                <CategoryDonut data={breakdown} height={220} />
              </ErrorBoundary>
            )}
          </div>

          <ul className="mt-5 space-y-2.5 border-t border-line pt-4">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <li key={index}>
                    <Skeleton className="h-4 w-full" />
                  </li>
                ))
              : breakdown.map((slice) => (
                  <li key={slice.name} className="flex items-center gap-3 text-sm">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-inkMuted">{slice.name}</span>
                    <span className="numeric w-10 shrink-0 text-right text-xs text-inkSubtle">
                      {ratioToPercent(slice.value, breakdownTotal).toFixed(0)}%
                    </span>
                    <span className="numeric w-24 shrink-0 text-right font-semibold text-ink">
                      {fmt.money(slice.value)}
                    </span>
                  </li>
                ))}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Net cash by month" description="Positive months build reserve" />
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <ErrorBoundary section="Net cash">
                  <NetCashChart data={series} height={200} />
                </ErrorBoundary>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Month over month" description="July compared with June" />
            <div className="mt-4 space-y-2.5">
              {comparisons.map((row) => {
                const change = percentChange(row.current, row.previous);
                const good = row.invert ? change <= 0 : change >= 0;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-control border border-line px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{row.label}</p>
                      <p className="numeric text-xs text-inkMuted">was {fmt.money(row.previous)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="numeric font-semibold text-ink">{fmt.money(row.current)}</p>
                      <p
                        className={cn(
                          "numeric text-xs font-medium",
                          good ? "text-gain-600 dark:text-gain-400" : "text-loss-600 dark:text-loss-400"
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

      <Card className="animate-rise stagger-3">
        <CardHeader title="Top merchants" description="Total spend across the six-month window" />
        <div className="mt-5 space-y-3.5">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))
            : topMerchants.map((row, index) => (
                <div key={row.merchant}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-ink">{row.merchant}</span>
                    <span className="numeric shrink-0 font-semibold text-ink">
                      {fmt.money(row.value)}
                    </span>
                  </div>
                  <Progress
                    value={ratioToPercent(row.value, topMerchantValue)}
                    className="mt-2"
                    delayMs={index * 60}
                    label={`${row.merchant} share of top spend`}
                  />
                </div>
              ))}
        </div>
      </Card>
    </>
  );
}
