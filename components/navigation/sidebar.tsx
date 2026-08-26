"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowUpRight, FileCheck2, X } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { Logo } from "@/components/navigation/logo";
import { Avatar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navigation, company } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, addToast } = useAppContext();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close the drawer on navigation.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // While open on mobile the drawer is modal: Escape closes it, focus moves in,
  // and the page behind it must not scroll.
  useEffect(() => {
    if (!sidebarOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {sidebarOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-40 animate-fade bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-line bg-surface transition-transform duration-300 ease-smooth",
          "lg:sticky lg:top-4 lg:z-auto lg:h-[calc(100vh-2rem)] lg:w-full lg:max-w-none lg:translate-x-0 lg:rounded-card lg:border lg:shadow-card",
          sidebarOpen ? "translate-x-0 shadow-overlay" : "-translate-x-full"
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-4">
          <Link href="/" aria-label="Aurelium Ledger home">
            <Logo />
          </Link>
          <button
            ref={closeRef}
            type="button"
            className="rounded-control p-2 text-inkMuted transition hover:bg-surfaceMuted hover:text-ink lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sixteen destinations need grouping; the scroll lives here, not on the panel. */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          {navigation.map((section) => (
            <div key={section.title} className="mb-4 last:mb-0">
              <p className="px-3 pb-1.5 text-label font-semibold uppercase text-inkSubtle">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-control py-2 pl-3 pr-2 text-sm font-medium",
                          "transition-colors duration-150 ease-smooth",
                          active
                            ? "bg-surfaceMuted text-ink"
                            : "text-inkMuted hover:bg-surfaceMuted hover:text-ink"
                        )}
                      >
                        {/* Gold rail marks the current route without shifting the row. */}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-pill bg-aurum-400 transition-opacity duration-150",
                            active ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <Icon
                          size={16}
                          aria-hidden
                          className={cn(
                            "shrink-0 transition-colors",
                            active
                              ? "text-aurum-600 dark:text-aurum-400"
                              : "text-inkSubtle group-hover:text-inkMuted"
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span
                            aria-label={`${item.badge} need attention`}
                            className="grid h-4 min-w-[1rem] shrink-0 place-items-center rounded-pill bg-loss-100 px-1 text-[10px] font-bold leading-none text-loss-700 dark:bg-loss-900/50 dark:text-loss-300"
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line p-3">
          <div className="rounded-card border border-aurum-400/25 bg-aurum-400/[0.07] p-3.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FileCheck2 size={15} className="text-aurum-600 dark:text-aurum-400" aria-hidden />
              Close the books
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-inkMuted">
              July reconciliation is 94% matched. Three card charges still need receipts.
            </p>
            <Button
              variant="accent"
              size="sm"
              className="mt-3 w-full"
              onClick={() =>
                addToast({
                  title: "Reconciliation queue opened",
                  body: "3 card charges from Jul 25–29 are waiting on receipts.",
                  tone: "info"
                })
              }
            >
              Review 3 items
            </Button>
          </div>

          <Link
            href="/dashboard/settings"
            className="mt-3 flex items-center gap-3 rounded-control p-2 transition hover:bg-surfaceMuted"
          >
            <Avatar initials={company.owner.initials} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">
                {company.owner.name}
              </span>
              <span className="block truncate text-xs text-inkMuted">{company.owner.role}</span>
            </span>
            <ArrowUpRight size={14} className="shrink-0 text-inkSubtle" aria-hidden />
          </Link>
        </div>
      </aside>
    </>
  );
}
