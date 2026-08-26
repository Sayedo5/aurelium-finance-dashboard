"use client";

import { useState } from "react";
import { Bell, Palette, ShieldCheck, User } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Toggle } from "@/components/ui/field";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { company } from "@/lib/mock-data";
import { cn, type CurrencyCode, type DateFormat } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck }
] as const;

type TabId = (typeof tabs)[number]["id"];

const currencies: CurrencyCode[] = ["USD", "EUR", "GBP", "CAD"];
const dateFormats: DateFormat[] = ["MMM D, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

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
    <div className="flex items-center justify-between gap-4 rounded-control border border-line px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-inkMuted">{description}</p>
      </div>
      {children}
    </div>
  );
}

const sessions = [
  { device: "MacBook Pro · Chrome", location: "Seattle, WA", current: true },
  { device: "iPhone 16 · Safari", location: "Seattle, WA", current: false },
  { device: "Windows · Edge", location: "Austin, TX", current: false }
];

export function SettingsPage() {
  const { theme, setTheme, addToast, preferences, setPreference } = useAppContext();
  const fmt = useFormat();

  const [tab, setTab] = useState<TabId>("profile");

  const [fullName, setFullName] = useState(company.owner.name);
  const [email, setEmail] = useState(company.owner.email);
  const [role, setRole] = useState(company.owner.role);

  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [failedPayments, setFailedPayments] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);
  const [revoked, setRevoked] = useState<string[]>([]);

  function saveProfile() {
    if (!fullName.trim()) {
      addToast({ title: "Name required", body: "Enter the name to show on exports.", tone: "warning" });
      return;
    }
    // Deliberately permissive: enough to catch a typo, not enough to reject a valid address.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast({ title: "Check the email", body: "That address does not look valid.", tone: "warning" });
      return;
    }
    addToast({ title: "Profile saved", body: `Approvals will show ${fullName.trim()}.`, tone: "success" });
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex gap-1.5 overflow-x-auto rounded-card border border-line bg-surface p-1.5 shadow-card no-scrollbar"
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-control px-4 py-2.5 text-sm font-medium",
                "transition duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400",
                active
                  ? "bg-surfaceMuted text-ink shadow-raised"
                  : "text-inkMuted hover:bg-surfaceMuted hover:text-ink"
              )}
            >
              <Icon
                size={16}
                aria-hidden
                className={active ? "text-aurum-600 dark:text-aurum-400" : undefined}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" ? (
        <Card id="panel-profile" role="tabpanel" className="animate-rise">
          <CardHeader title="Profile" description="How your name appears on approvals and exports" />

          <div className="mt-6 flex items-center gap-4">
            <span
              aria-hidden
              className="grid h-14 w-14 shrink-0 place-items-center rounded-card bg-gradient-to-br from-aurum-300 to-aurum-500 text-base font-bold text-aurum-950 shadow-raised"
            >
              {company.owner.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{fullName || "—"}</p>
              <p className="truncate text-sm text-inkMuted">{role}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="settings-name">
              <Input
                id="settings-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </Field>
            <Field label="Email" htmlFor="settings-email">
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Role" htmlFor="settings-role" className="sm:col-span-2">
              <Input id="settings-role" value={role} onChange={(event) => setRole(event.target.value)} />
            </Field>
          </div>

          <Button variant="accent" className="mt-6" onClick={saveProfile}>
            Save changes
          </Button>
        </Card>
      ) : null}

      {tab === "preferences" ? (
        <Card id="panel-preferences" role="tabpanel" className="animate-rise">
          <CardHeader
            title="Preferences"
            description="Display and formatting defaults. Changes apply across the dashboard immediately."
          />

          <div className="mt-6 space-y-2.5">
            <SettingRow
              title="Dark theme"
              description="Reduces glare for late-night reviews. Persists across sessions."
            >
              <Toggle
                checked={theme === "dark"}
                onChange={(next) => setTheme(next ? "dark" : "light")}
                label="Dark theme"
              />
            </SettingRow>
            <SettingRow
              title="Compact table rows"
              description="Fits more transactions on screen by hiding row memos."
            >
              <Toggle
                checked={preferences.density === "compact"}
                onChange={(next) => setPreference("density", next ? "compact" : "comfortable")}
                label="Compact rows"
              />
            </SettingRow>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Display currency"
              htmlFor="settings-currency"
              hint={`Example: ${fmt.money(284310.44, 2)}`}
            >
              <Select
                id="settings-currency"
                value={preferences.currency}
                onChange={(event) => setPreference("currency", event.target.value as CurrencyCode)}
              >
                {currencies.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Date format"
              htmlFor="settings-date"
              hint={`Example: ${fmt.date("2026-07-24")}`}
            >
              <Select
                id="settings-date"
                value={preferences.dateFormat}
                onChange={(event) => setPreference("dateFormat", event.target.value as DateFormat)}
              >
                {dateFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <p className="mt-4 rounded-control border border-line bg-surfaceMuted px-4 py-3 text-xs leading-relaxed text-inkMuted">
            Preferences save as you change them and are stored in this browser. Amounts are converted
            from the USD ledger at a fixed reference rate.
          </p>
        </Card>
      ) : null}

      {tab === "notifications" ? (
        <Card id="panel-notifications" role="tabpanel" className="animate-rise">
          <CardHeader title="Notifications" description="Choose what reaches your inbox" />

          <div className="mt-6 space-y-2.5">
            <SettingRow
              title="Budget alerts"
              description="Notify when a category crosses 90% of its allocation."
            >
              <Toggle checked={budgetAlerts} onChange={setBudgetAlerts} label="Budget alerts" />
            </SettingRow>
            <SettingRow
              title="Failed payments"
              description="Immediate alert when a charge is declined."
            >
              <Toggle checked={failedPayments} onChange={setFailedPayments} label="Failed payments" />
            </SettingRow>
            <SettingRow
              title="Weekly digest"
              description="Monday summary of cash position and upcoming bills."
            >
              <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly digest" />
            </SettingRow>
            <SettingRow
              title="Product news"
              description="Occasional updates about new Aurelium features."
            >
              <Toggle checked={productNews} onChange={setProductNews} label="Product news" />
            </SettingRow>
          </div>

          <Button
            variant="accent"
            className="mt-6"
            onClick={() => {
              const enabled = [
                budgetAlerts && "budget alerts",
                failedPayments && "failed payments",
                weeklyDigest && "weekly digest",
                productNews && "product news"
              ].filter(Boolean) as string[];

              addToast({
                title: "Notification settings saved",
                body: enabled.length
                  ? `Sending: ${enabled.join(", ")}.`
                  : "All email notifications are now off.",
                tone: "success"
              });
            }}
          >
            Save notifications
          </Button>
        </Card>
      ) : null}

      {tab === "security" ? (
        <Card id="panel-security" role="tabpanel" className="animate-rise">
          <CardHeader title="Security" description="Protect access to financial records" />

          <div className="mt-6 space-y-2.5">
            <SettingRow
              title="Two-factor authentication"
              description="Require a one-time code at every sign in."
            >
              <Toggle
                checked={twoFactor}
                onChange={(next) => {
                  setTwoFactor(next);
                  addToast({
                    title: next ? "Two-factor enabled" : "Two-factor disabled",
                    body: next
                      ? "A one-time code will be required at sign in."
                      : "Sign-in now requires only a password.",
                    tone: next ? "success" : "warning"
                  });
                }}
                label="Two-factor authentication"
              />
            </SettingRow>
            <SettingRow
              title="New session alerts"
              description="Email whenever a new device signs in."
            >
              <Toggle checked={sessionAlerts} onChange={setSessionAlerts} label="Session alerts" />
            </SettingRow>
          </div>

          <div className="mt-4 rounded-control border border-line p-4">
            <p className="text-sm font-medium text-ink">Active sessions</p>
            <ul className="mt-3 space-y-2.5">
              {sessions.map((session) => {
                const isRevoked = revoked.includes(session.device);
                return (
                  <li
                    key={session.device}
                    className={cn(
                      "flex items-center justify-between gap-3 text-sm transition-opacity",
                      isRevoked && "opacity-50"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{session.device}</p>
                      <p className="truncate text-xs text-inkMuted">{session.location}</p>
                    </div>
                    {session.current ? (
                      <span className="shrink-0 rounded-pill bg-gain-100 px-2.5 py-1 text-xs font-medium text-gain-700 dark:bg-gain-900/40 dark:text-gain-300">
                        This device
                      </span>
                    ) : isRevoked ? (
                      <span className="shrink-0 rounded-pill border border-line px-2.5 py-1 text-xs font-medium text-inkMuted">
                        Signed out
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setRevoked((current) => [...current, session.device]);
                          addToast({
                            title: "Session revoked",
                            body: `${session.device} was signed out.`,
                            tone: "info"
                          });
                        }}
                      >
                        Revoke
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      ) : null}
    </>
  );
}
