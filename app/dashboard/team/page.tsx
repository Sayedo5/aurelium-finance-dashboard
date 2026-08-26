import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeamPage } from "@/components/pages/team";

export const metadata: Metadata = { title: "Team & Roles | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Team & Roles" subtitle="Members, roles and the permission matrix">
      <TeamPage />
    </DashboardShell>
  );
}
