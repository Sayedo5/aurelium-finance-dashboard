"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, LogOut, Menu, RotateCw, Settings, User } from "lucide-react";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { GlobalSearch } from "@/components/navigation/global-search";
import { useDismissable } from "@/lib/hooks";
import { company } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconButton =
  "relative grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-surface sm:h-10 sm:w-10 " +
  "text-inkMuted transition duration-150 ease-smooth hover:border-lineStrong hover:text-ink " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas disabled:opacity-60";

export function Topbar({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  const { setSidebarOpen, notifications, unreadCount, markAllRead, markRead, refresh, refreshing, addToast } =
    useAppContext();
  const fmt = useFormat();
  const router = useRouter();

  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const bellRef = useDismissable<HTMLDivElement>(bellOpen, () => setBellOpen(false));
  const profileRef = useDismissable<HTMLDivElement>(profileOpen, () => setProfileOpen(false));

  return (
    <header className="sticky top-0 z-30 rounded-card border border-line bg-surface/85 px-3 py-3 shadow-card backdrop-blur-xl sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className={cn(iconButton, "lg:hidden")}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-ink sm:text-lg">
              {title}
            </h1>
            <p className="truncate text-xs text-inkMuted sm:text-sm">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <GlobalSearch className="hidden w-64 xl:block 2xl:w-72" />

          {actions ? <div className="hidden items-center gap-2 md:flex">{actions}</div> : null}

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className={iconButton}
            aria-label="Refresh data"
            title="Refresh data"
          >
            <RotateCw size={17} className={cn(refreshing && "animate-spinSlow")} />
          </button>

          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => {
                setBellOpen((open) => !open);
                setProfileOpen(false);
              }}
              aria-label={`Notifications, ${unreadCount} unread`}
              aria-expanded={bellOpen}
              aria-haspopup="dialog"
              className={iconButton}
            >
              <Bell size={17} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-pill bg-loss-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {bellOpen ? (
              <div
                role="dialog"
                aria-label="Notifications"
                className="absolute right-0 top-12 z-50 w-[min(21rem,calc(100vw-2rem))] animate-rise overflow-hidden rounded-card border border-line bg-surface shadow-overlay"
              >
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-xs font-medium text-aurum-700 transition hover:bg-surfaceMuted disabled:opacity-40 dark:text-aurum-400"
                  >
                    <Check size={13} /> Mark all read
                  </button>
                </div>
                <div className="max-h-80 divide-y divide-line overflow-y-auto">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        markRead(item.id);
                        // Every notification points at the record it is about.
                        if (item.href) {
                          setBellOpen(false);
                          router.push(item.href);
                        }
                      }}
                      className={cn(
                        "block w-full px-4 py-3 text-left transition hover:bg-surfaceMuted",
                        !item.unread && "opacity-65"
                      )}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-ink">{item.title}</span>
                        {item.unread ? (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-aurum-400"
                          />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-inkMuted">
                        {item.body}
                      </span>
                      <span className="mt-1.5 block text-[11px] text-inkSubtle">
                        {fmt.date(item.date)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setBellOpen(false);
              }}
              aria-label="Account menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-control border border-line bg-surface py-1.5 pl-1.5 pr-2.5 transition duration-150 ease-smooth hover:border-lineStrong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span
                aria-hidden
                className="grid h-7 w-7 shrink-0 place-items-center rounded-[0.5rem] bg-surfaceMuted text-[11px] font-bold text-aurum-600 ring-1 ring-line dark:text-aurum-400"
              >
                {company.owner.initials}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-xs font-semibold leading-tight text-ink">
                  {company.owner.name}
                </span>
                <span className="block text-[11px] leading-tight text-inkMuted">
                  {company.owner.role}
                </span>
              </span>
            </button>

            {profileOpen ? (
              <div
                role="menu"
                aria-label="Account"
                className="absolute right-0 top-12 z-50 w-56 animate-rise overflow-hidden rounded-card border border-line bg-surface p-1.5 shadow-overlay"
              >
                <div className="border-b border-line px-3 pb-2.5 pt-2">
                  <p className="truncate text-sm font-medium text-ink">{company.owner.name}</p>
                  <p className="truncate text-xs text-inkMuted">{company.owner.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="mt-1.5 flex items-center gap-2.5 rounded-control px-3 py-2 text-sm text-inkMuted transition hover:bg-surfaceMuted hover:text-ink"
                >
                  <User size={15} aria-hidden /> Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm text-inkMuted transition hover:bg-surfaceMuted hover:text-ink"
                >
                  <Settings size={15} aria-hidden /> Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    addToast({
                      title: "Signed out",
                      body: "This demo has no auth layer, so your session stays active.",
                      tone: "info"
                    });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-sm text-inkMuted transition hover:bg-surfaceMuted hover:text-ink"
                >
                  <LogOut size={15} aria-hidden /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Search and page actions drop below the title bar on narrow screens. */}
      <div className="mt-3 flex items-center gap-2 xl:hidden">
        <GlobalSearch className="min-w-0 flex-1" />
        {actions ? <div className="flex shrink-0 items-center gap-2 md:hidden">{actions}</div> : null}
      </div>
    </header>
  );
}
