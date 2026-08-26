import {
  accountMap,
  accounts,
  ageingBucket,
  ageingBuckets,
  bills,
  billMap,
  categoryMap,
  clientMap,
  clients,
  invoices,
  invoiceTotal,
  isOutstanding,
  isPayable,
  monthlySeries,
  months,
  savingsGoals,
  taxPeriods,
  transactions,
  vendorMap,
  vendors
} from "@/lib/mock-data";
import type {
  AgeingBucket,
  CategoryId,
  ForecastPoint,
  ForecastScenario,
  MonthlyPoint,
  ReportSection,
  Transaction
} from "@/lib/types";

/* ---------------------------------------------------------------------------
 * Cash position
 * ------------------------------------------------------------------------ */

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

export const currentMonthKey = months[months.length - 1].key;

/** Share of income kept as profit in the most recent month. */
export const savingsRate =
  currentMonth.income > 0 ? (currentMonth.net / currentMonth.income) * 100 : 0;

/* ---------------------------------------------------------------------------
 * Category and merchant aggregation
 * ------------------------------------------------------------------------ */

export interface BreakdownSlice {
  name: string;
  value: number;
  color: string;
}

/**
 * Spend per expense category for a given month key, largest first.
 *
 * The ledger is immutable, so results are cached by month key — several pages
 * call this on every render and the aggregation walks ~600 rows each time.
 */
const spendCache = new Map<string, BreakdownSlice[]>();

export function spendByCategory(monthKey?: string): BreakdownSlice[] {
  const cacheKey = monthKey ?? "all";
  const cached = spendCache.get(cacheKey);
  if (cached) return cached;

  const totals = new Map<CategoryId, number>();

  for (const tx of transactions) {
    if (tx.direction !== "expense" || !isCashflow(tx)) continue;
    if (monthKey && !tx.date.startsWith(monthKey)) continue;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
  }

  const result = Array.from(totals.entries())
    .map(([id, value]) => ({
      name: categoryMap[id].label,
      value: Math.round(value),
      color: categoryMap[id].color
    }))
    .sort((a, b) => b.value - a.value);

  spendCache.set(cacheKey, result);
  return result;
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

/** Total spend per merchant across the whole window, largest first. */
export const merchantTotals = (() => {
  const totals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.direction !== "expense" || !isCashflow(tx)) continue;
    totals.set(tx.merchant, (totals.get(tx.merchant) ?? 0) + tx.amount);
  }
  return Array.from(totals.entries())
    .map(([merchant, value]) => ({ merchant, value }))
    .sort((a, b) => b.value - a.value);
})();

/* ---------------------------------------------------------------------------
 * Receivables
 * ------------------------------------------------------------------------ */

export const outstandingInvoices = invoices.filter(isOutstanding);

export const totalReceivable = Math.round(
  outstandingInvoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
);

export const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue");

export const totalOverdue = Math.round(
  overdueInvoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
);

/** Receivables split into ageing buckets — the standard A/R report. */
export const receivableAgeing = ageingBuckets.map((bucket) => {
  const rows = outstandingInvoices.filter((invoice) => ageingBucket(invoice) === bucket);
  return {
    bucket,
    count: rows.length,
    value: Math.round(rows.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0))
  };
});

/** Mean days between issue and payment across settled invoices. */
export const daysSalesOutstanding = (() => {
  const paid = invoices.filter((invoice) => invoice.status === "paid" && invoice.paidOn);
  if (!paid.length) return 0;
  const total = paid.reduce((sum, invoice) => {
    const issued = new Date(`${invoice.issuedOn}T00:00:00Z`).getTime();
    const settled = new Date(`${invoice.paidOn}T00:00:00Z`).getTime();
    return sum + Math.max(0, Math.round((settled - issued) / 86400000));
  }, 0);
  return Math.round(total / paid.length);
})();

/** Invoiced total per month, for the revenue-vs-collections chart. */
export const invoicedByMonth: Array<{ month: string; invoiced: number; collected: number }> =
  months.map((month) => {
    let invoiced = 0;
    let collected = 0;

    for (const invoice of invoices) {
      if (invoice.status === "draft" || invoice.status === "void") continue;
      if (invoice.issuedOn.startsWith(month.key)) invoiced += invoiceTotal(invoice);
      if (invoice.paidOn?.startsWith(month.key)) collected += invoiceTotal(invoice);
    }

    return {
      month: month.label,
      invoiced: Math.round(invoiced),
      collected: Math.round(collected)
    };
  });

/* ---------------------------------------------------------------------------
 * Payables
 * ------------------------------------------------------------------------ */

export const payableBills = bills.filter(isPayable);

export const totalPayable = Math.round(
  payableBills.reduce((sum, bill) => sum + bill.amount, 0)
);

export const overdueBills = bills.filter((bill) => bill.status === "overdue");

export const totalBillsOverdue = Math.round(
  overdueBills.reduce((sum, bill) => sum + bill.amount, 0)
);

/** Net working-capital position: what is owed to us minus what we owe. */
export const workingCapital = totalReceivable - totalPayable;

/* ---------------------------------------------------------------------------
 * Reports
 * ------------------------------------------------------------------------ */

function sumCategory(categoryId: CategoryId, monthKey: string, direction: "income" | "expense") {
  let total = 0;
  for (const tx of transactions) {
    if (tx.categoryId !== categoryId || tx.direction !== direction) continue;
    if (!tx.date.startsWith(monthKey) || tx.status === "failed") continue;
    total += tx.amount;
  }
  return Math.round(total);
}

/**
 * Profit and loss for a month, compared with the month before it.
 *
 * Cost of revenue is a share of payroll and infrastructure; the split is a
 * modelling assumption made explicit here rather than buried in the view.
 */
export function profitAndLoss(monthKey: string, comparisonKey: string): ReportSection[] {
  const pair = (categoryId: CategoryId, direction: "income" | "expense") => ({
    current: sumCategory(categoryId, monthKey, direction),
    previous: sumCategory(categoryId, comparisonKey, direction)
  });

  const revenue = pair("revenue", "income");
  const interest = pair("interest", "income");
  const payroll = pair("payroll", "expense");
  const software = pair("software", "expense");

  // 60% of payroll and 70% of infrastructure are treated as cost of revenue.
  const cogs = {
    current: Math.round(payroll.current * 0.6 + software.current * 0.7),
    previous: Math.round(payroll.previous * 0.6 + software.previous * 0.7)
  };

  const totalRevenue = {
    current: revenue.current + interest.current,
    previous: revenue.previous + interest.previous
  };

  const grossProfit = {
    current: totalRevenue.current - cogs.current,
    previous: totalRevenue.previous - cogs.previous
  };

  const operatingCategories: CategoryId[] = [
    "marketing",
    "office",
    "travel",
    "professional",
    "equipment",
    "insurance",
    "training",
    "recruiting",
    "shipping",
    "meals"
  ];

  const operatingLines = operatingCategories.map((categoryId) => ({
    label: categoryMap[categoryId].label,
    ...pair(categoryId, "expense"),
    detail: true
  }));

  // The remaining 40% of payroll and 30% of infrastructure sit below the line.
  const residualPayroll = {
    label: "Payroll (operating share)",
    current: payroll.current - Math.round(payroll.current * 0.6),
    previous: payroll.previous - Math.round(payroll.previous * 0.6),
    detail: true
  };
  const residualSoftware = {
    label: "Software (operating share)",
    current: software.current - Math.round(software.current * 0.7),
    previous: software.previous - Math.round(software.previous * 0.7),
    detail: true
  };

  const allOperating = [residualPayroll, residualSoftware, ...operatingLines];
  const totalOperating = {
    current: allOperating.reduce((sum, line) => sum + line.current, 0),
    previous: allOperating.reduce((sum, line) => sum + line.previous, 0)
  };

  const operatingIncome = {
    current: grossProfit.current - totalOperating.current,
    previous: grossProfit.previous - totalOperating.previous
  };

  const tax = pair("taxes", "expense");

  return [
    {
      title: "Revenue",
      lines: [
        { label: "Client revenue", ...revenue, detail: true },
        { label: "Interest income", ...interest, detail: true },
        { label: "Total revenue", ...totalRevenue, total: true }
      ]
    },
    {
      title: "Cost of revenue",
      lines: [
        { label: "Delivery payroll", current: Math.round(payroll.current * 0.6), previous: Math.round(payroll.previous * 0.6), detail: true },
        { label: "Infrastructure", current: Math.round(software.current * 0.7), previous: Math.round(software.previous * 0.7), detail: true },
        { label: "Total cost of revenue", ...cogs, total: true },
        { label: "Gross profit", ...grossProfit, total: true }
      ]
    },
    {
      title: "Operating expenses",
      lines: [...allOperating, { label: "Total operating expenses", ...totalOperating, total: true }]
    },
    {
      title: "Result",
      lines: [
        { label: "Operating income", ...operatingIncome, total: true },
        { label: "Income tax", ...tax, detail: true },
        {
          label: "Net income",
          current: operatingIncome.current - tax.current,
          previous: operatingIncome.previous - tax.previous,
          total: true
        }
      ]
    }
  ];
}

/**
 * Balance sheet at the reporting date. Fixed assets and long-term liabilities
 * are modelling constants — the mock ledger has no depreciation schedule.
 */
export function balanceSheet(): ReportSection[] {
  const cash = accounts
    .filter((account) => account.kind !== "credit")
    .map((account) => ({
      label: account.name,
      current: Math.round(account.balance),
      // Previous period is modelled at 94% of current, a plausible month of growth.
      previous: Math.round(account.balance * 0.94),
      detail: true
    }));

  const totalCash = {
    current: cash.reduce((sum, line) => sum + line.current, 0),
    previous: cash.reduce((sum, line) => sum + line.previous, 0)
  };

  const receivables = { current: totalReceivable, previous: Math.round(totalReceivable * 1.08) };
  const prepaid = { current: 24800, previous: 22100 };

  const totalCurrentAssets = {
    current: totalCash.current + receivables.current + prepaid.current,
    previous: totalCash.previous + receivables.previous + prepaid.previous
  };

  const equipment = { current: 148500, previous: 152300 };
  const intangibles = { current: 62000, previous: 64500 };

  const totalAssets = {
    current: totalCurrentAssets.current + equipment.current + intangibles.current,
    previous: totalCurrentAssets.previous + equipment.previous + intangibles.previous
  };

  const payables = { current: totalPayable, previous: Math.round(totalPayable * 1.11) };
  const creditCard = { current: Math.round(creditOutstanding), previous: 21400 };
  const accruedTax = { current: 28550, previous: 41200 };

  const totalCurrentLiabilities = {
    current: payables.current + creditCard.current + accruedTax.current,
    previous: payables.previous + creditCard.previous + accruedTax.previous
  };

  const loan = { current: 95000, previous: 102000 };

  const totalLiabilities = {
    current: totalCurrentLiabilities.current + loan.current,
    previous: totalCurrentLiabilities.previous + loan.previous
  };

  const equity = {
    current: totalAssets.current - totalLiabilities.current,
    previous: totalAssets.previous - totalLiabilities.previous
  };

  return [
    {
      title: "Assets",
      lines: [
        ...cash,
        { label: "Total cash", ...totalCash, total: true },
        { label: "Accounts receivable", ...receivables, detail: true },
        { label: "Prepaid expenses", ...prepaid, detail: true },
        { label: "Total current assets", ...totalCurrentAssets, total: true },
        { label: "Equipment, net", ...equipment, detail: true },
        { label: "Intangibles, net", ...intangibles, detail: true },
        { label: "Total assets", ...totalAssets, total: true }
      ]
    },
    {
      title: "Liabilities",
      lines: [
        { label: "Accounts payable", ...payables, detail: true },
        { label: "Credit card", ...creditCard, detail: true },
        { label: "Accrued tax", ...accruedTax, detail: true },
        { label: "Total current liabilities", ...totalCurrentLiabilities, total: true },
        { label: "Long-term loan", ...loan, detail: true },
        { label: "Total liabilities", ...totalLiabilities, total: true }
      ]
    },
    {
      title: "Equity",
      lines: [
        { label: "Retained earnings", ...equity, detail: true },
        { label: "Total equity", ...equity, total: true }
      ]
    }
  ];
}

/** Indirect cashflow statement for a month. */
export function cashflowStatement(monthKey: string, comparisonKey: string): ReportSection[] {
  const index = months.findIndex((month) => month.key === monthKey);
  const prevIndex = months.findIndex((month) => month.key === comparisonKey);
  const point = monthlySeries[index] ?? currentMonth;
  const prevPoint = monthlySeries[prevIndex] ?? previousMonth;

  const depreciation = { current: 4200, previous: 4200, detail: true };
  const workingCapitalChange = {
    current: -Math.round(totalReceivable * 0.06),
    previous: -Math.round(totalReceivable * 0.09),
    detail: true
  };

  const operating = {
    current: point.net + depreciation.current + workingCapitalChange.current,
    previous: prevPoint.net + depreciation.previous + workingCapitalChange.previous
  };

  const capex = { current: -sumCategory("equipment", monthKey, "expense"), previous: -sumCategory("equipment", comparisonKey, "expense"), detail: true };
  const financing = { current: -7000, previous: -7000, detail: true };

  return [
    {
      title: "Operating activities",
      lines: [
        { label: "Net income", current: point.net, previous: prevPoint.net, detail: true },
        { label: "Depreciation & amortisation", ...depreciation },
        { label: "Change in working capital", ...workingCapitalChange },
        { label: "Net cash from operations", ...operating, total: true }
      ]
    },
    {
      title: "Investing activities",
      lines: [
        { label: "Equipment purchases", ...capex },
        { label: "Net cash used in investing", current: capex.current, previous: capex.previous, total: true }
      ]
    },
    {
      title: "Financing activities",
      lines: [
        { label: "Loan repayments", ...financing },
        { label: "Net cash used in financing", current: financing.current, previous: financing.previous, total: true }
      ]
    },
    {
      title: "Net movement",
      lines: [
        {
          label: "Net change in cash",
          current: operating.current + capex.current + financing.current,
          previous: operating.previous + capex.previous + financing.previous,
          total: true
        }
      ]
    }
  ];
}

/* ---------------------------------------------------------------------------
 * Forecasting
 * ------------------------------------------------------------------------ */

/**
 * Projects `horizon` months forward from the trailing three-month average,
 * compounding the scenario's growth rates and layering in any planned cost
 * from month three onward. Historic months are returned alongside so a chart
 * can show actuals and projection on one continuous axis.
 */
export function buildForecast(scenario: ForecastScenario, horizon = 12): ForecastPoint[] {
  const history = monthlySeries.slice(-6);
  const trailing = monthlySeries.slice(-3);

  const avgIncome = trailing.reduce((sum, point) => sum + point.income, 0) / trailing.length;
  const avgExpenses = trailing.reduce((sum, point) => sum + point.expenses, 0) / trailing.length;

  let balance = totalBalance;

  const actuals: ForecastPoint[] = history.map((point) => ({
    month: point.month,
    actual: true,
    income: point.income,
    expenses: point.expenses,
    net: point.net,
    balance: 0
  }));

  // Walk the historic balance backwards so the actual and projected lines meet.
  let runningBack = totalBalance;
  for (let i = actuals.length - 1; i >= 0; i -= 1) {
    actuals[i].balance = Math.round(runningBack);
    runningBack -= actuals[i].net;
  }

  const projection: ForecastPoint[] = [];
  let income = avgIncome;
  let expenses = avgExpenses;

  const labels = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  for (let i = 0; i < horizon; i += 1) {
    income *= scenario.revenueGrowth;
    expenses *= scenario.expenseGrowth;
    const extra = i >= 2 ? scenario.additionalMonthlyCost : 0;
    const net = income - expenses - extra;
    balance += net;

    projection.push({
      month: labels[i % labels.length],
      actual: false,
      income: Math.round(income),
      expenses: Math.round(expenses + extra),
      net: Math.round(net),
      balance: Math.round(balance)
    });
  }

  return [...actuals, ...projection];
}

/** Months of runway at the scenario's burn, or Infinity when cash-positive. */
export function runwayMonths(points: ForecastPoint[]): number {
  const projected = points.filter((point) => !point.actual);
  const burn = projected.slice(0, 3).reduce((sum, point) => sum + point.net, 0) / 3;
  if (burn >= 0) return Infinity;
  return Math.max(0, Math.floor(totalBalance / Math.abs(burn)));
}

/** First projected month where the balance goes negative, if any. */
export function breakEvenMonth(points: ForecastPoint[]): string | null {
  const found = points.find((point) => !point.actual && point.balance < 0);
  return found ? found.month : null;
}

/* ---------------------------------------------------------------------------
 * Tax
 * ------------------------------------------------------------------------ */

export const taxOutstanding = taxPeriods
  .filter((period) => period.status !== "filed")
  .reduce((sum, period) => sum + (period.estimatedTax - period.paid), 0);

export const taxYearToDate = taxPeriods
  .filter((period) => period.periodStart >= "2026-01-01")
  .reduce((sum, period) => sum + period.paid, 0);

/* ---------------------------------------------------------------------------
 * Global search
 *
 * Backs the topbar search field. Returns a flat, ranked list across everything
 * worth jumping to: invoices, clients, vendors, bills, transactions, accounts
 * and the navigation itself.
 * ------------------------------------------------------------------------ */

export type SearchResultKind =
  | "page"
  | "transaction"
  | "account"
  | "merchant"
  | "client"
  | "invoice"
  | "vendor"
  | "bill";

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  amount?: number;
  href: string;
}

export function searchAll(query: string, limit = 10): SearchResult[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const results: SearchResult[] = [];
  const push = (result: SearchResult) => {
    if (results.length < limit * 3) results.push(result);
  };

  for (const client of clients) {
    if (results.length >= limit * 3) break;
    if (
      client.name.toLowerCase().includes(needle) ||
      client.contactName.toLowerCase().includes(needle) ||
      client.industry.toLowerCase().includes(needle)
    ) {
      push({
        id: `client-${client.id}`,
        kind: "client",
        title: client.name,
        subtitle: `${client.industry} · ${client.city}`,
        href: `/dashboard/clients?client=${client.id}`
      });
    }
  }

  for (const invoice of invoices) {
    if (results.length >= limit * 3) break;
    const client = clientMap[invoice.clientId];
    if (
      invoice.number.toLowerCase().includes(needle) ||
      client?.name.toLowerCase().includes(needle)
    ) {
      push({
        id: `invoice-${invoice.id}`,
        kind: "invoice",
        title: invoice.number,
        subtitle: `${client?.name ?? "Client"} · ${invoice.status}`,
        amount: invoiceTotal(invoice),
        href: `/dashboard/invoices?q=${encodeURIComponent(invoice.number)}`
      });
    }
  }

  for (const account of accounts) {
    if (
      account.name.toLowerCase().includes(needle) ||
      account.institution.toLowerCase().includes(needle) ||
      account.mask.includes(needle)
    ) {
      push({
        id: `account-${account.id}`,
        kind: "account",
        title: account.name,
        subtitle: `${account.institution} ··${account.mask}`,
        amount: account.balance,
        href: "/dashboard/accounts"
      });
    }
  }

  for (const vendor of vendors) {
    if (results.length >= limit * 3) break;
    if (vendor.name.toLowerCase().includes(needle)) {
      push({
        id: `vendor-${vendor.id}`,
        kind: "vendor",
        title: vendor.name,
        subtitle: `Vendor · ${categoryMap[vendor.categoryId].label}`,
        href: `/dashboard/bills?q=${encodeURIComponent(vendor.name)}`
      });
    }
  }

  for (const bill of bills) {
    if (results.length >= limit * 3) break;
    if (bill.number.toLowerCase().includes(needle)) {
      push({
        id: `bill-${bill.id}`,
        kind: "bill",
        title: bill.number,
        subtitle: `${vendorMap[bill.vendorId]?.name ?? "Vendor"} · ${bill.status}`,
        amount: -bill.amount,
        href: `/dashboard/bills?q=${encodeURIComponent(bill.number)}`
      });
    }
  }

  let txMatches = 0;
  for (const tx of transactions) {
    if (txMatches >= 5) break;
    if (
      tx.merchant.toLowerCase().includes(needle) ||
      tx.memo.toLowerCase().includes(needle) ||
      tx.id.toLowerCase().includes(needle)
    ) {
      txMatches += 1;
      push({
        id: `tx-${tx.id}`,
        kind: "transaction",
        title: tx.merchant,
        subtitle: `${categoryMap[tx.categoryId].label} · ${accountMap[tx.accountId].name} · ${tx.date}`,
        amount: signedAmount(tx),
        href: `/dashboard/transactions?q=${encodeURIComponent(tx.merchant)}`
      });
    }
  }

  return results.slice(0, limit);
}

export { ageingBucket, ageingBuckets, invoiceTotal, isOutstanding, isPayable, billMap };
export type { AgeingBucket };
