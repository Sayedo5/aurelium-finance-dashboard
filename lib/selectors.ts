import { accounts, categoryMap, monthlySeries, transactions } from "@/lib/mock-data";
import type { CategoryId, Transaction } from "@/lib/types";

/** Money moved between the company's own accounts is not income or spend. */
export const isCashflow = (tx: Transaction) =>
  tx.categoryId !== "transfers" && tx.status !== "failed";

export const totalBalance = accounts
  .filter((account) => account.kind !== "credit")
  .reduce((sum, account) => sum + account.balance, 0);

export const creditOutstanding = accounts
  .filter((account) => account.kind === "credit")
  .reduce((sum, account) => sum + account.balance, 0);

export const netWorth = totalBalance - creditOutstanding;

export const currentMonth = monthlySeries[monthlySeries.length - 1];
export const previousMonth = monthlySeries[monthlySeries.length - 2];

/** Spend per expense category for a given month key, largest first. */
export function spendByCategory(monthKey?: string) {
  const totals = new Map<CategoryId, number>();

  transactions
    .filter(
      (tx) =>
        tx.direction === "expense" &&
        isCashflow(tx) &&
        (monthKey ? tx.date.startsWith(monthKey) : true)
    )
    .forEach((tx) => {
      totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
    });

  return Array.from(totals.entries())
    .map(([id, value]) => ({
      name: categoryMap[id].label,
      value: Math.round(value),
      color: categoryMap[id].color
    }))
    .sort((a, b) => b.value - a.value);
}

export function recentTransactions(count = 6) {
  return transactions.slice(0, count);
}

/** Signed amount: expenses negative, income positive. */
export function signedAmount(tx: Transaction) {
  return tx.direction === "income" ? tx.amount : -tx.amount;
}

export const largestExpense = transactions
  .filter((tx) => tx.direction === "expense" && isCashflow(tx))
  .reduce((max, tx) => (tx.amount > max.amount ? tx : max), transactions[0]);

/** Share of income kept as profit in the most recent month. */
export const savingsRate =
  currentMonth.income > 0 ? (currentMonth.net / currentMonth.income) * 100 : 0;
