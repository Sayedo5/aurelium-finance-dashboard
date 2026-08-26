import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Compass,
  Eye,
  GitBranch,
  Landmark,
  Layers,
  MapPin,
  Ruler,
  Scale,
  Users
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, Badge, RoleBadge } from "@/components/ui/badge";
import {
  CallToAction,
  GoldRule,
  Section,
  SectionHeading,
  StatStrip
} from "@/components/marketing/sections";
import { company, roleMap, teamMembers } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About | Aurelium Ledger",
  description:
    "What Aurelium Ledger is, who it is for, the principles behind its design, and how the whole thing is built."
};

const values = [
  {
    icon: Eye,
    title: "Clarity over cleverness",
    description:
      "A finance tool earns trust by being boring in the right places. No hidden state, no surprising totals, no animation that competes with the number it is animating."
  },
  {
    icon: Scale,
    title: "Colour means something",
    description:
      "Green is money in. Red is money out. Gold is where to look. Nothing else gets to borrow those meanings, so a glance at a screen is never ambiguous."
  },
  {
    icon: Ruler,
    title: "One system, used everywhere",
    description:
      "Three radius tokens, one shadow ladder, one spacing rhythm. Every page draws from the same set, which is why sixteen modules still feel like one product."
  },
  {
    icon: Compass,
    title: "No dead ends",
    description:
      "Every button, filter and toggle does something visible. Empty states explain themselves and offer a way out. Errors say what happened without losing your place."
  }
];

const timeline = [
  {
    year: "2021",
    title: "Founded in Seattle",
    detail:
      "Started as an internal reporting tool for a services business that had outgrown spreadsheets but could not justify an ERP."
  },
  {
    year: "2022",
    title: "Ledger and accounts",
    detail:
      "The transaction ledger, multi-account balances and the first budget tracking shipped to a handful of design partners."
  },
  {
    year: "2023",
    title: "Receivables",
    detail:
      "Invoices, the client directory and A/R ageing arrived — the point at which the tool replaced a separate billing system."
  },
  {
    year: "2024",
    title: "Planning",
    detail:
      "Forecasting with scenario modelling, the tax centre and statutory reports closed the loop between what happened and what is next."
  },
  {
    year: "2025",
    title: "Governance",
    detail:
      "Roles, granular permissions and the audit log made the product viable for teams with auditors and a board."
  },
  {
    year: "2026",
    title: "Sixteen modules",
    detail:
      "The current build: receivables, payables, planning, reporting and governance under one navigation, in light or dark."
  }
];

const stack = [
  { label: "Next.js 14", detail: "App Router, every route statically prerendered" },
  { label: "TypeScript", detail: "Strict mode, no implicit any, no assertions in app code" },
  { label: "Tailwind CSS", detail: "CSS-variable theme tokens, one design system" },
  { label: "Recharts", detail: "Memoised chart wrappers with themed tooltips" },
  { label: "lucide-react", detail: "One icon set across navigation, KPIs and actions" },
  { label: "No backend", detail: "Deterministic local dataset — nothing leaves the browser" }
];

export default function AboutPage() {
  return (
    <>
      <Section className="pb-10 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="About"
          title="Built for the person who owns the numbers"
          description="Aurelium Ledger is a finance dashboard for a founder, finance lead or bookkeeper at a small-to-mid-size business — someone who has to answer “where did the money go this month?” without opening four bank tabs and a spreadsheet."
        />
      </Section>

      <Section className="py-8">
        <StatStrip
          items={[
            { value: "16", label: "Modules", detail: "All functional" },
            { value: "22", label: "Routes", detail: "Portal and dashboard" },
            { value: "7", label: "Dependencies", detail: "Nothing unused" },
            { value: "AA", label: "Contrast", detail: "Both themes" }
          ]}
        />
      </Section>

      <GoldRule />

      {/* Values */}
      <Section>
        <SectionHeading
          eyebrow="Principles"
          title="Four rules that decided every screen"
          align="left"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card key={value.title}>
                <span className="grid h-10 w-10 place-items-center rounded-control border border-line bg-surfaceMuted text-aurum-700 dark:text-aurum-400">
                  <Icon size={18} aria-hidden />
                </span>
                <h3 className="mt-4 text-[0.9375rem] font-semibold tracking-tight text-ink">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-inkMuted">{value.description}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Timeline */}
      <Section className="pt-0">
        <SectionHeading eyebrow="Story" title="How it got here" align="left" />
        <ol className="mt-8 relative border-l border-line pl-6">
          {timeline.map((entry) => (
            <li key={entry.year} className="relative pb-8 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[1.9rem] top-1 grid h-3 w-3 place-items-center rounded-full border-2 border-canvas bg-aurum-400"
              />
              <p className="numeric text-xs font-semibold uppercase tracking-wider text-aurum-700 dark:text-aurum-400">
                {entry.year}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{entry.title}</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-inkMuted">
                {entry.detail}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <GoldRule />

      {/* Team */}
      <Section>
        <SectionHeading
          eyebrow="The workspace"
          title="Who is in this account"
          description="The demo workspace is populated with a real-shaped finance team. Roles and permissions are enforced consistently across the app — you can inspect the whole matrix in the dashboard."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="text-center">
              <div className="flex justify-center">
                <Avatar initials={member.initials} size="lg" />
              </div>
              <p className="mt-3 truncate text-sm font-semibold text-ink">{member.name}</p>
              <p className="truncate text-xs text-inkMuted">{member.department}</p>
              <div className="mt-3 flex justify-center">
                <RoleBadge roleId={member.roleId} label={roleMap[member.roleId].label} />
              </div>
              <p className="mt-3 text-[11px] text-inkSubtle">
                Joined {formatDate(member.joinedOn)}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard/team"
            className="inline-flex items-center gap-2 text-sm font-medium text-aurum-700 transition hover:underline dark:text-aurum-400"
          >
            <Users size={15} aria-hidden />
            Inspect roles and permissions
          </Link>
        </div>
      </Section>

      <GoldRule />

      {/* Stack + company */}
      <Section>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <Card>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-aurum-700 dark:text-aurum-400" aria-hidden />
              <h3 className="text-[0.9375rem] font-semibold tracking-tight text-ink">
                How it is built
              </h3>
            </div>
            <dl className="mt-5 divide-y divide-line">
              {stack.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4 py-3">
                  <dt className="shrink-0 text-sm font-medium text-ink">{item.label}</dt>
                  <dd className="text-right text-sm text-inkMuted">{item.detail}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="good">Zero build warnings</Badge>
              <Badge tone="info">All routes static</Badge>
              <Badge tone="accent">No image assets</Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-aurum-700 dark:text-aurum-400" aria-hidden />
              <h3 className="text-[0.9375rem] font-semibold tracking-tight text-ink">
                The company
              </h3>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Legal name</dt>
                <dd className="text-right font-medium text-ink">{company.legalName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Founded</dt>
                <dd className="numeric text-right font-medium text-ink">{company.founded}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Headquarters</dt>
                <dd className="text-right font-medium text-ink">{company.headquarters}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Support</dt>
                <dd className="text-right font-medium text-ink">{company.supportEmail}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-start gap-2.5 rounded-control border border-line bg-surfaceMuted px-4 py-3">
              <MapPin size={15} className="mt-0.5 shrink-0 text-inkSubtle" aria-hidden />
              <p className="text-xs leading-relaxed text-inkMuted">{company.address}</p>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-control border border-aurum-400/30 bg-aurum-400/[0.07] px-4 py-3">
              <GitBranch size={15} className="mt-0.5 shrink-0 text-aurum-700 dark:text-aurum-400" aria-hidden />
              <p className="text-xs leading-relaxed text-inkMuted">
                <span className="font-medium text-ink">This is a portfolio demonstration.</span> The
                company, clients, staff and every figure are generated sample data. No real accounts
                are connected and nothing is transmitted anywhere.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      <Section className="pt-0">
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Landmark size={18} className="text-aurum-700 dark:text-aurum-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-ink">Want the technical detail?</p>
              <p className="mt-0.5 text-sm text-inkMuted">
                The features page lists every module and the engineering behind it.
              </p>
            </div>
          </div>
          <Link
            href="/features"
            className="text-sm font-medium text-aurum-700 transition hover:underline dark:text-aurum-400"
          >
            See all features
          </Link>
        </Card>
      </Section>

      <CallToAction
        title="Read about it, or just use it"
        description="Every module described here is live in the demo, populated with a full year of data."
        secondaryHref="/contact"
        secondaryLabel="Contact us"
      />
    </>
  );
}
