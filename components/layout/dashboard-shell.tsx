import { Sidebar } from "@/components/navigation/sidebar";
import { Topbar } from "@/components/navigation/topbar";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="mx-auto grid max-w-[1600px] items-start gap-4 lg:grid-cols-[264px,minmax(0,1fr)] xl:grid-cols-[280px,minmax(0,1fr)]">
        <Sidebar />
        <main className="min-w-0 space-y-4">
          <Topbar title={title} subtitle={subtitle} />
          <div className="space-y-4 pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
