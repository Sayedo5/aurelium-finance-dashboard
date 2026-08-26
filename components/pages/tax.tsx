"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Download,
  Landmark,
  PiggyBank,
  Receipt,
  Wallet
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/field";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { accountMap, effectiveTaxRate, savingsGoals, taxPeriods } from "@/lib/mock-data";
import { currentMonth, taxOutstanding, taxYearToDate } from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, ratioToPercent } from "@/lib/utils";
import type { TaxPeriod } from "@/lib/types";

const statusTone = {
  filed: "good",
  due: "bad",
  upcoming: "neutral"
} as const;

const statusLabel = {
  filed: "Filed",
  due: "Payment due",
  upcoming: "Upcoming"
} as const;

export function TaxPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [selectedId, setSelectedId] = useState(
    taxPeriods.find((period) => period.status === "due")?.id ?? taxPeriods[0].id
  );
  // The set-aside calculator is a working tool, not a static figure.
  const [rate, setRate] = useState(String(effectiveTaxRate));

  const selected = taxPeriods.find((period) => period.id === selectedId) ?? taxPeriods[0];
  const shortfall = Math.max(0, selected.estimatedTax - selected.paid);

  const reserveAccount = accountMap["acc-reserve"];
  const taxGoal = savingsGoals.find((goal) => goal.id === "g-tax");

  const setAside = useMemo(() => {
    const parsed = Number(rate);
    const safeRate = Number.isFinite(parsed) ? Math.min(60, Math.max(0, parsed)) : effectiveTaxRate;
    return {
      rate: safeRate,
      monthly: (currentMonth.net * safeRate) / 100,
      quarterly: (currentMonth.net * 3 * safeRate) / 100
    };
  }, [rate]);

  const coverage = ratioToPercent(reserveAccount?.balance ?? 0, taxOutstanding || 1);

  function exportPeriods() {
    const csv = toCsv<TaxPeriod>(taxPeriods, [
      { header: "Period", value: (period) => period.label },
      { header: "Start", value: (period) => period.periodStart },
      { header: "End", value: (period) => period.periodEnd },
      { header: "Due", value: (period) => period.dueOn },
      { header: "Status", value: (period) => period.status },
      { header: "Taxable income (USD)", value: (period) => period.taxableIncome.toFixed(2) },
      { header: "Estimated tax (USD)", value: (period) => period.estimatedTax.toFixed(2) },
      { header: "Paid (USD)", value: (period) => period.paid.toFixed(2) },
      {
        header: "Outstanding (USD)",
        value: (period) => Math.max(0, period.estimatedTax - period.paid).toFixed(2)
      }
    ]);

    const ok = downloadCsv(csvFilename("tax-estimates", "2026"), csv);
    addToast(
      ok
        ? {
            title: "Tax schedule exported",
            body: `${taxPeriods.length} periods saved as CSV.`,
            tone: "success"
          }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  return (
    <>
      <section aria-label="Tax summary" className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding liability"
          value={taxOutstanding}
          icon={AlertTriangle}
          caption="across unfiled periods"
          loading={loading}
          tone={taxOutstanding > 0 ? "loss" : "gain"}
        />
        <StatCard
          label="Paid year to date"
          value={taxYearToDate}
          icon={CheckCircle2}
          caption="2026 estimates settled"
          loading={loading}
          tone="gain"
        />
        <StatCard
          label="Tax reserve balance"
          value={reserveAccount?.balance ?? 0}
          icon={PiggyBank}
          caption={`covers ${coverage > 999 ? "999+" : coverage.toFixed(0)}% of what is owed`}
          loading={loading}
        />
        <StatCard
          label="Effective rate"
          value={effectiveTaxRate}
          icon={Landmark}
          caption="blended federal and state"
          loading={loading}
          format={(value) => `${value.toFixed(1)}%`}
        />
      </section>

      {taxOutstanding > 0 ? (
        <div className="flex animate-rise items-start gap-3 rounded-card border border-caution-300 bg-caution-100/50 px-4 py-3.5 stagger-1 dark:border-caution-900 dark:bg-caution-900/20">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-caution-700 dark:text-caution-300"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-inkMuted">
            <span className="font-medium text-ink">
              {fmt.money(taxOutstanding)} of estimated tax is unpaid.
            </span>{" "}
            The tax reserve holds {fmt.money(reserveAccount?.balance ?? 0)}, so the balance is
            covered — but the Q2 payment is already past its 15 July deadline.
          </p>
        </div>
      ) : null}

      <section className="grid animate-rise gap-4 stagger-2 xl:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
        {/* Quarterly schedule */}
        <Card flush>
          <div className="border-b border-line p-5">
            <CardHeader
              title="Quarterly estimates"
              description="Select a period to see its detail"
              actions={
                <Button variant="secondary" size="md" icon={Download} onClick={exportPeriods}>
                  <span className="hidden sm:inline">Export</span>
                </Button>
              }
            />
          </div>

          <ul className="divide-y divide-line">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <li key={index} className="p-5">
                    <Skeleton className="h-14 w-full" />
                  </li>
                ))
              : taxPeriods.map((period, index) => {
                  const paidShare = ratioToPercent(period.paid, period.estimatedTax);
                  const active = period.id === selectedId;
                  const owing = Math.max(0, period.estimatedTax - period.paid);

                  return (
                    <li key={period.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(period.id)}
                        aria-pressed={active}
                        className={cn(
                          "w-full p-5 text-left transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aurum-400",
                          active ? "bg-surfaceMuted" : "hover:bg-surfaceMuted"
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-ink">{period.label}</p>
                              <Badge tone={statusTone[period.status]} dot>
                                {statusLabel[period.status]}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-inkMuted">
                              {fmt.date(period.periodStart)} – {fmt.date(period.periodEnd)} · due{" "}
                              {fmt.date(period.dueOn)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="numeric font-semibold text-ink">
                              {fmt.money(period.estimatedTax)}
                            </p>
                            <p
                              className={cn(
                                "numeric mt-0.5 text-xs font-medium",
                                owing > 0
                                  ? "text-loss-600 dark:text-loss-400"
                                  : "text-gain-600 dark:text-gain-400"
                              )}
                            >
                              {owing > 0 ? `${fmt.money(owing)} owing` : "Settled"}
                            </p>
                          </div>
                        </div>

                        <Progress
                          value={paidShare}
                          color={owing > 0 ? "var(--loss)" : "var(--gain)"}
                          className="mt-3.5"
                          delayMs={index * 70}
                          label={`${period.label} paid`}
                        />
                        <p className="numeric mt-2 text-xs text-inkMuted">
                          {fmt.money(period.paid)} paid of {fmt.money(period.estimatedTax)} ·{" "}
                          {paidShare.toFixed(0)}%
                        </p>
                      </button>
                    </li>
                  );
                })}
          </ul>
        </Card>

        <div className="space-y-4">
          {/* Selected period detail */}
          <Card>
            <CardHeader title={selected.label} description="Estimate detail" />
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Taxable income</dt>
                <dd className="numeric font-medium text-ink">
                  {fmt.money(selected.taxableIncome)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Estimated tax</dt>
                <dd className="numeric font-medium text-ink">{fmt.money(selected.estimatedTax)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Already paid</dt>
                <dd className="numeric font-medium text-gain-600 dark:text-gain-400">
                  {fmt.money(selected.paid)}
                </dd>
              </div>
              <div
                className={cn(
                  "flex justify-between gap-4 rounded-control px-3 py-2.5 ring-1",
                  shortfall > 0
                    ? "bg-loss-100/50 ring-loss-300 dark:bg-loss-900/20 dark:ring-loss-900"
                    : "bg-surfaceMuted ring-line"
                )}
              >
                <dt className="font-medium text-ink">Still owing</dt>
                <dd
                  className={cn(
                    "numeric text-base font-semibold",
                    shortfall > 0 ? "text-loss-600 dark:text-loss-400" : "text-ink"
                  )}
                >
                  {fmt.money(shortfall)}
                </dd>
              </div>
            </dl>

            <Button
              variant="accent"
              className="mt-5 w-full"
              icon={Receipt}
              disabled={shortfall === 0}
              onClick={() =>
                addToast({
                  title: shortfall > 0 ? "Payment scheduled" : "Nothing owing",
                  body:
                    shortfall > 0
                      ? `${fmt.money(shortfall)} would be paid from the Tax Reserve.`
                      : `${selected.label} is already settled.`,
                  tone: shortfall > 0 ? "success" : "info"
                })
              }
            >
              {shortfall > 0 ? `Pay ${fmt.money(shortfall)}` : "Fully paid"}
            </Button>
          </Card>

          {/* Set-aside calculator */}
          <Card>
            <CardHeader
              title="Set-aside calculator"
              description="How much of current profit to hold back"
            />

            <Field
              label="Effective tax rate (%)"
              htmlFor="tax-rate"
              className="mt-4"
              hint="Blended federal and state. Clamped to 0–60%."
            >
              <Input
                id="tax-rate"
                inputMode="decimal"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </Field>

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">July net income</dt>
                <dd className="numeric font-medium text-ink">{fmt.money(currentMonth.net)}</dd>
              </div>
              <div className="flex justify-between gap-4 rounded-control border border-line px-3 py-2.5">
                <dt className="text-inkMuted">Set aside monthly</dt>
                <dd className="numeric font-semibold text-ink">{fmt.money(setAside.monthly)}</dd>
              </div>
              <div className="flex justify-between gap-4 rounded-control bg-surfaceMuted px-3 py-2.5 ring-1 ring-line">
                <dt className="font-medium text-ink">Per quarter</dt>
                <dd className="numeric text-base font-semibold text-ink">
                  {fmt.money(setAside.quarterly)}
                </dd>
              </div>
            </dl>

            {taxGoal ? (
              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{taxGoal.name}</span>
                  <span className="numeric shrink-0 text-xs text-inkMuted">
                    {ratioToPercent(taxGoal.saved, taxGoal.target).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={ratioToPercent(taxGoal.saved, taxGoal.target)}
                  className="mt-2"
                  label={`${taxGoal.name} funding`}
                />
                <p className="numeric mt-2 text-xs text-inkMuted">
                  {fmt.money(taxGoal.saved)} of {fmt.money(taxGoal.target)} ·{" "}
                  {fmt.money(taxGoal.monthlyContribution)}/mo
                </p>
              </div>
            ) : null}
          </Card>

          <Card>
            <div className="flex items-start gap-2.5">
              <CalendarClock size={15} className="mt-0.5 shrink-0 text-inkSubtle" aria-hidden />
              <p className="text-xs leading-relaxed text-inkMuted">
                Estimates are modelled at a flat {effectiveTaxRate}% of taxable income and are not
                tax advice. Real quarterly obligations depend on entity type, deductions and
                jurisdiction — confirm with your accountant before filing.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
              <Wallet size={15} className="shrink-0 text-inkSubtle" aria-hidden />
              <p className="text-xs text-inkMuted">
                Payments draw from {reserveAccount?.name} ··{reserveAccount?.mask}
              </p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
