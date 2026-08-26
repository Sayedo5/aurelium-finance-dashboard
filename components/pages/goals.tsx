"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Plus, Target, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress, RingProgress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { accountMap, savingsGoals as seedGoals } from "@/lib/mock-data";
import { cn, ratioToPercent } from "@/lib/utils";
import type { SavingsGoal } from "@/lib/types";

/** Months of contributions still needed to close the gap. */
function monthsRemaining(target: number, saved: number, monthly: number) {
  if (saved >= target) return 0;
  if (monthly <= 0) return Infinity;
  return Math.ceil((target - saved) / monthly);
}

const presets = [2500, 5000, 10000];

export function GoalsPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [goals, setGoals] = useState<SavingsGoal[]>(seedGoals);
  const [activeId, setActiveId] = useState(seedGoals[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [contribution, setContribution] = useState("");

  const active = goals.find((goal) => goal.id === activeId) ?? goals[0];
  const activeProgress = ratioToPercent(active.saved, active.target);
  const complete = activeProgress >= 100;

  const totals = useMemo(() => {
    const saved = goals.reduce((sum, goal) => sum + goal.saved, 0);
    const target = goals.reduce((sum, goal) => sum + goal.target, 0);
    const monthly = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
    return { saved, target, monthly };
  }, [goals]);

  const monthsLeft = monthsRemaining(active.target, active.saved, active.monthlyContribution);

  function addContribution() {
    const amount = Number(contribution);

    if (!Number.isFinite(amount) || amount <= 0) {
      addToast({
        title: "Enter an amount",
        body: "The contribution must be a positive number.",
        tone: "warning"
      });
      return;
    }

    const headroom = Math.max(0, active.target - active.saved);
    if (headroom === 0) {
      addToast({
        title: "Goal already funded",
        body: `${active.name} has reached its target.`,
        tone: "info"
      });
      return;
    }

    const applied = Math.min(amount, headroom);

    setGoals((current) =>
      current.map((goal) =>
        goal.id === active.id ? { ...goal, saved: goal.saved + applied } : goal
      )
    );

    addToast({
      title: "Contribution added",
      body:
        applied < amount
          ? `${fmt.money(applied)} applied — ${active.name} is now fully funded.`
          : `${fmt.money(applied)} moved into ${active.name}.`,
      tone: "success"
    });

    setContribution("");
    setModalOpen(false);
  }

  return (
    <>
      <section aria-label="Savings summary" className="grid animate-rise gap-4 sm:grid-cols-3">
        <StatCard
          label="Total saved"
          value={totals.saved}
          icon={Target}
          caption={`across ${goals.length} goals`}
          loading={loading}
          tone="gain"
        />
        <StatCard
          label="Combined target"
          value={totals.target}
          icon={TrendingUp}
          caption={`${ratioToPercent(totals.saved, totals.target).toFixed(0)}% funded`}
          loading={loading}
        />
        <StatCard
          label="Monthly contributions"
          value={totals.monthly}
          icon={CalendarClock}
          caption="automated transfers"
          loading={loading}
        />
      </section>

      <section className="grid animate-rise gap-4 stagger-1 xl:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Savings goals"
            description="Select a goal to see its funding plan"
            actions={
              <Button variant="accent" icon={Plus} onClick={() => setModalOpen(true)}>
                Add funds
              </Button>
            }
          />

          <div className="mt-5 space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full rounded-card" />
                ))
              : goals.map((goal, index) => {
                  const percent = ratioToPercent(goal.saved, goal.target);
                  const funded = percent >= 100;
                  const selected = goal.id === activeId;

                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setActiveId(goal.id)}
                      aria-pressed={selected}
                      className={cn(
                        "w-full rounded-card border p-4 text-left transition duration-200 ease-smooth",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                        selected
                          ? "border-aurum-400/60 bg-aurum-400/[0.06] ring-1 ring-aurum-400/40"
                          : "border-line hover:border-lineStrong hover:bg-surfaceMuted"
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{goal.name}</p>
                          <p className="mt-0.5 truncate text-xs text-inkMuted">{goal.purpose}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="numeric font-semibold text-ink">{fmt.money(goal.saved)}</p>
                          <p className="text-xs text-inkMuted">of {fmt.money(goal.target)}</p>
                        </div>
                      </div>

                      <Progress
                        value={percent}
                        color={funded ? "var(--gain)" : undefined}
                        className="mt-3.5"
                        delayMs={index * 80}
                        label={`${goal.name} funding progress`}
                      />

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span
                          className={cn(
                            "numeric font-medium",
                            funded ? "font-semibold text-gain-600 dark:text-gain-400" : "text-inkMuted"
                          )}
                        >
                          {funded ? "Fully funded" : `${percent.toFixed(0)}% funded`}
                        </span>
                        <span className="text-inkMuted">Target {fmt.date(goal.targetDate)}</span>
                      </div>
                    </button>
                  );
                })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="text-center">
            <h2 className="text-[0.9375rem] font-semibold tracking-tight text-ink">{active.name}</h2>
            <p className="mt-1 text-sm text-inkMuted">{active.purpose}</p>

            <div className="mt-6 flex justify-center">
              {loading ? (
                <Skeleton className="h-[168px] w-[168px] rounded-full" />
              ) : (
                <RingProgress
                  value={activeProgress}
                  size={168}
                  stroke={12}
                  color={complete ? "var(--gain)" : "#e8b34a"}
                  label={`${active.name} funding progress`}
                >
                  <div>
                    <p className="numeric text-3xl font-semibold text-ink">
                      {activeProgress.toFixed(0)}%
                    </p>
                    <p className="mt-0.5 text-xs text-inkMuted">funded</p>
                  </div>
                </RingProgress>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-control border border-line p-3">
                <p className="text-xs text-inkMuted">Saved</p>
                <p className="numeric mt-1 font-semibold text-ink">{fmt.money(active.saved)}</p>
              </div>
              <div className="rounded-control border border-line p-3">
                <p className="text-xs text-inkMuted">Remaining</p>
                <p className="numeric mt-1 font-semibold text-ink">
                  {fmt.money(Math.max(0, active.target - active.saved))}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Funding plan" />
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Monthly contribution</dt>
                <dd className="numeric font-medium text-ink">
                  {fmt.money(active.monthlyContribution)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Months remaining</dt>
                <dd className="numeric font-medium text-ink">
                  {monthsLeft === 0
                    ? "Funded"
                    : Number.isFinite(monthsLeft)
                      ? monthsLeft
                      : "No contribution set"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Target date</dt>
                <dd className="font-medium text-ink">{fmt.date(active.targetDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Funded from</dt>
                <dd className="text-right font-medium text-ink">
                  {accountMap[active.accountId].name}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={`Add funds to ${active.name}`}
        description="Contributions apply immediately and are capped at the goal target."
        onClose={() => setModalOpen(false)}
        onSubmit={addContribution}
        submitLabel="Add contribution"
      >
        <Field label="Amount (USD)" hint="Entered in USD regardless of display currency.">
          <Input
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
            inputMode="decimal"
            placeholder="e.g. 5000"
            aria-label="Contribution amount in US dollars"
            onKeyDown={(event) => {
              if (event.key === "Enter") addContribution();
            }}
          />
        </Field>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset}
              variant="secondary"
              size="sm"
              onClick={() => setContribution(String(preset))}
            >
              {fmt.money(preset)}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
}
