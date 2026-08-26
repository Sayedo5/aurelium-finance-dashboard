"use client";

import { useMemo, useState } from "react";
import { CreditCard, Landmark, PiggyBank, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/lib/hooks";
import { accounts, categoryMap, transactions } from "@/lib/mock-data";
import { creditOutstanding, netWorth, signedAmount, totalBalance } from "@/lib/selectors";
import { cn, formatCurrency, formatDate, formatSigned } from "@/lib/utils";
import type { AccountKind } from "@/lib/types";

const kindIcon: Record<AccountKind, LucideIcon> = {
  checking: Landmark,
  savings: PiggyBank,
  reserve: ShieldCheck,
  credit: CreditCard
};

const kindLabel: Record<AccountKind, string> = {
  checking: "Checking",
  savings: "Savings",
  reserve: "Reserve",
  credit: "Credit card"
};

export function AccountsPage() {
  const loading = useSimulatedLoading();
  const [selectedId, setSelectedId] = useState(accounts[0].id);

  const selected = accounts.find((account) => account.id === selectedId) ?? accounts[0];

  const accountActivity = useMemo(
    () => transactions.filter((tx) => tx.accountId === selected.id).slice(0, 8),
    [selected.id]
  );

  const monthFlow = useMemo(() => {
    const rows = transactions.filter(
      (tx) => tx.accountId === selected.id && tx.date.startsWith("2026-07") && tx.status !== "failed"
    );
    const inflow = rows.filter((tx) => tx.direction === "income").reduce((sum, tx) => sum + tx.amount, 0);
    const outflow = rows.filter((tx) => tx.direction === "expense").reduce((sum, tx) => sum + tx.amount, 0);
    return { inflow, outflow };
  }, [selected.id]);

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Cash on hand" value={totalBalance} icon={Landmark} caption="checking, savings, reserve" loading={loading} />
        <StatCard label="Credit outstanding" value={creditOutstanding} icon={CreditCard} caption="due 15 Aug" loading={loading} />
        <StatCard label="Net position" value={netWorth} icon={PiggyBank} delta={3.8} caption="vs. June" loading={loading} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-52 w-full" />)
          : accounts.map((account) => {
              const Icon = kindIcon[account.kind];
              const active = account.id === selectedId;
              const utilisation =
                account.limit !== undefined ? (account.balance / account.limit) * 100 : undefined;

              return (
                <button
                  key={account.id}
                  onClick={() => setSelectedId(account.id)}
                  className={cn(
                    "group rounded-[28px] border p-5 text-left shadow-soft backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-luxe",
                    active
                      ? "border-brand-400 bg-gradient-to-br from-brand-500/15 to-accent-500/10 ring-2 ring-brand-400/40"
                      : "border-line bg-white/70 dark:bg-slate-950/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-white/70 text-brand-600 dark:bg-slate-950/60 dark:text-brand-300">
                      <Icon size={19} />
                    </span>
                    <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-inkMuted">
                      {kindLabel[account.kind]}
                    </span>
                  </div>

                  <p className="mt-4 truncate text-sm font-semibold">{account.name}</p>
                  <p className="truncate text-xs text-inkMuted">
                    {account.institution} ··{account.mask}
                  </p>

                  <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
                    {formatCurrency(account.balance, 2)}
                  </p>

                  {utilisation !== undefined ? (
                    <>
                      <Progress value={utilisation} color="#f59e0b" className="mt-3 h-2" />
                      <p className="mt-2 text-xs text-inkMuted">
                        {utilisation.toFixed(0)}% of {formatCurrency(account.limit ?? 0)} limit
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-inkMuted">
                      {formatCurrency(account.available, 2)} available
                    </p>
                  )}
                </button>
              );
            })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">{selected.name}</h2>
              <p className="text-sm text-inkMuted">Recent activity on this account</p>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-inkMuted">
              ··{selected.mask}
            </span>
          </div>

          <div className="mt-4 space-y-1">
            {accountActivity.length === 0 ? (
              <p className="py-10 text-center text-sm text-inkMuted">
                No activity recorded on this account yet.
              </p>
            ) : (
              accountActivity.map((tx) => {
                const signed = signedAmount(tx);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-white/70 dark:hover:bg-white/5"
                  >
                    <span
                      className="h-9 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: categoryMap[tx.categoryId].color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{tx.merchant}</p>
                      <p className="truncate text-xs text-inkMuted">
                        {formatDate(tx.date)} · {tx.method}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <StatusBadge status={tx.status} />
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        signed >= 0 ? "text-brand-600 dark:text-brand-300" : "text-ink"
                      )}
                    >
                      {formatSigned(signed, 2)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold">July flow</h2>
            <p className="text-sm text-inkMuted">Money in and out of {selected.name}</p>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
                <dt className="text-sm text-inkMuted">Inflow</dt>
                <dd className="font-semibold tabular-nums text-brand-600 dark:text-brand-300">
                  {formatCurrency(monthFlow.inflow)}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
                <dt className="text-sm text-inkMuted">Outflow</dt>
                <dd className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                  {formatCurrency(monthFlow.outflow)}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-white dark:bg-white dark:text-slate-950">
                <dt className="text-sm">Net</dt>
                <dd className="font-semibold tabular-nums">
                  {formatSigned(monthFlow.inflow - monthFlow.outflow)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Account details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Institution</dt>
                <dd className="text-right font-medium">{selected.institution}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Type</dt>
                <dd className="text-right font-medium">{kindLabel[selected.kind]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Available</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatCurrency(selected.available, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Opened</dt>
                <dd className="text-right font-medium">{formatDate(selected.openedOn)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-inkMuted">Currency</dt>
                <dd className="text-right font-medium">{selected.currency}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </section>
    </>
  );
}
