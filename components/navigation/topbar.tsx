"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, Menu, Search } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { company } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { setSidebarOpen, notifications, unreadCount, markAllRead } = useAppContext();
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [panelOpen]);

  return (
    <header className="sticky top-0 z-30 rounded-[28px] border border-line bg-panel px-4 py-3 shadow-soft backdrop-blur-xl sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-line bg-white/60 transition hover:bg-white lg:hidden dark:bg-slate-950/60"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
            <p className="truncate text-xs text-inkMuted sm:text-sm">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden xl:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkMuted" size={16} />
            <input
              placeholder="Search merchants, accounts…"
              className="w-64 rounded-2xl border border-line bg-white/60 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:w-72 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 dark:bg-slate-950/50 dark:focus:ring-accent-900/40"
            />
          </div>

          <ThemeToggle />

          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setPanelOpen((open) => !open)}
              aria-label={`Notifications, ${unreadCount} unread`}
              className="relative grid h-10 w-10 place-items-center rounded-2xl border border-line bg-white/60 transition hover:-translate-y-0.5 hover:bg-white dark:bg-slate-950/60"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {panelOpen ? (
              <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] animate-rise rounded-3xl border border-line bg-panel p-4 shadow-luxe backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
                  >
                    <Check size={13} /> Mark all read
                  </button>
                </div>
                <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-2xl border border-line p-3 transition",
                        item.unread ? "bg-white/70 dark:bg-slate-900/60" : "opacity-70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.unread ? (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-inkMuted">{item.body}</p>
                      <p className="mt-2 text-[11px] text-inkMuted">{formatDate(item.date)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <button className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/60 py-1.5 pl-1.5 pr-3 transition hover:bg-white dark:bg-slate-950/60">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-brand-500 text-xs font-bold text-white">
              {company.owner.initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold leading-tight">{company.owner.name}</span>
              <span className="block text-[11px] leading-tight text-inkMuted">
                {company.owner.role}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
