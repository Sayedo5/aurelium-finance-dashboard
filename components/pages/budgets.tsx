"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Pencil, Plus, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Field, Input, SegmentedControl, Select } from "@/components/ui/field";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { budgets as seedBudgets, categories, categoryMap } from "@/lib/mock-data";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, ratioToPercent } from "@/lib/utils";
import type { Budget, CategoryId } from "@/lib/types";

type FilterId = "all" | "on-track" | "watch" | "over";

const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "on-track", label: "On track" },
  { id: "watch", label: "Near limit" },
  { id: "over", label: "Over" }
];

/** Anything at 90% or more of its allocation is worth flagging before it breaches. */
const WATCH_THRESHOLD = 90;

const expenseCategories = categories.filter((category) => category.direction === "expense");

interface Draft {
  id: string | null;
  label: string;
  amount: string;
  categoryId: CategoryId;
}

const emptyDraft: Draft = { id: null, label: "", amount: "", categoryId: "office" };

export function BudgetsPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [budgets, setBudgets] = useState<Budget[]>(seedBudgets);
  const [filter, setFilter] = useState<FilterId>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const totals = useMemo(() => {
    const allocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
    const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    return { allocated, spent, remaining: allocated - spent };
  }, [budgets]);

  const visible = useMemo(
    () =>
      budgets.filter((budget) => {
        const percent = ratioToPercent(budget.spent, budget.allocated);
        if (filter === "over") return percent > 100;
        if (filter === "watch") return percent >= WATCH_THRESHOLD && percent <= 100;
        if (filter === "on-track") return percent < WATCH_THRESHOLD;
        return true;
      }),
    [budgets, filter]
  );

  const overCount = budgets.filter((budget) => budget.spent > budget.allocated).length;

  function openCreate() {
    setDraft(emptyDraft);
    setModalOpen(true);
  }

  function openEdit(budget: Budget) {
    setDraft({
      id: budget.id,
      label: budget.label,
      amount: String(budget.allocated),
      categoryId: budget.categoryId
    });
    setModalOpen(true);
  }

  function saveBudget() {
    const amount = Number(draft.amount);

    if (!draft.label.trim()) {
      addToast({ title: "Name required", body: "Give the budget a name.", tone: "warning" });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      addToast({
        title: "Check the amount",
        body: "The monthly allocation must be a positive number.",
        tone: "warning"
      });
      return;
    }

    if (draft.id) {
      setBudgets((current) =>
        current.map((budget) =>
          budget.id === draft.id
            ? { ...budget, label: draft.label.trim(), allocated: amount, categoryId: draft.categoryId }
            : budget
        )
      );
      addToast({
        title: "Budget updated",
        body: `${draft.label.trim()} now allows ${fmt.money(amount)} per month.`,
        tone: "success"
      });
    } else {
      setBudgets((current) => [
        ...current,
        {
          // Suffix with the count so two budgets of the same name stay distinct.
          id: `b-${draft.label.toLowerCase().replace(/\s+/g, "-")}-${current.length}`,
          categoryId: draft.categoryId,
          label: draft.label.trim(),
          allocated: amount,
          spent: 0,
          period: "July 2026",
          owner: "Sarah Kim"
        }
      ]);
      addToast({
        title: "Budget created",
        body: `${draft.label.trim()} added for July 2026.`,
        tone: "success"
      });
    }

    setDraft(emptyDraft);
    setModalOpen(false);
  }

  function exportBudgets() {
    const csv = toCsv<Budget>(budgets, [
      { header: "Budget", value: (budget) => budget.label },
      { header: "Category", value: (budget) => categoryMap[budget.categoryId].label },
      { header: "Period", value: (budget) => budget.period },
      { header: "Owner", value: (budget) => budget.owner },
      { header: "Allocated (USD)", value: (budget) => budget.allocated.toFixed(2) },
      { header: "Spent (USD)", value: (budget) => budget.spent.toFixed(2) },
      { header: "Remaining (USD)", value: (budget) => (budget.allocated - budget.spent).toFixed(2) },
      {
        header: "Used (%)",
        value: (budget) => ratioToPercent(budget.spent, budget.allocated).toFixed(1)
      }
    ]);

    const ok = downloadCsv(csvFilename("budgets", "2026-07"), csv);
    addToast(
      ok
        ? { title: "Budgets exported", body: `${budgets.length} rows saved as CSV.`, tone: "success" }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  return (
    <>
      <section aria-label="Budget totals" className="grid animate-rise gap-4 sm:grid-cols-3">
        <StatCard
          label="Allocated this month"
          value={totals.allocated}
          icon={Wallet}
          caption="July 2026"
          loading={loading}
        />
        <StatCard
          label="Spent so far"
          value={totals.spent}
          icon={AlertTriangle}
          caption={`${ratioToPercent(totals.spent, totals.allocated).toFixed(0)}% of plan`}
          loading={loading}
          tone="loss"
        />
        <StatCard
          label="Remaining"
          value={totals.remaining}
          icon={CheckCircle2}
          caption={
            overCount > 0
              ? `${overCount} ${overCount === 1 ? "category" : "categories"} over budget`
              : "All categories on track"
          }
          loading={loading}
          tone={totals.remaining >= 0 ? "gain" : "loss"}
        />
      </section>

      <Card className="animate-rise stagger-1">
        <CardHeader
          title="Category budgets"
          description="July 2026 allocations and spend to date"
          actions={
            <>
              <SegmentedControl
                label="Budget status filter"
                options={filters}
                value={filter}
                onChange={setFilter}
              />
              <Button variant="secondary" size="md" icon={Download} onClick={exportBudgets}>
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="accent" icon={Plus} onClick={openCreate}>
                New budget
              </Button>
            </>
          }
        />

        <div className="mt-6 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-card" />
            ))
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No budgets in this view"
              description={
                filter === "over"
                  ? "Nothing has breached its allocation — that is good news."
                  : "Change the filter to see the other categories."
              }
              action={
                <Button variant="secondary" size="sm" onClick={() => setFilter("all")}>
                  Show all budgets
                </Button>
              }
            />
          ) : (
            visible.map((budget, index) => {
              const percent = ratioToPercent(budget.spent, budget.allocated);
              const over = percent > 100;
              const watch = !over && percent >= WATCH_THRESHOLD;
              const remaining = budget.allocated - budget.spent;

              return (
                <div
                  key={budget.id}
                  className="rounded-card border border-line p-4 transition duration-200 ease-smooth hover:border-lineStrong hover:bg-surfaceMuted/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden
                        className="h-9 w-1.5 shrink-0 rounded-pill"
                        style={{ backgroundColor: categoryMap[budget.categoryId].color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{budget.label}</p>
                        <p className="truncate text-xs text-inkMuted">
                          {budget.period} · owned by {budget.owner}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="numeric font-semibold text-ink">
                          {fmt.money(budget.spent)}
                          <span className="text-sm font-normal text-inkMuted">
                            {" / "}
                            {fmt.money(budget.allocated)}
                          </span>
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs font-medium",
                            over ? "text-loss-600 dark:text-loss-400" : "text-inkMuted"
                          )}
                        >
                          {over
                            ? `${fmt.money(Math.abs(remaining))} over`
                            : `${fmt.money(remaining)} left`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Pencil}
                        onClick={() => openEdit(budget)}
                        aria-label={`Edit ${budget.label}`}
                      />
                    </div>
                  </div>

                  <Progress
                    value={percent}
                    color={categoryMap[budget.categoryId].color}
                    className="mt-4"
                    delayMs={index * 70}
                    label={`${budget.label} budget used`}
                  />

                  <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                    <span
                      className={cn(
                        "numeric font-medium",
                        over ? "font-semibold text-loss-600 dark:text-loss-400" : "text-inkMuted"
                      )}
                    >
                      {percent.toFixed(0)}% used
                    </span>
                    {over ? (
                      <span className="inline-flex items-center gap-1.5 rounded-pill bg-loss-100 px-2.5 py-1 font-medium text-loss-700 dark:bg-loss-900/40 dark:text-loss-300">
                        <AlertTriangle size={12} aria-hidden /> Over budget
                      </span>
                    ) : watch ? (
                      <span className="inline-flex items-center gap-1.5 rounded-pill bg-caution-100 px-2.5 py-1 font-medium text-caution-700 dark:bg-caution-900/40 dark:text-caution-300">
                        <AlertTriangle size={12} aria-hidden /> Near limit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-pill bg-gain-100 px-2.5 py-1 font-medium text-gain-700 dark:bg-gain-900/40 dark:text-gain-300">
                        <CheckCircle2 size={12} aria-hidden /> On track
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
        title={draft.id ? "Edit budget" : "Create a budget"}
        description={
          draft.id
            ? "Changing the allocation re-evaluates this category's status immediately."
            : "Set a monthly allocation. Spend is tracked against it automatically."
        }
        onClose={() => setModalOpen(false)}
        onSubmit={saveBudget}
        submitLabel={draft.id ? "Save changes" : "Create budget"}
      >
        <div className="space-y-4">
          <Field label="Budget name">
            <Input
              value={draft.label}
              onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
              placeholder="e.g. Recruiting"
              aria-label="Budget name"
            />
          </Field>

          <Field label="Category">
            <Select
              value={draft.categoryId}
              aria-label="Budget category"
              onChange={(event) =>
                setDraft((current) => ({ ...current, categoryId: event.target.value as CategoryId }))
              }
            >
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Monthly allocation (USD)" hint="Entered in USD regardless of display currency.">
            <Input
              value={draft.amount}
              onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
              inputMode="decimal"
              placeholder="e.g. 6000"
              aria-label="Monthly allocation in US dollars"
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
