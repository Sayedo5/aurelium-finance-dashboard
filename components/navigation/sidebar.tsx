"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LifeBuoy, X } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { Logo } from "@/components/navigation/logo";
import { navigation, company } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppContext();

  // Close the drawer on navigation and on Escape.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {sidebarOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-line bg-panel p-5 shadow-luxe backdrop-blur-xl transition-transform duration-300 ease-out",
          "lg:sticky lg:top-4 lg:z-auto lg:h-[calc(100vh-2rem)] lg:w-full lg:max-w-none lg:translate-x-0 lg:rounded-[28px] lg:border lg:shadow-soft",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            className="rounded-full p-2 text-inkMuted transition hover:bg-slate-900/5 lg:hidden dark:hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.22em] text-inkMuted">
            Workspace
          </p>
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition duration-200",
                  active
                    ? "bg-ink text-white shadow-soft dark:bg-white dark:text-slate-950"
                    : "text-inkMuted hover:translate-x-0.5 hover:bg-white/70 hover:text-ink dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-line bg-gradient-to-br from-brand-500/10 to-accent-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <LifeBuoy size={16} className="text-brand-600 dark:text-brand-300" />
            Close the books
          </div>
          <p className="mt-2 text-xs leading-relaxed text-inkMuted">
            July reconciliation is 94% matched. Three card charges still need receipts.
          </p>
          <button className="mt-3 w-full rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
            Review 3 items
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">
            {company.owner.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{company.owner.name}</p>
            <p className="truncate text-xs text-inkMuted">{company.owner.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
