import type { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { Topbar } from "@/components/navigation/topbar";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  /** Page-level actions rendered into the topbar, e.g. an export button. */
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardShell({ title, subtitle, actions, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      {/* Single column below lg (sidebar becomes a drawer), two columns above. */}
      <div className="mx-auto grid max-w-[1600px] items-start gap-4 lg:grid-cols-[248px,minmax(0,1fr)] xl:grid-cols-[264px,minmax(0,1fr)]">
        <Sidebar />
        <main id="main" className="min-w-0 space-y-4">
          <Topbar title={title} subtitle={subtitle} actions={actions} />
          <div className="space-y-4 pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
