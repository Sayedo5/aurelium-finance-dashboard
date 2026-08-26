import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AuditPage } from "@/components/pages/audit";

export const metadata: Metadata = { title: "Audit Log | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Audit Log" subtitle="Who changed what, when, and from where">
      <AuditPage />
    </DashboardShell>
  );
}
