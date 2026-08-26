import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BillsPage } from "@/components/pages/bills";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Bills | Aurelium Ledger" };

/** Matches the page's own footprint so the swap into real content does not jump. */
function Fallback() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-card" />
        ))}
      </div>
      <Skeleton className="h-[560px] w-full rounded-card" />
    </div>
  );
}

export default function Page() {
  return (
    <DashboardShell title="Bills" subtitle="Payables, vendors and the working-capital position">
      {/* useSearchParams needs a boundary so the shell can still render statically. */}
      <Suspense fallback={<Fallback />}>
        <BillsPage />
      </Suspense>
    </DashboardShell>
  );
}
