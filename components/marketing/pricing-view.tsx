"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/field";
import { CallToAction, GoldRule, Section, SectionHeading } from "@/components/marketing/sections";
import { cn, formatCurrency } from "@/lib/utils";

type Cycle = "monthly" | "annual";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  /** Annual price per month — the discount is real, not decorative. */
  annual: number;
  seats: string;
  featured?: boolean;
  highlights: string[];
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For a founder doing the books themselves.",
    monthly: 39,
    annual: 31,
    seats: "Up to 3 seats",
    highlights: [
      "Dashboard, transactions and accounts",
      "Up to 2 connected accounts",
      "Budgets and savings goals",
      "CSV export",
      "Email support"
    ]
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For a finance lead running a real book of business.",
    monthly: 119,
    annual: 95,
    seats: "Up to 15 seats",
    featured: true,
    highlights: [
      "Everything in Starter",
      "Invoices, clients, bills and vendors",
      "Financial reports and forecasting",
      "Tax centre and financial calendar",
      "Roles, permissions and audit log",
      "Priority support"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For a group with departments, approvals and auditors.",
    monthly: 349,
    annual: 279,
    seats: "Unlimited seats",
    highlights: [
      "Everything in Growth",
      "Multi-entity consolidation",
      "Custom approval workflows",
      "SSO/SAML and SCIM provisioning",
      "Dedicated success manager",
      "99.9% uptime commitment"
    ]
  }
];

type Availability = boolean | string;

const comparison: Array<{
  section: string;
  rows: Array<{ label: string; starter: Availability; growth: Availability; enterprise: Availability }>;
}> = [
  {
    section: "Core",
    rows: [
      { label: "Dashboard & analytics", starter: true, growth: true, enterprise: true },
      { label: "Transaction ledger", starter: true, growth: true, enterprise: true },
      { label: "Connected accounts", starter: "2", growth: "10", enterprise: "Unlimited" },
      { label: "History retained", starter: "12 months", growth: "5 years", enterprise: "Unlimited" },
      { label: "CSV export", starter: true, growth: true, enterprise: true }
    ]
  },
  {
    section: "Receivables & payables",
    rows: [
      { label: "Invoices & A/R ageing", starter: false, growth: true, enterprise: true },
      { label: "Client directory", starter: false, growth: true, enterprise: true },
      { label: "Bills & vendor book", starter: false, growth: true, enterprise: true },
      { label: "Payment approvals", starter: false, growth: false, enterprise: true }
    ]
  },
  {
    section: "Planning & reporting",
    rows: [
      { label: "Budgets & savings goals", starter: true, growth: true, enterprise: true },
      { label: "P&L, balance sheet, cashflow", starter: false, growth: true, enterprise: true },
      { label: "Cashflow forecasting", starter: false, growth: true, enterprise: true },
      { label: "Tax centre", starter: false, growth: true, enterprise: true },
      { label: "Multi-entity consolidation", starter: false, growth: false, enterprise: true }
    ]
  },
  {
    section: "Governance",
    rows: [
      { label: "Roles & permissions", starter: "Owner only", growth: "5 roles", enterprise: "Custom roles" },
      { label: "Audit log", starter: false, growth: true, enterprise: true },
      { label: "SSO / SAML", starter: false, growth: false, enterprise: true },
      { label: "Support", starter: "Email", growth: "Priority", enterprise: "Dedicated CSM" }
    ]
  }
];

const faqs = [
  {
    question: "Is this a real product I can buy?",
    answer:
      "No. Aurelium Ledger is a portfolio demonstration. The pricing below shows how a tiered plan page would be built and behaves exactly as a real one would, but there is no checkout and no payment is ever taken."
  },
  {
    question: "Where does the data come from?",
    answer:
      "It is generated locally and deterministically — roughly 600 transactions, 60 invoices, 40 bills and 40 clients derived from handwritten seeds. There is no backend and nothing leaves your browser."
  },
  {
    question: "Can I see every feature without signing up?",
    answer:
      "Yes. The dashboard opens directly with no account and no install. The sign-in page is a demonstration of the flow; it does not gate anything."
  },
  {
    question: "Does the annual discount actually change the numbers?",
    answer:
      "It does. Switching the billing toggle recomputes the monthly figure and shows the annual total, so you can check the arithmetic against the per-month price."
  },
  {
    question: "What happens to my preferences?",
    answer:
      "Theme, display currency, date format and row density are stored in your browser's local storage. Nothing is transmitted anywhere."
  }
];

function Availability({ value }: { value: Availability }) {
  if (value === true) {
    return (
      <>
        <Check size={16} className="mx-auto text-gain-600 dark:text-gain-400" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus size={16} className="mx-auto text-inkSubtle" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm text-ink">{value}</span>;
}

export function PricingView() {
  const [cycle, setCycle] = useState<Cycle>("annual");
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0].question);

  return (
    <>
      <Section className="pb-10 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Pricing"
          title="One price per workspace, not per report"
          description="Every tier includes the full dashboard. What changes is how much of the receivables, planning and governance stack comes with it."
        />

        <div className="mt-8 flex flex-col items-center gap-3">
          <SegmentedControl
            label="Billing cycle"
            options={[
              { id: "monthly", label: "Monthly" },
              { id: "annual", label: "Annual" }
            ]}
            value={cycle}
            onChange={setCycle}
          />
          <p className="text-xs text-inkMuted">
            {cycle === "annual" ? (
              <>
                Billed yearly — <span className="font-medium text-gain-600 dark:text-gain-400">save
                20%</span>
              </>
            ) : (
              "Billed month to month, cancel any time"
            )}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => {
            const price = cycle === "annual" ? tier.annual : tier.monthly;
            return (
              <div
                key={tier.id}
                className={cn(
                  "relative flex flex-col rounded-card border bg-surface p-6 shadow-card transition duration-200 ease-smooth hover:shadow-lift",
                  tier.featured
                    ? "border-aurum-400/50 ring-1 ring-aurum-400/30 lg:-mt-3 lg:mb-3"
                    : "border-line"
                )}
              >
                {tier.featured ? (
                  <span className="absolute -top-3 left-6">
                    <Badge tone="accent">Most popular</Badge>
                  </span>
                ) : null}

                <h3 className="text-base font-semibold tracking-tight text-ink">{tier.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-inkMuted">{tier.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="numeric text-metricLg font-semibold text-ink">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-sm text-inkMuted">/ month</span>
                </div>
                <p className="mt-1.5 text-xs text-inkMuted">
                  {cycle === "annual"
                    ? `${formatCurrency(price * 12)} billed yearly · ${tier.seats}`
                    : `${tier.seats} · no commitment`}
                </p>

                <Link href="/dashboard" className="mt-6 block">
                  <Button
                    variant={tier.featured ? "accent" : "secondary"}
                    className="w-full"
                    iconRight={ArrowRight}
                  >
                    Open the demo
                  </Button>
                </Link>

                <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
                  {tier.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={15}
                        aria-hidden
                        className="mt-0.5 shrink-0 text-gain-600 dark:text-gain-400"
                      />
                      <span className="leading-relaxed text-inkMuted">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <GoldRule />

      {/* Comparison */}
      <Section>
        <SectionHeading
          eyebrow="Compare"
          title="Every difference between the tiers"
          align="left"
        />

        <div className="mt-8 overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Feature comparison across the three pricing tiers</caption>
            <thead>
              <tr className="border-b border-line bg-surfaceMuted/60">
                <th scope="col" className="px-4 py-3 text-label font-semibold uppercase text-inkMuted">
                  Feature
                </th>
                {tiers.map((tier) => (
                  <th
                    key={tier.id}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-center text-sm font-semibold",
                      tier.featured ? "text-aurum-700 dark:text-aurum-400" : "text-ink"
                    )}
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((group) => (
                <Fragment key={group.section}>
                  <tr className="bg-surfaceMuted/40">
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="px-4 py-2 text-left text-label font-semibold uppercase text-inkMuted"
                    >
                      {group.section}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-b border-line last:border-0">
                      <th scope="row" className="px-4 py-3 text-left font-normal text-inkMuted">
                        {row.label}
                      </th>
                      <td className="px-4 py-3 text-center">
                        <Availability value={row.starter} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Availability value={row.growth} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Availability value={row.enterprise} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <SectionHeading eyebrow="Questions" title="Before you click around" align="left" />

        <div className="mt-8 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {faqs.map((faq) => {
            const open = openFaq === faq.question;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : faq.question)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surfaceMuted"
                >
                  <span className="text-sm font-medium text-ink">{faq.question}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-inkMuted transition-transform duration-200 ease-smooth",
                      open && "rotate-45"
                    )}
                  >
                    <span className="text-base leading-none">+</span>
                  </span>
                </button>
                {open ? (
                  <p className="animate-rise px-5 pb-5 text-sm leading-relaxed text-inkMuted">
                    {faq.answer}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>

      <CallToAction
        title="No checkout, no catch"
        description="This is a demonstration build. Open the dashboard and every tier's features are already unlocked."
        secondaryHref="/contact"
        secondaryLabel="Get in touch"
      />
    </>
  );
}
