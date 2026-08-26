import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/navigation/logo";
import { company } from "@/lib/mock-data";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Reports", href: "/dashboard/reports" },
      { label: "Forecasting", href: "/dashboard/forecast" }
    ]
  },
  {
    title: "Modules",
    links: [
      { label: "Invoices", href: "/dashboard/invoices" },
      { label: "Clients", href: "/dashboard/clients" },
      { label: "Bills & vendors", href: "/dashboard/bills" },
      { label: "Budgets", href: "/dashboard/budgets" },
      { label: "Tax centre", href: "/dashboard/tax" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Team & roles", href: "/dashboard/team" },
      { label: "Audit log", href: "/dashboard/audit" }
    ]
  }
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-surfaceMuted/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr),repeat(3,minmax(0,1fr))]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-inkMuted">
              {company.tagline}. One place for balances, receivables, payables, budgets and the
              forecast — built for the person who owns the numbers.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-inkMuted">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-inkSubtle" aria-hidden />
                {company.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-inkSubtle" aria-hidden />
                <a href={`mailto:${company.supportEmail}`} className="transition hover:text-ink">
                  {company.supportEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-inkSubtle" aria-hidden />
                {company.phone}
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="eyebrow">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-inkMuted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-inkSubtle">
            © {company.founded}–2026 {company.legalName}. All rights reserved.
          </p>
          <p className="text-xs text-inkSubtle">
            A portfolio demonstration — all figures are generated sample data, not real accounts.
          </p>
        </div>
      </div>
    </footer>
  );
}
