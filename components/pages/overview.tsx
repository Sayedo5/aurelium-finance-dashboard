"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  Landmark,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet
} from "lucide-react";
import { CategoryDonut, IncomeExpenseChart, NetCashChart } from "@/components/charts/finance-charts";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/field";
import { ErrorBoundary } from "@/components/ui/states";
import {
  TODAY,
  budgets,
  categoryMap,
  clientMap,
  daysBetween,
  invoiceTotal,
  monthlySeries,
  savingsGoals,
  upcomingEvents,
  vendorMap
} from "@/lib/mock-data";
import { useSimulatedLoading } from "@/lib/hooks";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import {
  currentMonth,
  currentMonthKey,
  overdueBills,
  overdueInvoices,
  previousMonth,
  recentTransactions,
  savingsRate,
  signedAmount,
  spendByCategory,
  totalBalance,
  totalPayable,
  totalReceivable
} from "@/lib/selectors";
import { cn, percentChange, ratioToPercent } from "@/lib/utils";

type RangeId = "3m" | "6m" | "12m";

const ranges: Array<{ id: RangeId; label: string }> = [
  { id: "3m", label: "3M" },
  { id: "6m", label: "6M" },
  { id: "12m", label: "12M" }
];

const rangeMonths: Record<RangeId, number> = { "3m": 3, "6m": 6, "12m": 12 };

export function OverviewPage() {
  const { refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [range, setRange] = useState<RangeId>("6m");

  const series = useMemo(() => monthlySeries.slice(-rangeMonths[range]), [range]);
  const breakdown = useMemo(() => spendByCategory(currentMonthKey).slice(0, 6), []);
  const recent = useMemo(() => recentTransactions(6), []);
  const nextUp = useMemo(() => upcomingEvents.slice(0, 5), []);

  const topGoal = savingsGoals[0];
  const goalProgress = ratioToPercent(topGoal.saved, topGoal.target);

  const attention = [
    overdueInvoices.length > 0
      ? {
          id: "invoices",
          label: `${overdueInvoices.length} overdue invoices`,
          detail: `${fmt.money(overdueInvoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0))} outstanding`,
          href: "/dashboard/invoices"
        }
      : null,
    overdueBills.length > 0
      ? {
          id: "bills",
          label: `${overdueBills.length} overdue bills`,
          detail: `${fmt.money(overdueBills.reduce((sum, bill) => sum + bill.amount, 0))} to pay`,
          href: "/dashboard/bills"
        }
      : null,
    budgets.filter((budget) => budget.spent > budget.allocated).length > 0
      ? {
          id: "budgets",
          label: `${budgets.filter((budget) => budget.spent > budget.allocated).length} budget over allocation`,
          detail: "July spend has breached the plan",
          href: "/dashboard/budgets"
        }
      : null
  ].filter(Boolean) as Array<{ id: string; label: string; detail: string; href: string }>;

  return (
    <>
      <section
        aria-label="Key figures"
        className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total balance"
          value={totalBalance}
          icon={Landmark}
          delta={4.2}
          caption="across 4 cash accounts"
          loading={loading}
        />
        <StatCard
          label="Income this month"
          value={currentMonth.income}
          icon={TrendingUp}
          delta={percentChange(currentMonth.income, previousMonth.income)}
          caption="vs. June"
          loading={loading}
          tone="gain"
        />
        <StatCard
          label="Expenses this month"
          value={currentMonth.expenses}
          icon={TrendingDown}
          delta={percentChange(currentMonth.expenses, previousMonth.expenses)}
          invertDelta
          caption="vs. June"
          loading={loading}
          tone="loss"
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

      {/* Working capital + needs attention */}
      <section className="grid animate-rise gap-4 stagger-1 lg:grid-cols-3">
        <Link href="/dashboard/invoices" className="block">
          <Card interactive className="h-full">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow">Receivable</p>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-surfaceMuted text-gain-600 dark:text-gain-400">
                <CircleDollarSign size={17} aria-hidden />
              </span>
            </div>
            {loading ? (
              <Skeleton className="mt-3.5 h-8 w-32" />
            ) : (
              <p className="numeric mt-3.5 text-2xl font-semibold text-ink">
                {fmt.money(totalReceivable)}
              </p>
            )}
            <p className="mt-2 text-xs text-inkMuted">Money owed to the business</p>
          </Card>
        </Link>

        <Link href="/dashboard/bills" className="block">
          <Card interactive className="h-full">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow">Payable</p>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-surfaceMuted text-loss-600 dark:text-loss-400">
                <Wallet size={17} aria-hidden />
              </span>
            </div>
            {loading ? (
              <Skeleton className="mt-3.5 h-8 w-32" />
            ) : (
              <p className="numeric mt-3.5 text-2xl font-semibold text-ink">
                {fmt.money(totalPayable)}
              </p>
            )}
            <p className="mt-2 text-xs text-inkMuted">Bills scheduled and overdue</p>
          </Card>
        </Link>

        <Card className="h-full">
          <div className="flex items-start justify-between gap-3">
            <p className="eyebrow">Needs attention</p>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-surfaceMuted text-caution-700 dark:text-caution-300">
              <AlertTriangle size={17} aria-hidden />
            </span>
          </div>
          {loading ? (
            <div className="mt-3.5 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          ) : attention.length === 0 ? (
            <p className="mt-3.5 text-sm text-inkMuted">
              Nothing overdue. Every budget is within its allocation.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {attention.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 rounded-control px-1.5 py-1 transition-colors hover:bg-surfaceMuted"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-caution-500" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-inkMuted">{item.detail}</span>
                    </span>
                    <ArrowRight
                      size={14}
                      aria-hidden
                      className="shrink-0 text-inkSubtle transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="grid animate-rise gap-4 stagger-2 xl:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Income vs. expenses"
            description="Cleared activity, transfers excluded"
            actions={
              <SegmentedControl
                label="Chart range"
                options={ranges}
                value={range}
                onChange={setRange}
              />
            }
          />
          <div className="mt-5">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ErrorBoundary section="Income vs. expenses">
                <IncomeExpenseChart data={series} />
              </ErrorBoundary>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="July spend by category" description="Where this month's money went" />
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
              ? Array.from({ length: 4 }).map((_, index) => (
                  <li key={index}>
                    <Skeleton className="h-4 w-full" />
                  </li>
                ))
              : breakdown.slice(0, 4).map((slice) => (
                  <li key={slice.name} className="flex items-center gap-3 text-sm">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="truncate text-inkMuted">{slice.name}</span>
                    <span className="numeric ml-auto shrink-0 font-semibold">
                      {fmt.money(slice.value)}
                    </span>
                  </li>
                ))}
          </ul>
        </Card>
      </section>

      <section className="grid animate-rise gap-4 stagger-3 xl:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Recent transactions"
            description="Latest activity across all accounts"
            actions={
              <Link
                href="/dashboard/transactions"
                className="group inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-sm font-medium text-aurum-700 transition hover:bg-surfaceMuted dark:text-aurum-400"
              >
                View all
                <ArrowRight
                  size={15}
                  aria-hidden
                  className="transition-transform duration-200 ease-smooth group-hover:translate-x-0.5"
                />
              </Link>
            }
          />

          <ul className="mt-4 space-y-0.5">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <li key={index} className="px-2 py-3">
                    <Skeleton className="h-10 w-full" />
                  </li>
                ))
              : recent.map((tx) => {
                  const category = categoryMap[tx.categoryId];
                  const signed = signedAmount(tx);
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center gap-3 rounded-control px-2 py-2.5 transition-colors duration-150 hover:bg-surfaceMuted"
                    >
                      <span
                        aria-hidden
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-control text-[11px] font-bold text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {tx.merchant.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{tx.merchant}</p>
                        <p className="truncate text-xs text-inkMuted">
                          {category.label} · {fmt.date(tx.date)}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <StatusBadge status={tx.status} />
                      </div>
                      <p
                        className={cn(
                          "numeric shrink-0 text-sm font-semibold",
                          signed >= 0 ? "text-gain-600 dark:text-gain-400" : "text-ink"
                        )}
                      >
                        {fmt.signed(signed)}
                      </p>
                    </li>
                  );
                })}
          </ul>
        </Card>

        <div className="space-y-4">
          {/* Coming up */}
          <Card>
            <CardHeader
              title="Coming up"
              description="Next dated obligations"
              actions={
                <Link
                  href="/dashboard/calendar"
                  aria-label="Open the calendar"
                  className="grid h-8 w-8 place-items-center rounded-control border border-line text-inkMuted transition hover:border-lineStrong hover:text-ink"
                >
                  <CalendarClock size={15} aria-hidden />
                </Link>
              }
            />
            <ul className="mt-4 space-y-0.5">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <li key={index} className="py-2">
                      <Skeleton className="h-8 w-full" />
                    </li>
                  ))
                : nextUp.map((event) => {
                    const days = daysBetween(TODAY, event.date);
                    return (
                      <li
                        key={event.id}
                        className="flex items-center gap-3 rounded-control px-1.5 py-2 transition-colors hover:bg-surfaceMuted"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">
                            {event.title}
                          </span>
                          <span className="block truncate text-xs text-inkMuted">
                            {fmt.date(event.date)}
                          </span>
                        </span>
                        <Badge tone={days <= 3 ? "warn" : "neutral"}>
                          {days === 0 ? "Today" : `${days}d`}
                        </Badge>
                      </li>
                    );
                  })}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Net cash by month" description="Income minus expenses" />
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : (
                <ErrorBoundary section="Net cash">
                  <NetCashChart data={series} height={180} />
                </ErrorBoundary>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={topGoal.name}
              description={topGoal.purpose}
              actions={
                <Link
                  href="/dashboard/goals"
                  aria-label="Open savings goals"
                  className="grid h-8 w-8 place-items-center rounded-control border border-line text-inkMuted transition hover:border-lineStrong hover:text-ink"
                >
                  <ArrowUpRight size={15} aria-hidden />
                </Link>
              }
            />
            <div className="mt-4 flex items-baseline justify-between gap-2 text-sm">
              <span className="numeric text-lg font-semibold">{fmt.money(topGoal.saved)}</span>
              <span className="text-inkMuted">of {fmt.money(topGoal.target)}</span>
            </div>
            <Progress
              value={goalProgress}
              className="mt-3"
              label={`${topGoal.name} funding progress`}
            />
            <p className="mt-2.5 text-xs text-inkMuted">
              {goalProgress.toFixed(0)}% funded · {fmt.money(topGoal.monthlyContribution)}/mo
            </p>
          </Card>

          <Card>
            <CardHeader title="Budget health" description="July allocations" />
            <div className="mt-4 space-y-3.5">
              {budgets.slice(0, 4).map((budget, index) => {
                const percent = ratioToPercent(budget.spent, budget.allocated);
                return (
                  <div key={budget.id}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-ink">{budget.label}</span>
                      <span
                        className={cn(
                          "numeric shrink-0 text-xs font-semibold",
                          percent > 100 ? "text-loss-600 dark:text-loss-400" : "text-inkMuted"
                        )}
                      >
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      color={categoryMap[budget.categoryId].color}
                      className="mt-2"
                      delayMs={index * 80}
                      label={`${budget.label} budget used`}
                    />
                  </div>
                );
              })}
            </div>
            <Link
              href="/dashboard/budgets"
              className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-aurum-700 dark:text-aurum-400"
            >
              Manage budgets
              <ArrowRight
                size={15}
                aria-hidden
                className="transition-transform duration-200 ease-smooth group-hover:translate-x-0.5"
              />
            </Link>
          </Card>
        </div>
      </section>
    </>
  );
}
