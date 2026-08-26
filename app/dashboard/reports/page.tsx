import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportsPage } from "@/components/pages/reports";

export const metadata: Metadata = { title: "Reports | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Reports" subtitle="Profit and loss, balance sheet and cashflow">
      <ReportsPage />
    </DashboardShell>
  );
}
