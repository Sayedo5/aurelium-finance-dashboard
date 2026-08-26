import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CalendarPage } from "@/components/pages/calendar";

export const metadata: Metadata = { title: "Calendar | Aurelium Ledger" };

export default function Page() {
  return (
    <DashboardShell title="Calendar" subtitle="Bills, invoices, payroll and filing deadlines">
      <CalendarPage />
    </DashboardShell>
  );
}
