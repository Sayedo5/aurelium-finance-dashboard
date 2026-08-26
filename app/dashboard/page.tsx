import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OverviewPage } from "@/components/pages/overview";

export const metadata: Metadata = { title: "Dashboard | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Dashboard" subtitle="Cash position for July 2026">
      <OverviewPage />
    </DashboardShell>
  );
}
