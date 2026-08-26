"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Modal } from "@/components/ui/modal";
import { useAppContext } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { budgets as seedBudgets, categoryMap } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

type Filter = "all" | "on-track" | "over";

const filters: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "on-track", label: "On track" },
  { id: "over", label: "Over budget" }
];

export function BudgetsPage() {
  const loading = useSimulatedLoading();
  const { addToast } = useAppContext();
  const [budgets, setBudgets] = useState(seedBudgets);
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftAmount, setDraftAmount] = useState("");

  const totals = useMemo(() => {
    const allocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
    const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    return { allocated, spent, remaining: allocated - spent };
  }, [budgets]);

  const visible = useMemo(
    () =>
      budgets.filter((budget) => {
        if (filter === "over") return budget.spent > budget.allocated;
        if (filter === "on-track") return budget.spent <= budget.allocated;
        return true;
      }),
    [budgets, filter]
  );

  const overCount = budgets.filter((budget) => budget.spent > budget.allocated).length;

  function createBudget() {
    const amount = Number(draftAmount);
    if (!draftLabel.trim() || !Number.isFinite(amount) || amount <= 0) {
      addToast({ title: "Check the form", body: "Enter a name and a positive amount.", tone: "warning" });
      return;
    }

    setBudgets((current) => [
      ...current,
      {
        id: `b-${draftLabel.toLowerCase().replace(/\s+/g, "-")}-${current.length}`,
        categoryId: "office",
        label: draftLabel.trim(),
        allocated: amount,
        spent: 0,
        period: "July 2026",
        owner: "Sarah Kim"
      }
    ]);
    addToast({ title: "Budget created", body: `${draftLabel.trim()} added for July 2026.`, tone: "success" });
    setDraftLabel("");
    setDraftAmount("");
    setModalOpen(false);
  }

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Allocated this month" value={totals.allocated} icon={Wallet} caption="July 2026" loading={loading} />
        <StatCard label="Spent so far" value={totals.spent} icon={AlertTriangle} caption={`${((totals.spent / totals.allocated) * 100).toFixed(0)}% of plan`} loading={loading} />
        <StatCard label="Remaining" value={totals.remaining} icon={CheckCircle2} caption={overCount > 0 ? `${overCount} category over budget` : "All categories on track"} loading={loading} />
      </section>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Category budgets</h2>
            <p className="text-sm text-inkMuted">July 2026 allocations and spend to date</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl border border-line bg-white/60 p-1 dark:bg-slate-950/50">
              {filters.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
                    filter === item.id
                      ? "bg-ink text-white shadow-soft dark:bg-white dark:text-slate-950"
                      : "text-inkMuted hover:text-ink dark:hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
            >
              <Plus size={16} /> New budget
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-20 w-full" />)
          ) : visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-inkMuted">
              No budgets in this view.
            </p>
          ) : (
            visible.map((budget, index) => {
              const percent = (budget.spent / budget.allocated) * 100;
              const over = budget.spent > budget.allocated;
              const remaining = budget.allocated - budget.spent;

              return (
                <div
                  key={budget.id}
                  className="rounded-3xl border border-line p-4 transition hover:bg-white/60 dark:hover:bg-white/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-10 w-1.5 rounded-full"
                        style={{ backgroundColor: categoryMap[budget.categoryId].color }}
                      />
                      <div>
                        <p className="font-semibold">{budget.label}</p>
                        <p className="text-xs text-inkMuted">
                          {budget.period} · owned by {budget.owner}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatCurrency(budget.spent)}
                        <span className="text-sm font-normal text-inkMuted">
                          {" "}
                          / {formatCurrency(budget.allocated)}
                        </span>
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs font-medium",
                          over ? "text-danger" : "text-inkMuted"
                        )}
                      >
                        {over
                          ? `${formatCurrency(Math.abs(remaining))} over`
                          : `${formatCurrency(remaining)} left`}
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={percent}
                    color={categoryMap[budget.categoryId].color}
                    className="mt-4"
                    delayMs={index * 80}
                  />

                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className={cn(over ? "font-semibold text-danger" : "text-inkMuted")}>
                      {percent.toFixed(0)}% used
                    </span>
                    {over ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        <AlertTriangle size={12} /> Over budget
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">
                        <CheckCircle2 size={12} /> On track
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title="Create a budget"
        description="Set a monthly allocation. Spend is tracked against it automatically."
        onClose={() => setModalOpen(false)}
        onSubmit={createBudget}
        submitLabel="Create budget"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Budget name</span>
            <input
              value={draftLabel}
              onChange={(event) => setDraftLabel(event.target.value)}
              placeholder="e.g. Recruiting"
              className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Monthly allocation (USD)</span>
            <input
              value={draftAmount}
              onChange={(event) => setDraftAmount(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 6000"
              className="w-full rounded-2xl border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-accent-400 dark:bg-slate-950/50"
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
