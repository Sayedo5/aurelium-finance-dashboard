import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AccountsPage } from "@/components/pages/accounts";

export const metadata: Metadata = { title: "Accounts | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Accounts" subtitle="Balances and activity across every account">
      <AccountsPage />
    </DashboardShell>
  );
}
