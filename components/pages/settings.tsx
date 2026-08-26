"use client";

import { useState } from "react";
import { Bell, Palette, ShieldCheck, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/components/providers/app-provider";
import { company } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck }
] as const;

type TabId = (typeof tabs)[number]["id"];

function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition duration-300",
        checked ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300",
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-inkMuted">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { theme, toggleTheme, addToast } = useAppContext();
  const [tab, setTab] = useState<TabId>("profile");

  const [fullName, setFullName] = useState(company.owner.name);
  const [email, setEmail] = useState(company.owner.email);
  const [role, setRole] = useState(company.owner.role);

  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MMM D, YYYY");
  const [compactRows, setCompactRows] = useState(false);

  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [failedPayments, setFailedPayments] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto rounded-[28px] border border-line bg-panel p-2 shadow-soft backdrop-blur-xl">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-ink text-white shadow-soft dark:bg-white dark:text-slate-950"
                  : "text-inkMuted hover:bg-white/70 hover:text-ink dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" ? (
        <Card className="animate-rise">
          <h2 className="text-base font-semibold">Profile</h2>
          <p className="text-sm text-inkMuted">How your name appears on approvals and exports</p>

          <div className="mt-6 flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white">
              {company.owner.initials}
            </span>
            <div>
              <p className="font-semibold">{fullName}</p>
              <p className="text-sm text-inkMuted">{role}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Role</span>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
              />
            </label>
          </div>

          <button
            onClick={() =>
              addToast({ title: "Profile saved", body: "Your details were updated.", tone: "success" })
            }
            className="mt-6 rounded-2xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          >
            Save changes
          </button>
        </Card>
      ) : null}

      {tab === "preferences" ? (
        <Card className="animate-rise">
          <h2 className="text-base font-semibold">Preferences</h2>
          <p className="text-sm text-inkMuted">Display and formatting defaults</p>

          <div className="mt-6 space-y-3">
            <SettingRow title="Dark theme" description="Currently using the dark palette by default.">
              <Toggle checked={theme === "dark"} onChange={toggleTheme} label="Dark theme" />
            </SettingRow>
            <SettingRow title="Compact table rows" description="Fit more transactions on screen at once.">
              <Toggle checked={compactRows} onChange={setCompactRows} label="Compact rows" />
            </SettingRow>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Display currency</span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
              >
                {["USD", "EUR", "GBP", "CAD"].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Date format</span>
              <select
                value={dateFormat}
                onChange={(event) => setDateFormat(event.target.value)}
                className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
              >
                {["MMM D, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={() =>
              addToast({
                title: "Preferences saved",
                body: `Amounts will display in ${currency}.`,
                tone: "success"
              })
            }
            className="mt-6 rounded-2xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          >
            Save preferences
          </button>
        </Card>
      ) : null}

      {tab === "notifications" ? (
        <Card className="animate-rise">
          <h2 className="text-base font-semibold">Notifications</h2>
          <p className="text-sm text-inkMuted">Choose what reaches your inbox</p>

          <div className="mt-6 space-y-3">
            <SettingRow title="Budget alerts" description="Notify when a category crosses 90% of its allocation.">
              <Toggle checked={budgetAlerts} onChange={setBudgetAlerts} label="Budget alerts" />
            </SettingRow>
            <SettingRow title="Failed payments" description="Immediate alert when a charge is declined.">
              <Toggle checked={failedPayments} onChange={setFailedPayments} label="Failed payments" />
            </SettingRow>
            <SettingRow title="Weekly digest" description="Monday summary of cash position and upcoming bills.">
              <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly digest" />
            </SettingRow>
            <SettingRow title="Product news" description="Occasional updates about new Aurelium features.">
              <Toggle checked={productNews} onChange={setProductNews} label="Product news" />
            </SettingRow>
          </div>

          <button
            onClick={() =>
              addToast({
                title: "Notification settings saved",
                body: "Your delivery preferences were updated.",
                tone: "success"
              })
            }
            className="mt-6 rounded-2xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          >
            Save notifications
          </button>
        </Card>
      ) : null}

      {tab === "security" ? (
        <Card className="animate-rise">
          <h2 className="text-base font-semibold">Security</h2>
          <p className="text-sm text-inkMuted">Protect access to financial records</p>

          <div className="mt-6 space-y-3">
            <SettingRow title="Two-factor authentication" description="Require a one-time code at every sign in.">
              <Toggle checked={twoFactor} onChange={setTwoFactor} label="Two-factor authentication" />
            </SettingRow>
            <SettingRow title="New session alerts" description="Email whenever a new device signs in.">
              <Toggle checked={sessionAlerts} onChange={setSessionAlerts} label="Session alerts" />
            </SettingRow>
          </div>

          <div className="mt-4 rounded-2xl border border-line p-4">
            <p className="text-sm font-medium">Active sessions</p>
            <div className="mt-3 space-y-2.5">
              {[
                { device: "MacBook Pro · Chrome", location: "Seattle, WA", current: true },
                { device: "iPhone 16 · Safari", location: "Seattle, WA", current: false },
                { device: "Windows · Edge", location: "Austin, TX", current: false }
              ].map((session) => (
                <div key={session.device} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-xs text-inkMuted">{session.location}</p>
                  </div>
                  {session.current ? (
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">
                      This device
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        addToast({
                          title: "Session revoked",
                          body: `${session.device} was signed out.`,
                          tone: "info"
                        })
                      }
                      className="rounded-xl border border-line px-3 py-1.5 text-xs font-medium transition hover:bg-white/70 dark:hover:bg-white/5"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : null}
    </>
  );
}
