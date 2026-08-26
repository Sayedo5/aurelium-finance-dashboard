"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Download,
  Gauge,
  RotateCcw,
  TrendingUp,
  Wallet
} from "lucide-react";
import { ForecastChart } from "@/components/charts/finance-charts";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedControl } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ui/states";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { forecastScenarios } from "@/lib/mock-data";
import { breakEvenMonth, buildForecast, runwayMonths, totalBalance } from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import type { ForecastPoint, ForecastScenario } from "@/lib/types";

const horizons = [
  { id: "6", label: "6 months" },
  { id: "12", label: "12 months" }
];

/** Slider bounds, expressed as month-over-month percentage growth. */
const REVENUE_RANGE = { min: -5, max: 12 };
const EXPENSE_RANGE = { min: -3, max: 10 };
const COST_RANGE = { min: 0, max: 120000 };

export function ForecastPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [scenarioId, setScenarioId] = useState(forecastScenarios[1].id);
  const [horizon, setHorizon] = useState("12");

  const preset = forecastScenarios.find((item) => item.id === scenarioId) ?? forecastScenarios[1];

  // Assumptions start from the preset and can then be tuned by hand. Picking a
  // different preset resets them, which is what makes the presets useful.
  const [revenueGrowth, setRevenueGrowth] = useState((preset.revenueGrowth - 1) * 100);
  const [expenseGrowth, setExpenseGrowth] = useState((preset.expenseGrowth - 1) * 100);
  const [extraCost, setExtraCost] = useState(preset.additionalMonthlyCost);
  const [touched, setTouched] = useState(false);

  function applyPreset(id: string) {
    const next = forecastScenarios.find((item) => item.id === id);
    if (!next) return;
    setScenarioId(id);
    setRevenueGrowth((next.revenueGrowth - 1) * 100);
    setExpenseGrowth((next.expenseGrowth - 1) * 100);
    setExtraCost(next.additionalMonthlyCost);
    setTouched(false);
  }

  const scenario: ForecastScenario = useMemo(
    () => ({
      id: touched ? "custom" : preset.id,
      label: touched ? "Custom" : preset.label,
      description: touched ? "Your own assumptions." : preset.description,
      revenueGrowth: 1 + revenueGrowth / 100,
      expenseGrowth: 1 + expenseGrowth / 100,
      additionalMonthlyCost: extraCost
    }),
    [touched, preset, revenueGrowth, expenseGrowth, extraCost]
  );

  const points = useMemo(
    () => buildForecast(scenario, Number(horizon)),
    [scenario, horizon]
  );

  const projected = useMemo(() => points.filter((point) => !point.actual), [points]);
  const endingBalance = projected[projected.length - 1]?.balance ?? totalBalance;
  const runway = runwayMonths(points);
  const breakEven = breakEvenMonth(points);
  const averageNet =
    projected.reduce((sum, point) => sum + point.net, 0) / Math.max(1, projected.length);

  function exportForecast() {
    const csv = toCsv<ForecastPoint>(points, [
      { header: "Month", value: (point) => point.month },
      { header: "Type", value: (point) => (point.actual ? "actual" : "projected") },
      { header: "Income (USD)", value: (point) => point.income.toFixed(2) },
      { header: "Expenses (USD)", value: (point) => point.expenses.toFixed(2) },
      { header: "Net (USD)", value: (point) => point.net.toFixed(2) },
      { header: "Closing balance (USD)", value: (point) => point.balance.toFixed(2) }
    ]);

    const ok = downloadCsv(csvFilename("forecast", scenario.id), csv);
    addToast(
      ok
        ? {
            title: "Forecast exported",
            body: `${points.length} months saved as CSV.`,
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
      <section aria-label="Forecast summary" className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cash today"
          value={totalBalance}
          icon={Wallet}
          caption="across all cash accounts"
          loading={loading}
        />
        <StatCard
          label={`Balance in ${horizon} months`}
          value={endingBalance}
          icon={TrendingUp}
          caption={scenario.label.toLowerCase() + " assumptions"}
          loading={loading}
          tone={endingBalance >= totalBalance ? "gain" : "loss"}
        />
        <StatCard
          label="Average monthly net"
          value={averageNet}
          icon={Activity}
          caption="across the projection"
          loading={loading}
          tone={averageNet >= 0 ? "gain" : "loss"}
        />
        <StatCard
          label="Runway"
          value={Number.isFinite(runway) ? runway : 0}
          icon={Gauge}
          caption={Number.isFinite(runway) ? "at the projected burn" : "cash-positive, no burn"}
          loading={loading}
          format={(value) =>
            Number.isFinite(runway) ? `${Math.round(value)} months` : "Indefinite"
          }
        />
      </section>

      <Card className="animate-rise stagger-1">
        <CardHeader
          title="Cash balance projection"
          description="Solid is actual, dashed is projected from the trailing three-month average"
          actions={
            <>
              <SegmentedControl
                label="Projection horizon"
                options={horizons}
                value={horizon}
                onChange={setHorizon}
              />
              <Button variant="secondary" size="md" icon={Download} onClick={exportForecast}>
                <span className="hidden sm:inline">Export</span>
              </Button>
            </>
          }
        />
        <div className="mt-5">
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ErrorBoundary section="Cash balance projection">
              <ForecastChart data={points} height={300} />
            </ErrorBoundary>
          )}
        </div>

        {breakEven ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-control border border-loss-300 bg-loss-100/50 px-4 py-3 dark:border-loss-900 dark:bg-loss-900/20">
            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0 text-loss-600 dark:text-loss-400"
              aria-hidden
            />
            <p className="text-xs leading-relaxed text-inkMuted">
              <span className="font-medium text-ink">Cash runs out in {breakEven}.</span> Under
              these assumptions the balance goes negative before the end of the projection. Reduce
              the planned monthly cost or raise the revenue growth rate.
            </p>
          </div>
        ) : null}
      </Card>

      <section className="grid animate-rise gap-4 stagger-2 xl:grid-cols-[minmax(0,1fr),minmax(0,1.3fr)]">
        {/* Assumptions */}
        <Card>
          <CardHeader
            title="Assumptions"
            description="Start from a scenario, then tune it"
            actions={
              touched ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => applyPreset(scenarioId)}
                >
                  Reset
                </Button>
              ) : null
            }
          />

          <div className="mt-5 space-y-2">
            {forecastScenarios.map((item) => {
              const active = !touched && item.id === scenarioId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyPreset(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "w-full rounded-control border p-3.5 text-left transition duration-200 ease-smooth",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400",
                    active
                      ? "border-aurum-400/60 bg-aurum-400/[0.07] ring-1 ring-aurum-400/40"
                      : "border-line hover:border-lineStrong hover:bg-surfaceMuted"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{item.label}</span>
                    <span className="numeric text-xs font-semibold text-inkMuted">
                      {((item.revenueGrowth - 1) * 100).toFixed(1)}% rev
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-inkMuted">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-5 border-t border-line pt-5">
            <Slider
              label="Revenue growth"
              hint="Month over month"
              value={revenueGrowth}
              min={REVENUE_RANGE.min}
              max={REVENUE_RANGE.max}
              step={0.1}
              display={`${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`}
              onChange={(value) => {
                setRevenueGrowth(value);
                setTouched(true);
              }}
            />
            <Slider
              label="Expense growth"
              hint="Month over month"
              value={expenseGrowth}
              min={EXPENSE_RANGE.min}
              max={EXPENSE_RANGE.max}
              step={0.1}
              display={`${expenseGrowth >= 0 ? "+" : ""}${expenseGrowth.toFixed(1)}%`}
              onChange={(value) => {
                setExpenseGrowth(value);
                setTouched(true);
              }}
            />
            <Slider
              label="Planned monthly cost"
              hint="Applied from month three"
              value={extraCost}
              min={COST_RANGE.min}
              max={COST_RANGE.max}
              step={1000}
              display={fmt.money(extraCost)}
              onChange={(value) => {
                setExtraCost(value);
                setTouched(true);
              }}
            />
          </div>

          {touched ? (
            <div className="mt-5">
              <Badge tone="accent">Custom assumptions</Badge>
            </div>
          ) : null}
        </Card>

        {/* Month-by-month */}
        <Card flush>
          <div className="border-b border-line p-5">
            <CardHeader
              title="Month by month"
              description={`${projected.length} projected months under ${scenario.label.toLowerCase()} assumptions`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <caption className="sr-only">Projected income, expenses, net and closing balance</caption>
              <thead>
                <tr className="border-b border-line bg-surfaceMuted/60 text-label font-semibold uppercase text-inkMuted">
                  <th scope="col" className="px-4 py-2.5">
                    Month
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Income
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 text-right sm:table-cell">
                    Expenses
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Net
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, index) => (
                      <tr key={index} className="border-b border-line last:border-0">
                        <td colSpan={5} className="px-4 py-3">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                  : projected.map((point, index) => (
                      <tr
                        key={`${point.month}-${index}`}
                        className="border-b border-line transition-colors last:border-0 hover:bg-surfaceMuted"
                      >
                        <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                          {point.month}
                          <span className="ml-1.5 text-xs font-normal text-inkSubtle">
                            +{index + 1}
                          </span>
                        </th>
                        <td className="numeric px-4 py-2.5 text-right text-gain-600 dark:text-gain-400">
                          {fmt.money(point.income)}
                        </td>
                        <td className="numeric hidden px-4 py-2.5 text-right text-loss-600 dark:text-loss-400 sm:table-cell">
                          {fmt.money(point.expenses)}
                        </td>
                        <td
                          className={cn(
                            "numeric px-4 py-2.5 text-right font-medium",
                            point.net >= 0
                              ? "text-gain-600 dark:text-gain-400"
                              : "text-loss-600 dark:text-loss-400"
                          )}
                        >
                          {fmt.signed(point.net)}
                        </td>
                        <td
                          className={cn(
                            "numeric px-4 py-2.5 text-right font-semibold",
                            point.balance < 0 ? "text-loss-600 dark:text-loss-400" : "text-ink"
                          )}
                        >
                          {fmt.money(point.balance)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2.5 border-t border-line px-5 py-3.5">
            <CalendarClock size={14} className="shrink-0 text-inkSubtle" aria-hidden />
            <p className="text-xs leading-relaxed text-inkMuted">
              Projections start from the trailing three-month average and compound the growth rates
              above. Planned cost is applied from the third month onward.
            </p>
          </div>
        </Card>
      </section>
    </>
  );
}

/** Range input with a live read-out, used for the three forecast assumptions. */
function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  display,
  onChange
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="numeric text-sm font-semibold text-aurum-700 dark:text-aurum-400">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-pill bg-surfaceMuted accent-aurum-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      />
      <p className="mt-1.5 text-xs text-inkSubtle">{hint}</p>
    </div>
  );
}
