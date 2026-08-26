import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AnalyticsPage } from "@/components/pages/analytics";

export const metadata: Metadata = { title: "Analytics | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Analytics" subtitle="Cashflow trends, category spend and top merchants">
      <AnalyticsPage />
    </DashboardShell>
  );
}
