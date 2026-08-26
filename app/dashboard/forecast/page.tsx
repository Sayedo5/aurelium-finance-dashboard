import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ForecastPage } from "@/components/pages/forecast";

export const metadata: Metadata = { title: "Forecast | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Forecast" subtitle="Twelve-month cashflow projection and runway">
      <ForecastPage />
    </DashboardShell>
  );
}
