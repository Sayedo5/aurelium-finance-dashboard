import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { GoalsPage } from "@/components/pages/goals";

export const metadata: Metadata = { title: "Savings Goals | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Savings Goals" subtitle="Reserve targets and funding plans">
      <GoalsPage />
    </DashboardShell>
  );
}
