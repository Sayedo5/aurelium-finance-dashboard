"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Plus, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress, RingProgress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Modal } from "@/components/ui/modal";
import { useAppContext } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { accountMap, savingsGoals as seedGoals } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

/** Months of contributions still needed to close the gap. */
function monthsRemaining(target: number, saved: number, monthly: number) {
  if (monthly <= 0) return Infinity;
  return Math.max(0, Math.ceil((target - saved) / monthly));
}

export function GoalsPage() {
  const loading = useSimulatedLoading();
  const { addToast } = useAppContext();
  const [goals, setGoals] = useState(seedGoals);
  const [activeId, setActiveId] = useState(seedGoals[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [contribution, setContribution] = useState("");

  const active = goals.find((goal) => goal.id === activeId) ?? goals[0];
  const activeProgress = (active.saved / active.target) * 100;

  const totals = useMemo(() => {
    const saved = goals.reduce((sum, goal) => sum + goal.saved, 0);
    const target = goals.reduce((sum, goal) => sum + goal.target, 0);
    const monthly = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
    return { saved, target, monthly };
  }, [goals]);

  function addContribution() {
    const amount = Number(contribution);
    if (!Number.isFinite(amount) || amount <= 0) {
      addToast({ title: "Enter an amount", body: "Contribution must be a positive number.", tone: "warning" });
      return;
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.id === active.id
          ? { ...goal, saved: Math.min(goal.target, goal.saved + amount) }
          : goal
      )
    );
    addToast({
      title: "Contribution added",
      body: `${formatCurrency(amount)} moved into ${active.name}.`,
      tone: "success"
    });
    setContribution("");
    setModalOpen(false);
  }

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total saved" value={totals.saved} icon={Target} caption={`across ${goals.length} goals`} loading={loading} />
        <StatCard label="Combined target" value={totals.target} icon={TrendingUp} caption={`${((totals.saved / totals.target) * 100).toFixed(0)}% funded`} loading={loading} />
        <StatCard label="Monthly contributions" value={totals.monthly} icon={CalendarClock} caption="automated transfers" loading={loading} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Savings goals</h2>
              <p className="text-sm text-inkMuted">Select a goal to see its funding plan</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
            >
              <Plus size={16} /> Add funds
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full" />
                ))
              : goals.map((goal, index) => {
                  const percent = (goal.saved / goal.target) * 100;
                  const complete = percent >= 100;
                  const selected = goal.id === activeId;

                  return (
                    <button
                      key={goal.id}
                      onClick={() => setActiveId(goal.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                        selected
                          ? "border-brand-400 bg-gradient-to-br from-brand-500/12 to-accent-500/8 ring-2 ring-brand-400/30"
                          : "border-line hover:bg-white/60 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{goal.name}</p>
                          <p className="mt-0.5 truncate text-xs text-inkMuted">{goal.purpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums">{formatCurrency(goal.saved)}</p>
                          <p className="text-xs text-inkMuted">of {formatCurrency(goal.target)}</p>
                        </div>
                      </div>

                      <Progress value={percent} className="mt-3.5" delayMs={index * 90} />

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className={complete ? "font-semibold text-brand-600 dark:text-brand-300" : "text-inkMuted"}>
                          {complete ? "Fully funded" : `${percent.toFixed(0)}% funded`}
                        </span>
                        <span className="text-inkMuted">Target {formatDate(goal.targetDate)}</span>
                      </div>
                    </button>
                  );
                })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="text-center">
            <h2 className="text-base font-semibold">{active.name}</h2>
            <p className="mt-1 text-sm text-inkMuted">{active.purpose}</p>
            <div className="mt-6 flex justify-center">
              <RingProgress value={activeProgress} size={168} stroke={13}>
                <div>
                  <p className="text-3xl font-semibold tabular-nums">{activeProgress.toFixed(0)}%</p>
                  <p className="mt-0.5 text-xs text-inkMuted">funded</p>
                </div>
              </RingProgress>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl border border-line p-3">
                <p className="text-xs text-inkMuted">Saved</p>
                <p className="mt-1 font-semibold tabular-nums">{formatCurrency(active.saved)}</p>
              </div>
              <div className="rounded-2xl border border-line p-3">
                <p className="text-xs text-inkMuted">Remaining</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {formatCurrency(Math.max(0, active.target - active.saved))}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Funding plan</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Monthly contribution</dt>
                <dd className="font-medium tabular-nums">
                  {formatCurrency(active.monthlyContribution)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Months remaining</dt>
                <dd className="font-medium tabular-nums">
                  {monthsRemaining(active.target, active.saved, active.monthlyContribution)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Target date</dt>
                <dd className="font-medium">{formatDate(active.targetDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Funded from</dt>
                <dd className="text-right font-medium">{accountMap[active.accountId].name}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={`Add funds to ${active.name}`}
        description="Contributions are applied immediately and capped at the goal target."
        onClose={() => setModalOpen(false)}
        onSubmit={addContribution}
        submitLabel="Add contribution"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Amount (USD)</span>
          <input
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 5000"
            className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {[2500, 5000, 10000].map((preset) => (
            <button
              key={preset}
              onClick={() => setContribution(String(preset))}
              className="rounded-xl border border-line px-3 py-1.5 text-xs font-medium transition hover:bg-white/70 dark:hover:bg-white/5"
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
