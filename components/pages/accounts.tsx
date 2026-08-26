"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Download,
  Landmark,
  PiggyBank,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { accounts, categoryMap, transactions } from "@/lib/mock-data";
import { creditOutstanding, netWorth, signedAmount, totalBalance } from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, ratioToPercent } from "@/lib/utils";
import type { AccountKind, Transaction } from "@/lib/types";

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

const ACTIVITY_LIMIT = 8;

export function AccountsPage() {
  const { refreshKey, addToast } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [selectedId, setSelectedId] = useState(accounts[0].id);
  const selected = accounts.find((account) => account.id === selectedId) ?? accounts[0];

  /** Every transaction on the selected account, newest first. */
  const accountLedger = useMemo(
    () => transactions.filter((tx) => tx.accountId === selected.id),
    [selected.id]
  );

  const accountActivity = accountLedger.slice(0, ACTIVITY_LIMIT);

  const monthFlow = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const tx of accountLedger) {
      if (!tx.date.startsWith("2026-07") || tx.status === "failed") continue;
      if (tx.direction === "income") inflow += tx.amount;
      else outflow += tx.amount;
    }
    return { inflow, outflow };
  }, [accountLedger]);

  function exportStatement() {
    if (accountLedger.length === 0) {
      addToast({
        title: "Nothing to export",
        body: `${selected.name} has no recorded activity.`,
        tone: "warning"
      });
      return;
    }

    const csv = toCsv<Transaction>(accountLedger, [
      { header: "Date", value: (tx) => tx.date },
      { header: "Merchant", value: (tx) => tx.merchant },
      { header: "Memo", value: (tx) => tx.memo },
      { header: "Category", value: (tx) => categoryMap[tx.categoryId].label },
      { header: "Method", value: (tx) => tx.method },
      { header: "Status", value: (tx) => tx.status },
      { header: "Amount (USD)", value: (tx) => signedAmount(tx).toFixed(2) }
    ]);

    const ok = downloadCsv(csvFilename("statement", selected.mask), csv);
    addToast(
      ok
        ? {
            title: "Statement downloaded",
            body: `${accountLedger.length} rows from ${selected.name}.`,
            tone: "success"
          }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  return (
    <>
      <section aria-label="Position summary" className="grid animate-rise gap-4 sm:grid-cols-3">
        <StatCard
          label="Cash on hand"
          value={totalBalance}
          icon={Landmark}
          caption="checking, savings, reserve"
          loading={loading}
        />
        <StatCard
          label="Credit outstanding"
          value={creditOutstanding}
          icon={CreditCard}
          caption="statement due 15 Aug"
          loading={loading}
          tone="loss"
        />
        <StatCard
          label="Net position"
          value={netWorth}
          icon={PiggyBank}
          delta={3.8}
          caption="vs. June"
          loading={loading}
        />
      </section>

      <section
        aria-label="Accounts"
        className="grid animate-rise gap-4 stagger-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-card" />
            ))
          : accounts.map((account) => {
              const Icon = kindIcon[account.kind];
              const active = account.id === selectedId;
              const utilisation =
                account.limit !== undefined ? ratioToPercent(account.balance, account.limit) : undefined;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelectedId(account.id)}
                  aria-pressed={active}
                  className={cn(
                    "panel p-5 text-left transition duration-200 ease-smooth",
                    "hover:-translate-y-0.5 hover:shadow-lift",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                    active
                      ? "border-aurum-400/60 shadow-lift ring-1 ring-aurum-400/40"
                      : "hover:border-lineStrong"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-control border border-line transition-colors",
                        active
                          ? "bg-aurum-400/12 text-aurum-600 dark:text-aurum-400"
                          : "bg-surfaceMuted text-inkMuted"
                      )}
                    >
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="rounded-pill border border-line px-2.5 py-1 text-[11px] font-medium text-inkMuted">
                      {kindLabel[account.kind]}
                    </span>
                  </div>

                  <p className="mt-4 truncate text-sm font-semibold text-ink">{account.name}</p>
                  <p className="truncate text-xs text-inkMuted">
                    {account.institution} ··{account.mask}
                  </p>

                  <p className="numeric mt-3 text-2xl font-semibold">
                    {fmt.money(account.balance, 2)}
                  </p>

                  {utilisation !== undefined ? (
                    <>
                      <Progress
                        value={utilisation}
                        color="#e8b34a"
                        className="mt-3"
                        label={`${account.name} credit utilisation`}
                      />
                      <p className="mt-2 text-xs text-inkMuted">
                        {utilisation.toFixed(0)}% of {fmt.money(account.limit ?? 0)} limit
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-inkMuted">
                      {fmt.money(account.available, 2)} available
                    </p>
                  )}
                </button>
              );
            })}
      </section>

      <section className="grid animate-rise gap-4 stagger-2 xl:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
        <Card>
          <CardHeader
            title={selected.name}
            description={`Most recent ${Math.min(ACTIVITY_LIMIT, accountLedger.length)} of ${accountLedger.length} entries`}
            actions={
              <Button variant="secondary" size="sm" icon={Download} onClick={exportStatement}>
                Statement
              </Button>
            }
          />

          <ul className="mt-4 space-y-0.5">
            {accountActivity.length === 0 ? (
              <li>
                <EmptyState
                  title="No activity on this account"
                  description="Transactions posted to this account will appear here."
                />
              </li>
            ) : (
              accountActivity.map((tx) => {
                const signed = signedAmount(tx);
                return (
                  <li
                    key={tx.id}
                    className="flex items-center gap-3 rounded-control px-2 py-2.5 transition-colors duration-150 hover:bg-surfaceMuted"
                  >
                    <span
                      aria-hidden
                      className="h-8 w-1 shrink-0 rounded-pill"
                      style={{ backgroundColor: categoryMap[tx.categoryId].color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{tx.merchant}</p>
                      <p className="truncate text-xs text-inkMuted">
                        {fmt.date(tx.date)} · {tx.method}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <StatusBadge status={tx.status} />
                    </div>
                    <p
                      className={cn(
                        "numeric shrink-0 text-sm font-semibold",
                        signed >= 0 ? "text-gain-600 dark:text-gain-400" : "text-ink"
                      )}
                    >
                      {fmt.signed(signed, 2)}
                    </p>
                  </li>
                );
              })
            )}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="July flow" description={`Money in and out of ${selected.name}`} />
            <dl className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3 rounded-control border border-line px-4 py-3">
                <dt className="flex items-center gap-2 text-sm text-inkMuted">
                  <ArrowDownLeft size={15} className="text-gain-600 dark:text-gain-400" aria-hidden />
                  Inflow
                </dt>
                <dd className="numeric font-semibold text-gain-600 dark:text-gain-400">
                  {fmt.money(monthFlow.inflow)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-control border border-line px-4 py-3">
                <dt className="flex items-center gap-2 text-sm text-inkMuted">
                  <ArrowUpRight size={15} className="text-loss-600 dark:text-loss-400" aria-hidden />
                  Outflow
                </dt>
                <dd className="numeric font-semibold text-loss-600 dark:text-loss-400">
                  {fmt.money(monthFlow.outflow)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-control bg-surfaceMuted px-4 py-3 ring-1 ring-line">
                <dt className="text-sm font-medium text-ink">Net</dt>
                <dd className="numeric font-semibold text-ink">
                  {fmt.signed(monthFlow.inflow - monthFlow.outflow)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Account details" />
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                { term: "Institution", detail: selected.institution },
                { term: "Type", detail: kindLabel[selected.kind] },
                { term: "Available", detail: fmt.money(selected.available, 2) },
                { term: "Opened", detail: fmt.date(selected.openedOn) },
                { term: "Currency", detail: selected.currency }
              ].map((row) => (
                <div key={row.term} className="flex justify-between gap-4">
                  <dt className="text-inkMuted">{row.term}</dt>
                  <dd className="text-right font-medium text-ink">{row.detail}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </section>
    </>
  );
}
