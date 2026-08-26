import type { Metadata } from "next";
import {
  Accessibility,
  Banknote,
  CalendarDays,
  ChartPie,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  KeyRound,
  Landmark,
  Layers,
  Moon,
  Receipt,
  ScrollText,
  Search,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingUp,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import {
  CallToAction,
  GoldRule,
  Section,
  SectionHeading
} from "@/components/marketing/sections";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features | Aurelium Ledger",
  description:
    "A full breakdown of every module in Aurelium Ledger — receivables, payables, budgets, forecasting, reporting, tax, governance and the craft underneath."
};

const groups = [
  {
    title: "Money in",
    summary: "Get paid, and know exactly who has not paid you.",
    items: [
      {
        icon: FileText,
        title: "Invoices",
        href: "/dashboard/invoices",
        points: [
          "Line-item invoices with quantity, unit price and tax rate",
          "Five states: draft, sent, paid, overdue and void",
          "A/R ageing across current, 1–30, 31–60, 61–90 and 90+ day buckets",
          "Days-sales-outstanding calculated from real settlement dates",
          "Detail panel with the full line breakdown and payment history"
        ]
      },
      {
        icon: Users,
        title: "Clients",
        href: "/dashboard/clients",
        points: [
          "Forty accounts with contacts, industry, country and net terms",
          "Lifetime billings and outstanding balance per client",
          "Active, prospect and churned states with owner assignment",
          "Filter by status, industry and account manager",
          "Client drawer showing every invoice raised against them"
        ]
      }
    ]
  },
  {
    title: "Money out",
    summary: "See what is scheduled, what has slipped, and where it goes.",
    items: [
      {
        icon: Truck,
        title: "Bills & vendors",
        href: "/dashboard/bills",
        points: [
          "Vendor book of forty suppliers mapped to spend categories",
          "Draft, scheduled, paid and overdue bill states",
          "Recurring bills flagged and excluded from one-off analysis",
          "Working-capital position: receivable minus payable",
          "Vendor spend ranking with outstanding balances"
        ]
      },
      {
        icon: Receipt,
        title: "Transaction ledger",
        href: "/dashboard/transactions",
        points: [
          "Around 600 transactions across twelve months and five accounts",
          "Debounced search over merchant, memo, ID and category",
          "Seven filters including an inclusive from/to month range",
          "Sortable by date, merchant or signed amount",
          "CSV export of exactly what is on screen, in the current sort order"
        ]
      },
      {
        icon: Wallet,
        title: "Accounts",
        href: "/dashboard/accounts",
        points: [
          "Checking, payroll clearing, tax reserve, savings and a credit line",
          "Credit utilisation bar against the limit",
          "Per-account statement export",
          "Monthly inflow, outflow and net for the selected account"
        ]
      }
    ]
  },
  {
    title: "Planning",
    summary: "Decide what happens next, with the assumptions in the open.",
    items: [
      {
        icon: Banknote,
        title: "Budgets",
        href: "/dashboard/budgets",
        points: [
          "Ten category budgets with owner and period",
          "On track, near limit (90%) and over-budget states",
          "Reconciliation against actual ledger spend, not a static figure",
          "Create and edit through a validated modal with a category picker"
        ]
      },
      {
        icon: TrendingUp,
        title: "Forecast",
        href: "/dashboard/forecast",
        points: [
          "Twelve months projected from the trailing three-month average",
          "Conservative, base and aggressive scenarios",
          "Runway in months and the break-even month, both stated",
          "Actuals and projection on one continuous axis, projection dashed",
          "Adjustable growth assumptions that recompute live"
        ]
      },
      {
        icon: FileSpreadsheet,
        title: "Reports",
        href: "/dashboard/reports",
        points: [
          "Profit & loss with cost-of-revenue split",
          "Balance sheet with assets, liabilities and equity",
          "Indirect cashflow statement across operating, investing and financing",
          "Period comparison with variance column",
          "CSV export for every statement"
        ]
      },
      {
        icon: Landmark,
        title: "Tax centre",
        href: "/dashboard/tax",
        points: [
          "Five quarterly periods with filed, due and upcoming states",
          "Estimated liability against amount paid, and the shortfall",
          "Set-aside guidance based on income to date",
          "Effective rate applied consistently across the estimate"
        ]
      },
      {
        icon: Target,
        title: "Savings goals",
        href: "/dashboard/goals",
        points: [
          "Reserve targets with animated funding rings",
          "Months-remaining computed from the monthly contribution",
          "Contributions apply immediately and cap at the target"
        ]
      },
      {
        icon: CalendarDays,
        title: "Financial calendar",
        href: "/dashboard/calendar",
        points: [
          "Month grid built from real bills, invoices, payroll and tax dates",
          "Kind filter across bills, invoices, payroll, tax and reviews",
          "Day detail panel listing everything falling on that date",
          "Never disagrees with the payables and receivables pages"
        ]
      }
    ]
  },
  {
    title: "Governance",
    summary: "Know who can do what, and what they did.",
    items: [
      {
        icon: ShieldCheck,
        title: "Team & roles",
        href: "/dashboard/team",
        points: [
          "Five roles: owner, admin, accountant, analyst and viewer",
          "Ten granular permissions shown as a live matrix",
          "Active, invited and suspended member states",
          "Role changes update the matrix immediately"
        ]
      },
      {
        icon: ScrollText,
        title: "Audit log",
        href: "/dashboard/audit",
        points: [
          "Eighty events across the trailing three weeks",
          "Filter by actor, action, target and severity",
          "Critical events called out distinctly from routine activity",
          "Actor, timestamp and source IP on every entry"
        ]
      }
    ]
  }
];

const craft = [
  {
    icon: Search,
    title: "Global search",
    description:
      "⌘K from anywhere. Searches invoices, clients, vendors, bills, transactions and accounts, fully keyboard-navigable, deep-linking into the right module with the query pre-applied."
  },
  {
    icon: Download,
    title: "Real CSV export",
    description:
      "Every export builds an RFC 4180 file in the browser and downloads it. If the browser blocks it, the app says so rather than claiming a success that never happened."
  },
  {
    icon: Moon,
    title: "Light and dark",
    description:
      "A theme script runs before first paint, so a reload never flashes the wrong palette. Both themes are defined as one set of CSS variables."
  },
  {
    icon: Smartphone,
    title: "Genuinely responsive",
    description:
      "Below 768px every table becomes stacked cards rather than a sideways scroll. The sidebar becomes a focus-managed drawer with scroll lock."
  },
  {
    icon: Accessibility,
    title: "Accessible",
    description:
      "Skip link, focus traps in dialogs and drawers, aria-sort on sortable columns, visible focus rings, WCAG AA contrast in both themes, and reduced-motion support."
  },
  {
    icon: Gauge,
    title: "Fast",
    description:
      "Every route statically prerendered. Charts and stat cards memoised, aggregations cached, search debounced. No layout shift on load."
  },
  {
    icon: Filter,
    title: "Nothing decorative",
    description:
      "Every button, tab, filter and dropdown produces visible behaviour against the data. There are no dead clicks anywhere in the application."
  },
  {
    icon: Layers,
    title: "One design system",
    description:
      "Three radius tokens, a four-step shadow ladder, one spacing rhythm and one type scale — all declared once and used everywhere."
  },
  {
    icon: KeyRound,
    title: "Deterministic data",
    description:
      "No Math.random, no Date.now. Server and client render byte-identical output, so hydration never mismatches and figures never drift."
  }
];

export default function FeaturesPage() {
  return (
    <>
      <Section className="pb-8 pt-16 sm:pb-10 sm:pt-20">
        <SectionHeading
          eyebrow="Features"
          title="What is actually in the box"
          description="Sixteen modules, all functional against a shared dataset of roughly 600 transactions, 60 invoices, 40 bills and 40 clients. Nothing below is a mock-up."
        />
      </Section>

      {groups.map((group) => (
        <Section key={group.title} className="py-8 sm:py-10">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{group.title}</h2>
            <p className="text-sm text-inkMuted">{group.summary}</p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-line bg-surfaceMuted text-aurum-700 dark:text-aurum-400">
                        <Icon size={18} aria-hidden />
                      </span>
                      <h3 className="text-[0.9375rem] font-semibold tracking-tight text-ink">
                        {item.title}
                      </h3>
                    </div>
                    <Link
                      href={item.href}
                      className="shrink-0 text-xs font-medium text-aurum-700 transition hover:underline dark:text-aurum-400"
                    >
                      Open
                    </Link>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-inkMuted">
                        <span
                          aria-hidden
                          className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-aurum-400"
                        />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </Section>
      ))}

      <GoldRule />

      <Section>
        <SectionHeading
          eyebrow="Under the hood"
          title="The craft that does not show up in a screenshot"
          description="These are the parts that decide whether a dashboard is pleasant to use every day or merely pleasant to look at once."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {craft.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-card border border-line bg-surface p-5">
                <span className="grid h-9 w-9 place-items-center rounded-control border border-line bg-surfaceMuted text-aurum-700 dark:text-aurum-400">
                  <Icon size={16} aria-hidden />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-inkMuted">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="pt-0">
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ChartPie size={16} className="text-aurum-700 dark:text-aurum-400" aria-hidden />
              <h3 className="text-sm font-semibold text-ink">Built with</h3>
            </div>
            <p className="mt-1.5 text-sm text-inkMuted">
              Next.js 14 App Router · TypeScript strict · Tailwind CSS · Recharts · lucide-react
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">7 dependencies</Badge>
            <Badge tone="good">Zero build warnings</Badge>
            <Badge tone="info">All routes static</Badge>
          </div>
        </Card>
      </Section>

      <CallToAction
        title="Best seen by clicking around"
        description="Open any module and try to find a control that does nothing. Every filter, sort, toggle and export is wired to the data."
        secondaryHref="/pricing"
        secondaryLabel="See pricing"
      />
    </>
  );
}
