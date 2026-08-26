import type { Budget, ForecastScenario, SavingsGoal, TaxPeriod } from "@/lib/types";

export const budgets: Budget[] = [
  { id: "b-payroll", categoryId: "payroll", label: "Payroll & Benefits", allocated: 145000, spent: 139180, period: "July 2026", owner: "Sarah Kim" },
  { id: "b-software", categoryId: "software", label: "Software & SaaS", allocated: 18000, spent: 17402, period: "July 2026", owner: "Mia Patel" },
  { id: "b-marketing", categoryId: "marketing", label: "Marketing", allocated: 18000, spent: 19640, period: "July 2026", owner: "Daniel Ross" },
  { id: "b-office", categoryId: "office", label: "Office & Rent", allocated: 18000, spent: 17310, period: "July 2026", owner: "Ava Liu" },
  { id: "b-travel", categoryId: "travel", label: "Travel", allocated: 9000, spent: 6720, period: "July 2026", owner: "Daniel Ross" },
  { id: "b-professional", categoryId: "professional", label: "Professional Fees", allocated: 12000, spent: 10240, period: "July 2026", owner: "Sarah Kim" },
  { id: "b-equipment", categoryId: "equipment", label: "Equipment", allocated: 8000, spent: 7940, period: "July 2026", owner: "Mia Patel" },
  { id: "b-insurance", categoryId: "insurance", label: "Insurance", allocated: 5000, spent: 4600, period: "July 2026", owner: "Ava Liu" },
  { id: "b-recruiting", categoryId: "recruiting", label: "Recruiting", allocated: 4000, spent: 1560, period: "July 2026", owner: "Daniel Ross" },
  { id: "b-training", categoryId: "training", label: "Training & Development", allocated: 3000, spent: 1880, period: "July 2026", owner: "Noah Bennett" }
];

export const savingsGoals: SavingsGoal[] = [
  {
    id: "g-runway",
    name: "12-Month Runway Reserve",
    purpose: "Hold a full year of fixed operating cost in liquid reserve.",
    target: 420000,
    saved: 298400,
    monthlyContribution: 14000,
    targetDate: "2027-06-30",
    accountId: "acc-growth"
  },
  {
    id: "g-office",
    name: "Second Office, Austin",
    purpose: "Fit-out, deposit, and the first six months of lease.",
    target: 180000,
    saved: 74600,
    monthlyContribution: 9500,
    targetDate: "2027-09-01",
    accountId: "acc-growth"
  },
  {
    id: "g-tax",
    name: "Q4 Tax Set-Aside",
    purpose: "Estimated federal and state liability for the fourth quarter.",
    target: 96000,
    saved: 88500,
    monthlyContribution: 8000,
    targetDate: "2026-12-15",
    accountId: "acc-reserve"
  },
  {
    id: "g-equipment",
    name: "Hardware Refresh Cycle",
    purpose: "Rolling three-year replacement fund for laptops and displays.",
    target: 60000,
    saved: 21750,
    monthlyContribution: 3000,
    targetDate: "2027-03-31",
    accountId: "acc-growth"
  },
  {
    id: "g-acquisition",
    name: "Acquisition War Chest",
    purpose: "Opportunistic fund for acquiring a complementary product team.",
    target: 750000,
    saved: 142000,
    monthlyContribution: 12000,
    targetDate: "2028-06-30",
    accountId: "acc-growth"
  }
];

/**
 * Scenarios for the cashflow projection. Growth figures are month-over-month
 * multipliers applied to the trailing three-month average, so "Base case" of
 * 1.02 means revenue compounding at 2% a month.
 */
export const forecastScenarios: ForecastScenario[] = [
  {
    id: "conservative",
    label: "Conservative",
    description: "Growth stalls, costs drift up with inflation, no new hires.",
    revenueGrowth: 0.995,
    expenseGrowth: 1.012,
    additionalMonthlyCost: 0
  },
  {
    id: "base",
    label: "Base case",
    description: "Current trajectory continues; two planned hires land in month three.",
    revenueGrowth: 1.022,
    expenseGrowth: 1.008,
    additionalMonthlyCost: 21000
  },
  {
    id: "aggressive",
    label: "Aggressive",
    description: "Pipeline converts, sales team doubles, marketing spend steps up.",
    revenueGrowth: 1.055,
    expenseGrowth: 1.031,
    additionalMonthlyCost: 48000
  }
];

export const taxPeriods: TaxPeriod[] = [
  {
    id: "tax-2025-q3",
    label: "Q3 2025",
    quarter: "Q3",
    periodStart: "2025-07-01",
    periodEnd: "2025-09-30",
    dueOn: "2025-10-15",
    taxableIncome: 318400,
    estimatedTax: 79600,
    paid: 79600,
    status: "filed"
  },
  {
    id: "tax-2025-q4",
    label: "Q4 2025",
    quarter: "Q4",
    periodStart: "2025-10-01",
    periodEnd: "2025-12-31",
    dueOn: "2026-01-15",
    taxableIncome: 341900,
    estimatedTax: 85475,
    paid: 85475,
    status: "filed"
  },
  {
    id: "tax-2026-q1",
    label: "Q1 2026",
    quarter: "Q1",
    periodStart: "2026-01-01",
    periodEnd: "2026-03-31",
    dueOn: "2026-04-15",
    taxableIncome: 372600,
    estimatedTax: 93150,
    paid: 93150,
    status: "filed"
  },
  {
    id: "tax-2026-q2",
    label: "Q2 2026",
    quarter: "Q2",
    periodStart: "2026-04-01",
    periodEnd: "2026-06-30",
    dueOn: "2026-07-15",
    taxableIncome: 398200,
    estimatedTax: 99550,
    paid: 71000,
    status: "due"
  },
  {
    id: "tax-2026-q3",
    label: "Q3 2026",
    quarter: "Q3",
    periodStart: "2026-07-01",
    periodEnd: "2026-09-30",
    dueOn: "2026-10-15",
    taxableIncome: 142900,
    estimatedTax: 35725,
    paid: 0,
    status: "upcoming"
  }
];

/** Effective blended federal + state rate used for the estimate line. */
export const effectiveTaxRate = 25;
