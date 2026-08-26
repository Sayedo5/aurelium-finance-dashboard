import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BudgetsPage } from "@/components/pages/budgets";

export const metadata: Metadata = { title: "Budgets | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Budgets" subtitle="Track spend against monthly allocations">
      <BudgetsPage />
    </DashboardShell>
  );
}
