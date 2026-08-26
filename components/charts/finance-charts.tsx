"use client";

import { memo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ForecastPoint, MonthlyPoint } from "@/lib/types";
import { useFormat } from "@/components/providers/app-provider";
import type { BreakdownSlice } from "@/lib/selectors";

/**
 * Series colours resolve through CSS variables, so both themes are handled by
 * the stylesheet and no chart has to re-render when the theme flips.
 */
const INCOME = "var(--gain)";
const EXPENSE = "var(--loss)";
const NET = "var(--accent)";

const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "currentColor", fontSize: 11 },
  className: "text-inkMuted"
} as const;

const gridStroke = "var(--line)";

/** Recharts animates on data change; 600ms reads as responsive, not showy. */
const ANIM = 600;

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  payload?: Record<string, unknown>;
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  valueFormatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-control border border-line bg-surface px-3 py-2.5 shadow-overlay">
      {label ? <p className="mb-1.5 text-xs font-semibold text-inkMuted">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="text-inkMuted">{entry.name}</span>
            <span className="numeric ml-auto pl-3 font-semibold">
              {valueFormatter(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const legendProps = {
  verticalAlign: "top",
  height: 30,
  iconType: "circle",
  iconSize: 8,
  wrapperStyle: { fontSize: 12, color: "var(--ink-muted)" }
} as const;

interface SeriesChartProps {
  data: MonthlyPoint[];
  height?: number;
}

/** Income vs expense — the headline chart on the overview. */
function IncomeExpenseChartBase({ data, height = 300 }: SeriesChartProps) {
  const fmt = useFormat();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="aurelium-income" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={INCOME} stopOpacity={0.32} />
            <stop offset="100%" stopColor={INCOME} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="aurelium-expense" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={EXPENSE} stopOpacity={0.22} />
            <stop offset="100%" stopColor={EXPENSE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={62} tickFormatter={fmt.compact} />
        <Tooltip
          content={<ChartTooltip valueFormatter={(value) => fmt.money(value)} />}
          cursor={{ stroke: gridStroke, strokeWidth: 2 }}
        />
        <Legend {...legendProps} />
        <Area
          type="monotone"
          name="Income"
          dataKey="income"
          stroke={INCOME}
          fill="url(#aurelium-income)"
          strokeWidth={2}
          animationDuration={ANIM}
        />
        <Area
          type="monotone"
          name="Expenses"
          dataKey="expenses"
          stroke={EXPENSE}
          fill="url(#aurelium-expense)"
          strokeWidth={2}
          animationDuration={ANIM}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Net cash per month; green above the line, red below it. */
function NetCashChartBase({ data, height = 260 }: SeriesChartProps) {
  const fmt = useFormat();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={62} tickFormatter={fmt.compact} />
        <Tooltip
          content={<ChartTooltip valueFormatter={(value) => fmt.signed(value)} />}
          cursor={{ fill: "var(--surface-muted)" }}
        />
        <Bar dataKey="net" name="Net cash" radius={[6, 6, 0, 0]} animationDuration={ANIM}>
          {data.map((entry) => (
            <Cell key={entry.month} fill={entry.net >= 0 ? INCOME : EXPENSE} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CategoryDonutBase({ data, height = 280 }: { data: BreakdownSlice[]; height?: number }) {
  const fmt = useFormat();

  if (data.length === 0) {
    return (
      <div
        className="grid place-items-center text-sm text-inkMuted"
        style={{ height }}
      >
        No spend recorded for this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="60%"
          outerRadius="88%"
          paddingAngle={2}
          animationDuration={ANIM}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip valueFormatter={(value) => fmt.money(value)} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function TrendLineChartBase({ data, height = 260 }: SeriesChartProps) {
  const fmt = useFormat();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={62} tickFormatter={fmt.compact} />
        <Tooltip
          content={<ChartTooltip valueFormatter={(value) => fmt.signed(value)} />}
          cursor={{ stroke: gridStroke, strokeWidth: 2 }}
        />
        <Legend {...legendProps} />
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke={INCOME}
          strokeWidth={2}
          dot={{ r: 2.5, strokeWidth: 0, fill: INCOME }}
          activeDot={{ r: 5 }}
          animationDuration={ANIM}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={EXPENSE}
          strokeWidth={2}
          dot={{ r: 2.5, strokeWidth: 0, fill: EXPENSE }}
          activeDot={{ r: 5 }}
          animationDuration={ANIM}
        />
        <Line
          type="monotone"
          dataKey="net"
          name="Net"
          stroke={NET}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={{ r: 2.5, strokeWidth: 0, fill: NET }}
          activeDot={{ r: 5 }}
          animationDuration={ANIM}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Cash balance projection.
 *
 * Actual months render solid, projected months dashed, using two series that
 * overlap by one point so the lines join without a visible seam.
 */
function ForecastChartBase({
  data,
  height = 300
}: {
  data: ForecastPoint[];
  height?: number;
}) {
  const fmt = useFormat();
  const lastActual = data.filter((point) => point.actual).length - 1;

  // Split into two keys so Recharts can style history and projection separately.
  const shaped = data.map((point, index) => ({
    month: point.month,
    history: point.actual ? point.balance : null,
    projection: !point.actual || index === lastActual ? point.balance : null,
    net: point.net
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={shaped} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="aurelium-balance" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={NET} stopOpacity={0.3} />
            <stop offset="100%" stopColor={NET} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={62} tickFormatter={fmt.compact} />
        <Tooltip
          content={<ChartTooltip valueFormatter={(value) => fmt.money(value)} />}
          cursor={{ stroke: gridStroke, strokeWidth: 2 }}
        />
        <Legend {...legendProps} />
        <Area
          type="monotone"
          name="Actual balance"
          dataKey="history"
          stroke={INCOME}
          fill="url(#aurelium-balance)"
          strokeWidth={2.5}
          connectNulls={false}
          animationDuration={ANIM}
        />
        <Area
          type="monotone"
          name="Projected balance"
          dataKey="projection"
          stroke={NET}
          strokeDasharray="6 5"
          fill="url(#aurelium-balance)"
          strokeWidth={2.5}
          connectNulls={false}
          animationDuration={ANIM}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Invoiced vs. collected per month — the receivables view of revenue.
 */
function CollectionsChartBase({
  data,
  height = 260
}: {
  data: Array<{ month: string; invoiced: number; collected: number }>;
  height?: number;
}) {
  const fmt = useFormat();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={62} tickFormatter={fmt.compact} />
        <Tooltip
          content={<ChartTooltip valueFormatter={(value) => fmt.money(value)} />}
          cursor={{ fill: "var(--surface-muted)" }}
        />
        <Legend {...legendProps} />
        <Bar dataKey="invoiced" name="Invoiced" fill={NET} radius={[4, 4, 0, 0]} animationDuration={ANIM} />
        <Bar
          dataKey="collected"
          name="Collected"
          fill={INCOME}
          radius={[4, 4, 0, 0]}
          animationDuration={ANIM}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * All are memoised. Chart data changes only when a range, scenario or month
 * filter moves, but the pages around them re-render on every keystroke.
 */
export const IncomeExpenseChart = memo(IncomeExpenseChartBase);
export const NetCashChart = memo(NetCashChartBase);
export const CategoryDonut = memo(CategoryDonutBase);
export const TrendLineChart = memo(TrendLineChartBase);
export const ForecastChart = memo(ForecastChartBase);
export const CollectionsChart = memo(CollectionsChartBase);

export type { BreakdownSlice };
