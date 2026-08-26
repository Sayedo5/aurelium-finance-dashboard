import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SettingsPage } from "@/components/pages/settings";

export const metadata: Metadata = { title: "Settings | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Settings" subtitle="Profile, preferences, notifications and security">
      <SettingsPage />
    </DashboardShell>
  );
}
