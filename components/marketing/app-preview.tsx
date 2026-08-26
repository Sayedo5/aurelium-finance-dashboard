import { monthlySeries } from "@/lib/mock-data";
import { currentMonth, previousMonth, totalBalance, totalReceivable } from "@/lib/selectors";
import { formatCompactCurrency, percentChange } from "@/lib/utils";

/**
 * A scaled-down rendering of the real dashboard for the hero.
 *
 * It is drawn from the actual dataset rather than invented numbers, so the
 * preview and the product never disagree. Everything is CSS and inline SVG —
 * no screenshot to go stale, and nothing extra to download.
 */

const series = monthlySeries.slice(-8);
const WIDTH = 560;
const HEIGHT = 150;

function buildPath(values: number[], close: boolean) {
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.85;
  const span = max - min || 1;
  const step = WIDTH / (values.length - 1);

  const points = values.map((value, index) => {
    const x = index * step;
    const y = HEIGHT - ((value - min) / span) * HEIGHT;
    return [x, y] as const;
  });

  // Smooth with a midpoint quadratic so the line reads as a chart, not a zigzag.
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    const [prevX, prevY] = points[i - 1];
    const [x, y] = points[i];
    const midX = (prevX + x) / 2;
    path += ` Q ${prevX} ${prevY} ${midX} ${(prevY + y) / 2} T ${x} ${y}`;
  }

  if (close) path += ` L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
  return path;
}

const incomePath = buildPath(
  series.map((point) => point.income),
  false
);
const incomeArea = buildPath(
  series.map((point) => point.income),
  true
);
const expensePath = buildPath(
  series.map((point) => point.expenses),
  false
);

const tiles = [
  {
    label: "Total balance",
    value: formatCompactCurrency(totalBalance),
    delta: "+4.2%",
    good: true
  },
  {
    label: "Income",
    value: formatCompactCurrency(currentMonth.income),
    delta: `${percentChange(currentMonth.income, previousMonth.income) >= 0 ? "+" : ""}${percentChange(currentMonth.income, previousMonth.income).toFixed(1)}%`,
    good: percentChange(currentMonth.income, previousMonth.income) >= 0
  },
  {
    label: "Receivable",
    value: formatCompactCurrency(totalReceivable),
    delta: "32 days",
    good: true
  },
  {
    label: "Net cash",
    value: formatCompactCurrency(currentMonth.net),
    delta: `${percentChange(currentMonth.net, previousMonth.net) >= 0 ? "+" : ""}${percentChange(currentMonth.net, previousMonth.net).toFixed(1)}%`,
    good: percentChange(currentMonth.net, previousMonth.net) >= 0
  }
];

const rows = [
  { name: "Northbeam Logistics", meta: "Client revenue", amount: "+$54.7K", positive: true },
  { name: "Gusto Payroll", meta: "Payroll", amount: "−$61.4K", positive: false },
  { name: "Amazon Web Services", meta: "Software & SaaS", amount: "−$7.1K", positive: false },
  { name: "Cobalt Aerospace", meta: "Client revenue", amount: "+$37.4K", positive: true }
];

export function AppPreview() {
  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-panel border border-line bg-surface shadow-lift"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-surfaceMuted px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-loss-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-caution-300/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-gain-400/70" />
        <span className="ml-3 truncate rounded-pill bg-surface px-3 py-1 text-[10px] text-inkSubtle ring-1 ring-line">
          aurelium.io/dashboard
        </span>
      </div>

      <div className="flex">
        {/* Sidebar rail */}
        <div className="hidden w-36 shrink-0 flex-col gap-1 border-r border-line p-3 sm:flex">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-gradient-to-br from-aurum-300 to-aurum-500 text-[9px] font-bold text-aurum-950">
              A
            </span>
            <span className="text-[11px] font-semibold text-ink">Aurelium</span>
          </div>
          {["Dashboard", "Invoices", "Clients", "Bills", "Budgets", "Forecast", "Reports"].map(
            (label, index) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[10px] ${
                  index === 0 ? "bg-surfaceMuted font-medium text-ink" : "text-inkSubtle"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === 0 ? "bg-aurum-400" : "bg-lineStrong"
                  }`}
                />
                {label}
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded-[10px] border border-line bg-surface p-2.5">
                <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-inkSubtle">
                  {tile.label}
                </p>
                <p className="numeric mt-1 text-sm font-semibold text-ink">{tile.value}</p>
                <p
                  className={`numeric mt-0.5 text-[9px] font-semibold ${
                    tile.good ? "text-gain-600 dark:text-gain-400" : "text-loss-600 dark:text-loss-400"
                  }`}
                >
                  {tile.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)]">
            <div className="rounded-[10px] border border-line bg-surface p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-ink">Income vs. expenses</p>
                <span className="rounded-[4px] bg-surfaceMuted px-1.5 py-0.5 text-[8px] text-inkSubtle">
                  8M
                </span>
              </div>
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="mt-2 h-[86px] w-full sm:h-[110px]"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="preview-income" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--gain)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--gain)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((ratio) => (
                  <line
                    key={ratio}
                    x1={0}
                    x2={WIDTH}
                    y1={HEIGHT * ratio}
                    y2={HEIGHT * ratio}
                    stroke="var(--line)"
                    strokeWidth={1}
                  />
                ))}
                <path d={incomeArea} fill="url(#preview-income)" />
                <path d={incomePath} fill="none" stroke="var(--gain)" strokeWidth={2.5} />
                <path
                  d={expensePath}
                  fill="none"
                  stroke="var(--loss)"
                  strokeWidth={2.5}
                  strokeDasharray="6 5"
                  opacity={0.8}
                />
              </svg>
            </div>

            <div className="rounded-[10px] border border-line bg-surface p-3">
              <p className="text-[10px] font-semibold text-ink">Recent activity</p>
              <ul className="mt-2 space-y-2">
                {rows.map((row) => (
                  <li key={row.name} className="flex items-center gap-2">
                    <span className="h-5 w-0.5 shrink-0 rounded-full bg-aurum-400/60" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-medium text-ink">
                        {row.name}
                      </span>
                      <span className="block truncate text-[8px] text-inkSubtle">{row.meta}</span>
                    </span>
                    <span
                      className={`numeric shrink-0 text-[9px] font-semibold ${
                        row.positive
                          ? "text-gain-600 dark:text-gain-400"
                          : "text-inkMuted"
                      }`}
                    >
                      {row.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
