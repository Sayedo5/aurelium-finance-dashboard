"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { CategoryDonut, IncomeExpenseChart, NetCashChart } from "@/components/charts/finance-charts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { budgets, categoryMap, monthlySeries, savingsGoals } from "@/lib/mock-data";
import { useSimulatedLoading } from "@/lib/hooks";
import {
  currentMonth,
  previousMonth,
  recentTransactions,
  savingsRate,
  signedAmount,
  spendByCategory,
  totalBalance
} from "@/lib/selectors";
import { cn, formatCurrency, formatDate, formatSigned, percentChange } from "@/lib/utils";

const ranges = [
  { id: "3m", label: "3M", months: 3 },
  { id: "6m", label: "6M", months: 6 }
] as const;

export function OverviewPage() {
  const loading = useSimulatedLoading();
  const [range, setRange] = useState<(typeof ranges)[number]["id"]>("6m");

  const activeRange = ranges.find((item) => item.id === range) ?? ranges[1];
  const series = monthlySeries.slice(-activeRange.months);
  const breakdown = spendByCategory("2026-07").slice(0, 6);
  const recent = recentTransactions(6);

  const topGoal = savingsGoals[0];
  const goalProgress = (topGoal.saved / topGoal.target) * 100;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total balance"
          value={totalBalance}
          icon={Landmark}
          delta={4.2}
          caption="across 3 accounts"
          loading={loading}
        />
        <StatCard
          label="Income this month"
          value={currentMonth.income}
          icon={TrendingUp}
          delta={percentChange(currentMonth.income, previousMonth.income)}
          caption="vs. June"
          loading={loading}
        />
        <StatCard
          label="Expenses this month"
          value={currentMonth.expenses}
          icon={TrendingDown}
          delta={percentChange(currentMonth.expenses, previousMonth.expenses)}
          invertDelta
          caption="vs. June"
          loading={loading}
        />
        <StatCard
          label="Net cash"
          value={currentMonth.net}
          icon={PiggyBank}
          delta={percentChange(currentMonth.net, previousMonth.net)}
          caption={`${savingsRate.toFixed(0)}% savings rate`}
          loading={loading}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Income vs. expenses</h2>
              <p className="text-sm text-inkMuted">Cleared activity, transfers excluded</p>
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
            {loading ? <Skeleton className="h-[300px] w-full" /> : <IncomeExpenseChart data={series} />}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">July spend by category</h2>
          <p className="text-sm text-inkMuted">Where this month&apos;s money went</p>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="mx-auto h-[240px] w-[240px] rounded-full" />
            ) : (
              <CategoryDonut data={breakdown} height={240} />
            )}
          </div>
          <div className="mt-4 space-y-2.5">
            {breakdown.slice(0, 4).map((slice) => (
              <div key={slice.name} className="flex items-center gap-3 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate text-inkMuted">{slice.name}</span>
                <span className="ml-auto font-semibold tabular-nums">
                  {formatCurrency(slice.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Recent transactions</h2>
              <p className="text-sm text-inkMuted">Latest activity across all accounts</p>
            </div>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:gap-2.5 dark:text-brand-300"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-4 space-y-1">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))
              : recent.map((tx) => {
                  const category = categoryMap[tx.categoryId];
                  const signed = signedAmount(tx);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-white/70 dark:hover:bg-white/5"
                    >
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {tx.merchant.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tx.merchant}</p>
                        <p className="truncate text-xs text-inkMuted">
                          {category.label} · {formatDate(tx.date)}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <StatusBadge status={tx.status} />
                      </div>
                      <p
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          signed >= 0 ? "text-brand-600 dark:text-brand-300" : "text-ink"
                        )}
                      >
                        {formatSigned(signed)}
                      </p>
                    </div>
                  );
                })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold">Net cash by month</h2>
            <p className="text-sm text-inkMuted">Income minus expenses</p>
            <div className="mt-4">
              {loading ? <Skeleton className="h-[220px] w-full" /> : <NetCashChart data={series} height={220} />}
            </div>
          </Card>

          <Card className="transition hover:shadow-luxe">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{topGoal.name}</h2>
                <p className="mt-1 text-sm text-inkMuted">{topGoal.purpose}</p>
              </div>
              <Link
                href="/goals"
                className="shrink-0 rounded-xl border border-line p-2 text-inkMuted transition hover:text-ink dark:hover:text-white"
                aria-label="Open savings goals"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="mt-4 flex items-baseline justify-between text-sm">
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(topGoal.saved)}
              </span>
              <span className="text-inkMuted">of {formatCurrency(topGoal.target)}</span>
            </div>
            <Progress value={goalProgress} className="mt-3" />
            <p className="mt-2.5 text-xs text-inkMuted">
              {goalProgress.toFixed(0)}% funded · {formatCurrency(topGoal.monthlyContribution)}/mo
            </p>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Budget health</h2>
            <p className="text-sm text-inkMuted">July allocations</p>
            <div className="mt-4 space-y-4">
              {budgets.slice(0, 4).map((budget, index) => {
                const percent = (budget.spent / budget.allocated) * 100;
                return (
                  <div key={budget.id}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{budget.label}</span>
                      <span
                        className={cn(
                          "shrink-0 tabular-nums",
                          percent > 100 ? "font-semibold text-danger" : "text-inkMuted"
                        )}
                      >
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      color={categoryMap[budget.categoryId].color}
                      className="mt-2"
                      delayMs={index * 90}
                    />
                  </div>
                );
              })}
            </div>
            <Link
              href="/budgets"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:gap-2.5 dark:text-brand-300"
            >
              Manage budgets <ArrowRight size={15} />
            </Link>
          </Card>
        </div>
      </section>
    </>
  );
}
