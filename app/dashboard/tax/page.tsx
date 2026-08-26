import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TaxPage } from "@/components/pages/tax";

export const metadata: Metadata = { title: "Tax Centre | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Tax Centre" subtitle="Quarterly estimates, filings and set-aside">
      <TaxPage />
    </DashboardShell>
  );
}
