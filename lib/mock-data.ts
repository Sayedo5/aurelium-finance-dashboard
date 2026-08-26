/**
 * Barrel for the mock dataset.
 *
 * The data grew past what one file could hold comfortably, so it lives in
 * `lib/data/*` by domain. Everything is re-exported here so imports stay short
 * and existing call sites keep working.
 *
 * All of it is local and deterministic — no backend, no `Math.random()`, no
 * `Date.now()` — so the server and client render byte-identical output and the
 * numbers never shift between reloads.
 */

export { company, categories, categoryMap, expenseCategories, accounts, accountMap } from "@/lib/data/core";

export {
  permissionCatalogue,
  roles,
  roleMap,
  teamMembers,
  teamMap,
  accountManagers
} from "@/lib/data/team";

export { clients, clientMap, billableClients, industries } from "@/lib/data/clients";

export { months, monthKeys, transactions, monthlySeries } from "@/lib/data/ledger";

export {
  invoices,
  invoiceMap,
  invoiceSubtotal,
  invoiceTax,
  invoiceTotal,
  isOutstanding,
  daysOverdue,
  ageingBucket,
  ageingBuckets,
  ageingLabels,
  clientLifetimeValue,
  clientOutstanding,
  clientRevenue,
  clientRevenueMap
} from "@/lib/data/invoices";

export {
  vendors,
  vendorMap,
  bills,
  billMap,
  isPayable,
  billDaysUntilDue,
  vendorOutstanding,
  vendorLifetimeSpend,
  vendorSpend
} from "@/lib/data/bills";

export {
  budgets,
  savingsGoals,
  forecastScenarios,
  taxPeriods,
  effectiveTaxRate
} from "@/lib/data/planning";

export {
  auditEvents,
  auditActions,
  auditTargets,
  calendarEvents,
  upcomingEvents,
  notifications
} from "@/lib/data/governance";

export { navigation, navigationItems, marketingNav } from "@/lib/data/navigation";

export {
  TODAY,
  addDays,
  addMonths,
  daysBetween,
  monthLabel,
  monthLabelWithYear,
  monthRange,
  parseDate
} from "@/lib/data/seed";
