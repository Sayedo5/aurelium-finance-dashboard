import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ClientsPage } from "@/components/pages/clients";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Clients | Aurelium Ledger" };

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
    <DashboardShell title="Clients" subtitle="Directory, billings and outstanding balances">
      {/* useSearchParams needs a boundary so the shell can still render statically. */}
      <Suspense fallback={<Fallback />}>
        <ClientsPage />
      </Suspense>
    </DashboardShell>
  );
}
