import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  ChartPie,
  FileSpreadsheet,
  FileText,
  Landmark,
  Moon,
  Receipt,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppPreview } from "@/components/marketing/app-preview";
import {
  CallToAction,
  FeatureCard,
  GoldRule,
  Section,
  SectionHeading,
  StatStrip
} from "@/components/marketing/sections";
import { bills, clients, invoices, transactions } from "@/lib/mock-data";
import { daysSalesOutstanding, totalReceivable } from "@/lib/selectors";
import { formatCompactCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Aurelium Ledger — Business Finance Dashboard",
  description:
    "Balances, receivables, payables, budgets, forecasting and reporting in one calm, fast dashboard built for the person who owns the numbers."
};

const modules = [
  {
    icon: ChartPie,
    title: "Dashboard & analytics",
    description:
      "Balances, cashflow, category spend and top merchants, with month-over-month deltas coloured by whether the movement is good — not merely up.",
    href: "/dashboard"
  },
  {
    icon: FileText,
    title: "Invoices & receivables",
    description:
      "Draft, send and settle invoices with line items and tax. A full A/R ageing report shows exactly what is late and by how long.",
    href: "/dashboard/invoices"
  },
  {
    icon: Users,
    title: "Client directory",
    description:
      "Every client with contacts, terms, lifetime billings and outstanding balance — ranked so the accounts that matter surface first.",
    href: "/dashboard/clients"
  },
  {
    icon: Truck,
    title: "Bills & vendors",
    description:
      "The payables side: scheduled, overdue and recurring bills against a vendor book, with the working-capital position at the top.",
    href: "/dashboard/bills"
  },
  {
    icon: Receipt,
    title: "Transaction ledger",
    description:
      "A year of transactions with debounced search, seven filters, sortable columns and a CSV export that respects every filter.",
    href: "/dashboard/transactions"
  },
  {
    icon: Wallet,
    title: "Accounts",
    description:
      "Checking, payroll, reserve, savings and a credit line with utilisation. Pick an account to drive its statement and monthly flow.",
    href: "/dashboard/accounts"
  },
  {
    icon: Banknote,
    title: "Budgets",
    description:
      "Category allocations with on-track, near-limit and over states, reconciled against actual ledger spend rather than a static number.",
    href: "/dashboard/budgets"
  },
  {
    icon: TrendingUp,
    title: "Cashflow forecasting",
    description:
      "Project twelve months forward across three scenarios, with runway, break-even month and the assumptions stated on screen.",
    href: "/dashboard/forecast"
  },
  {
    icon: FileSpreadsheet,
    title: "Financial reports",
    description:
      "Profit & loss, balance sheet and an indirect cashflow statement, each with period comparison and one-click CSV export.",
    href: "/dashboard/reports"
  },
  {
    icon: Landmark,
    title: "Tax centre",
    description:
      "Quarterly estimates, what has been filed, what is underpaid, and how much to set aside based on income to date.",
    href: "/dashboard/tax"
  },
  {
    icon: Target,
    title: "Savings goals",
    description:
      "Reserve targets with funding plans, months-remaining maths and contributions that apply immediately.",
    href: "/dashboard/goals"
  },
  {
    icon: CalendarDays,
    title: "Financial calendar",
    description:
      "Every bill, invoice, payroll run, tax deadline and close review on one month grid — built from the real records, never a separate list.",
    href: "/dashboard/calendar"
  },
  {
    icon: ShieldCheck,
    title: "Team & permissions",
    description:
      "Five roles across ten permissions, shown as a live matrix so who-can-do-what is a fact you can read, not a promise.",
    href: "/dashboard/team"
  },
  {
    icon: ScrollText,
    title: "Audit log",
    description:
      "Who changed what, when, and from where — filterable by actor, action and severity, with critical events called out.",
    href: "/dashboard/audit"
  }
];

const principles = [
  {
    icon: Sparkles,
    title: "Calm by default",
    description:
      "Gold marks what matters. Green and red mean exactly one thing each — money in, money out — and are never spent on ordinary UI chrome."
  },
  {
    icon: Moon,
    title: "Built for late nights",
    description:
      "A true dark theme, applied before first paint so a reload never flashes white. The choice persists across sessions."
  },
  {
    icon: ShieldCheck,
    title: "Legible under pressure",
    description:
      "Tabular figures so every column aligns, WCAG AA contrast in both themes, full keyboard navigation, and reduced-motion support."
  }
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-aurum-400/[0.08] blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-pill border border-aurum-400/30 bg-aurum-400/[0.08] px-3 py-1 text-xs font-medium text-aurum-800 dark:text-aurum-300">
              <Sparkles size={13} aria-hidden />
              Sixteen modules · a full year of sample data
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Every number your business runs on,{" "}
              <span className="bg-gradient-to-r from-aurum-500 to-aurum-300 bg-clip-text text-transparent">
                in one calm place
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-inkMuted sm:text-lg">
              Aurelium Ledger brings balances, receivables, payables, budgets, forecasting and
              statutory reporting into a single dashboard — fast, accessible, and quiet enough to
              read at midnight.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard">
                {/* The icon is rendered here rather than passed as `iconRight`:
                    a component reference cannot cross the server/client boundary. */}
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Open the dashboard
                  <ArrowRight size={16} aria-hidden />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Tour the features
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-inkSubtle">
              No sign-up, no install — the demo opens straight into live sample data.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl">
            <AppPreview />
          </div>
        </div>
      </section>

      <GoldRule />

      {/* Proof */}
      <Section className="py-12 sm:py-14">
        <StatStrip
          items={[
            {
              value: transactions.length.toLocaleString("en-US"),
              label: "Transactions",
              detail: "12 months, 5 accounts"
            },
            {
              value: `${invoices.length} / ${bills.length}`,
              label: "Invoices & bills",
              detail: "Full A/R and A/P books"
            },
            {
              value: formatCompactCurrency(totalReceivable),
              label: "Receivable",
              detail: `${daysSalesOutstanding} day average collection`
            },
            {
              value: String(clients.length),
              label: "Clients tracked",
              detail: "With terms and lifetime value"
            }
          ]}
        />
      </Section>

      {/* Modules */}
      <Section id="modules">
        <SectionHeading
          eyebrow="Everything included"
          title="Sixteen modules, all of them working"
          description="This is not a set of static screens. Every filter filters, every sort sorts, every export downloads a real file, and every figure is derived from the same underlying ledger."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <FeatureCard key={module.title} {...module} />
          ))}
        </div>
      </Section>

      <GoldRule />

      {/* Principles */}
      <Section>
        <SectionHeading
          eyebrow="Design principles"
          title="Finance software should feel trustworthy"
          description="Three rules shaped every screen — and they are the reason the interface stays quiet while the numbers do the talking."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <FeatureCard key={principle.title} {...principle} />
          ))}
        </div>
      </Section>

      <CallToAction />
    </>
  );
}
