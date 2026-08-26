import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BudgetsPage } from "@/components/pages/budgets";

export const metadata: Metadata = { title: "Budgets | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Budgets" subtitle="July 2026 allocations and spend to date">
      <BudgetsPage />
    </DashboardShell>
  );
}
