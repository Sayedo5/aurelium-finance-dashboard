"use client";

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
import type { MonthlyPoint } from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "currentColor", fontSize: 12 },
  className: "text-inkMuted"
} as const;

const gridStroke = "rgba(148,163,184,0.18)";

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
  valueFormatter = formatCurrency
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  valueFormatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-line bg-panel px-3 py-2.5 shadow-luxe backdrop-blur-xl">
      {label ? <p className="mb-1.5 text-xs font-semibold text-inkMuted">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-inkMuted">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums">
              {valueFormatter(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Income vs expense, the headline chart on the overview. */
export function IncomeExpenseChart({ data, height = 300 }: { data: MonthlyPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1fb36a" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#1fb36a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={64} tickFormatter={formatCompactCurrency} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: gridStroke, strokeWidth: 2 }} />
        <Legend
          verticalAlign="top"
          height={32}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Area
          type="monotone"
          name="Income"
          dataKey="income"
          stroke="#1fb36a"
          fill="url(#incomeFill)"
          strokeWidth={2.5}
          animationDuration={900}
        />
        <Area
          type="monotone"
          name="Expenses"
          dataKey="expenses"
          stroke="#f43f5e"
          fill="url(#expenseFill)"
          strokeWidth={2.5}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Net cash per month; green above the line, red below it. */
export function NetCashChart({ data, height = 260 }: { data: MonthlyPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={64} tickFormatter={formatCompactCurrency} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.10)" }} />
        <Bar dataKey="net" name="Net cash" radius={[8, 8, 0, 0]} animationDuration={900}>
          {data.map((entry) => (
            <Cell key={entry.month} fill={entry.net >= 0 ? "#1fb36a" : "#f43f5e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface BreakdownSlice {
  name: string;
  value: number;
  color: string;
}

export function CategoryDonut({ data, height = 280 }: { data: BreakdownSlice[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="86%"
          paddingAngle={3}
          animationDuration={900}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({
  data,
  height = 260
}: {
  data: MonthlyPoint[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={64} tickFormatter={formatCompactCurrency} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: gridStroke, strokeWidth: 2 }} />
        <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#1fb36a"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          animationDuration={900}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#f43f5e"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          animationDuration={900}
        />
        <Line
          type="monotone"
          dataKey="net"
          name="Net"
          stroke="#367dff"
          strokeWidth={2.5}
          strokeDasharray="5 4"
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
