import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TransactionsPage } from "@/components/pages/transactions";

export const metadata: Metadata = { title: "Transactions | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Transactions" subtitle="Search, filter and export the full ledger">
      <TransactionsPage />
    </DashboardShell>
  );
}
