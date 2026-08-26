"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Info, LogIn, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Logo } from "@/components/navigation/logo";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { company } from "@/lib/mock-data";

const highlights = [
  {
    icon: Zap,
    title: "Nothing to set up",
    detail: "The workspace is already populated with a full year of data across sixteen modules."
  },
  {
    icon: ShieldCheck,
    title: "Nothing to protect",
    detail: "There is no backend and no real account — every figure is generated sample data."
  },
  {
    icon: Sparkles,
    title: "Nothing decorative",
    detail: "Every filter, sort, toggle and export is wired to the data. No dead clicks."
  }
];

/**
 * Demonstration sign-in.
 *
 * This build has no authentication layer, so the form does not verify anything
 * and nothing is stored or transmitted. It exists to show the entry flow from
 * the public site into the dashboard, and says so on screen rather than
 * pretending to be a real gate.
 */
export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState(company.owner.email);
  const [submitting, setSubmitting] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    // Stands in for the latency of a real sign-in round-trip.
    window.setTimeout(() => router.push("/dashboard"), 550);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — hidden on small screens where it would only push the form down. */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-surfaceMuted p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-aurum-400/[0.09] blur-3xl"
        />

        <Link href="/" className="relative">
          <Logo />
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink">
            Every number your business runs on, in one calm place.
          </h1>
          <ul className="mt-8 space-y-5">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-surface text-aurum-700 dark:text-aurum-400">
                    <Icon size={16} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink">{item.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-inkMuted">
                      {item.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-inkSubtle">
          © {company.founded}–2026 {company.legalName} · Portfolio demonstration
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-control px-2 py-1.5 text-sm text-inkMuted transition hover:text-ink"
          >
            <ArrowLeft size={15} aria-hidden />
            Back to site
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">
            <div className="lg:hidden">
              <Logo />
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink lg:mt-0">
              Sign in
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-inkMuted">
              Continue to the {company.name} demo workspace.
            </p>

            <div className="mt-6 flex items-start gap-2.5 rounded-control border border-aurum-400/30 bg-aurum-400/[0.07] px-4 py-3">
              <Info size={15} className="mt-0.5 shrink-0 text-aurum-700 dark:text-aurum-400" aria-hidden />
              <p className="text-xs leading-relaxed text-inkMuted">
                <span className="font-medium text-ink">Demonstration only.</span> There is no
                authentication in this build — the form does not check anything and nothing is
                stored or sent. Continue with any value, or skip it entirely.
              </p>
            </div>

            <form onSubmit={submit} className="mt-6">
              <Field label="Work email" htmlFor="login-email">
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="off"
                  placeholder="you@company.com"
                />
              </Field>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-inkMuted">Workspace</span>
                <Badge tone="accent">Aurelium Ledger · Demo</Badge>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                icon={LogIn}
                loading={submitting}
                className="mt-6 w-full"
              >
                Continue to dashboard
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" aria-hidden />
              <span className="text-xs text-inkSubtle">or</span>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>

            <Link href="/dashboard" className="mt-4 block">
              <Button variant="secondary" size="lg" iconRight={ArrowRight} className="w-full">
                Skip and open the dashboard
              </Button>
            </Link>

            <p className="mt-8 text-center text-xs text-inkSubtle">
              Curious what is inside?{" "}
              <Link href="/features" className="font-medium text-aurum-700 hover:underline dark:text-aurum-400">
                See the feature list
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
