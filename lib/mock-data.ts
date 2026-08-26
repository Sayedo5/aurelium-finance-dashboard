import {
  Banknote,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Wallet
} from "lucide-react";
import type {
  Account,
  Budget,
  Category,
  CategoryId,
  MonthlyPoint,
  NavItem,
  NotificationItem,
  SavingsGoal,
  Transaction,
  TxDirection,
  TxStatus
} from "@/lib/types";

export const company = {
  name: "Aurelium Ledger",
  shortName: "Aurelium",
  tagline: "Finance clarity for growing teams",
  owner: {
    name: "Sarah Kim",
    role: "Head of Finance",
    initials: "SK",
    email: "sarah.kim@aurelium.io"
  }
};

export const navigation: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Budgets", href: "/budgets", icon: Banknote },
  { label: "Savings Goals", href: "/goals", icon: Target },
  { label: "Analytics", href: "/analytics", icon: PiggyBank },
  { label: "Settings", href: "/settings", icon: Settings }
];

export const categories: Category[] = [
  { id: "revenue", label: "Client Revenue", color: "#1fb36a", direction: "income" },
  { id: "payroll", label: "Payroll", color: "#367dff", direction: "expense" },
  { id: "software", label: "Software & SaaS", color: "#8b5cf6", direction: "expense" },
  { id: "marketing", label: "Marketing", color: "#f59e0b", direction: "expense" },
  { id: "office", label: "Office & Rent", color: "#06b6d4", direction: "expense" },
  { id: "travel", label: "Travel", color: "#ec4899", direction: "expense" },
  { id: "professional", label: "Professional Fees", color: "#64748b", direction: "expense" },
  { id: "taxes", label: "Taxes", color: "#ef4444", direction: "expense" },
  { id: "equipment", label: "Equipment", color: "#14b8a6", direction: "expense" },
  { id: "transfers", label: "Transfers", color: "#a3a3a3", direction: "expense" }
];

export const categoryMap = categories.reduce<Record<CategoryId, Category>>((acc, category) => {
  acc[category.id] = category;
  return acc;
}, {} as Record<CategoryId, Category>);

export const accounts: Account[] = [
  {
    id: "acc-operating",
    name: "Operating Checking",
    institution: "First Meridian Bank",
    kind: "checking",
    mask: "4417",
    balance: 284310.44,
    available: 279120.44,
    currency: "USD",
    openedOn: "2022-03-14"
  },
  {
    id: "acc-reserve",
    name: "Tax Reserve",
    institution: "First Meridian Bank",
    kind: "reserve",
    mask: "8802",
    balance: 96500,
    available: 96500,
    currency: "USD",
    openedOn: "2022-03-14"
  },
  {
    id: "acc-growth",
    name: "Growth Savings",
    institution: "Northgate Savings",
    kind: "savings",
    mask: "2159",
    balance: 152840.9,
    available: 152840.9,
    currency: "USD",
    openedOn: "2023-01-09"
  },
  {
    id: "acc-card",
    name: "Business Platinum Card",
    institution: "Aurora Card Services",
    kind: "credit",
    mask: "6021",
    balance: 18422.65,
    available: 56577.35,
    limit: 75000,
    currency: "USD",
    openedOn: "2023-06-27"
  }
];

export const accountMap = accounts.reduce<Record<string, Account>>((acc, account) => {
  acc[account.id] = account;
  return acc;
}, {});

/* ---------------------------------------------------------------------------
 * Transaction ledger
 *
 * Six months of activity is generated from handwritten merchant pools so the
 * table has enough rows for filtering, sorting and pagination to be meaningful,
 * while every row still reads like a real business expense. The generator is
 * deterministic (no Date.now, no Math.random) so server and client agree.
 * ------------------------------------------------------------------------ */

interface MerchantSeed {
  merchant: string;
  memo: string;
  categoryId: CategoryId;
  direction: TxDirection;
  base: number;
  spread: number;
  method: Transaction["method"];
  accountId: string;
  /** Days of the month this merchant typically bills on. */
  days: number[];
}

const merchantSeeds: MerchantSeed[] = [
  { merchant: "Northbeam Logistics", memo: "Platform retainer, Enterprise tier", categoryId: "revenue", direction: "income", base: 48000, spread: 6000, method: "Wire", accountId: "acc-operating", days: [3] },
  { merchant: "Vertex Analytics", memo: "Quarterly implementation milestone", categoryId: "revenue", direction: "income", base: 36500, spread: 4500, method: "ACH", accountId: "acc-operating", days: [8] },
  { merchant: "Halden & Rowe LLP", memo: "Managed services agreement", categoryId: "revenue", direction: "income", base: 21750, spread: 2500, method: "ACH", accountId: "acc-operating", days: [12] },
  { merchant: "Brightline Health", memo: "Annual license, monthly installment", categoryId: "revenue", direction: "income", base: 18200, spread: 1800, method: "ACH", accountId: "acc-operating", days: [19] },
  { merchant: "Casa Verde Foods", memo: "Onboarding and support package", categoryId: "revenue", direction: "income", base: 9400, spread: 2200, method: "Card", accountId: "acc-operating", days: [24] },

  { merchant: "Gusto Payroll", memo: "Semi-monthly payroll run", categoryId: "payroll", direction: "expense", base: 61400, spread: 3200, method: "ACH", accountId: "acc-operating", days: [15, 30] },
  { merchant: "Sequoia Benefits", memo: "Team health and dental premiums", categoryId: "payroll", direction: "expense", base: 8940, spread: 420, method: "ACH", accountId: "acc-operating", days: [5] },
  { merchant: "Contractor, R. Alvarez", memo: "Design contract, 62 hours", categoryId: "payroll", direction: "expense", base: 7440, spread: 1400, method: "ACH", accountId: "acc-operating", days: [22] },

  { merchant: "Amazon Web Services", memo: "Production and staging infrastructure", categoryId: "software", direction: "expense", base: 6820, spread: 940, method: "Card", accountId: "acc-card", days: [2] },
  { merchant: "Datadog", memo: "Observability, 40 hosts", categoryId: "software", direction: "expense", base: 1890, spread: 160, method: "Card", accountId: "acc-card", days: [6] },
  { merchant: "Figma", memo: "Organization seats, 24 editors", categoryId: "software", direction: "expense", base: 1080, spread: 90, method: "Card", accountId: "acc-card", days: [11] },
  { merchant: "Linear", memo: "Product workspace, Business plan", categoryId: "software", direction: "expense", base: 672, spread: 48, method: "Card", accountId: "acc-card", days: [14] },
  { merchant: "Slack", memo: "Business+ workspace seats", categoryId: "software", direction: "expense", base: 918, spread: 60, method: "Card", accountId: "acc-card", days: [18] },

  { merchant: "Google Ads", memo: "Search and demand-gen campaigns", categoryId: "marketing", direction: "expense", base: 9250, spread: 2400, method: "Card", accountId: "acc-card", days: [4] },
  { merchant: "LinkedIn Marketing", memo: "Sponsored content, Q3 pipeline", categoryId: "marketing", direction: "expense", base: 4300, spread: 1100, method: "Card", accountId: "acc-card", days: [10] },
  { merchant: "Sable Creative Studio", memo: "Brand refresh, phase deliverable", categoryId: "marketing", direction: "expense", base: 5600, spread: 1900, method: "ACH", accountId: "acc-operating", days: [21] },

  { merchant: "Atlas Workspace", memo: "Office lease, Suite 400", categoryId: "office", direction: "expense", base: 14200, spread: 0, method: "ACH", accountId: "acc-operating", days: [1] },
  { merchant: "Meridian Utilities", memo: "Power, water and waste", categoryId: "office", direction: "expense", base: 1240, spread: 380, method: "ACH", accountId: "acc-operating", days: [9] },
  { merchant: "Verdant Facilities", memo: "Cleaning and plant service", categoryId: "office", direction: "expense", base: 860, spread: 120, method: "ACH", accountId: "acc-operating", days: [16] },

  { merchant: "Delta Air Lines", memo: "Client onsite, Chicago", categoryId: "travel", direction: "expense", base: 2180, spread: 860, method: "Card", accountId: "acc-card", days: [7] },
  { merchant: "Marriott Bonvoy", memo: "Conference lodging, 3 nights", categoryId: "travel", direction: "expense", base: 1420, spread: 460, method: "Card", accountId: "acc-card", days: [13] },
  { merchant: "Bluepeak Travel", memo: "Team offsite, group booking", categoryId: "travel", direction: "expense", base: 3260, spread: 1250, method: "Card", accountId: "acc-card", days: [26] },

  { merchant: "Harbor Tax Partners", memo: "Quarterly advisory retainer", categoryId: "professional", direction: "expense", base: 4500, spread: 0, method: "ACH", accountId: "acc-operating", days: [17] },
  { merchant: "Whitfield Legal", memo: "Contract review and filings", categoryId: "professional", direction: "expense", base: 3120, spread: 1400, method: "ACH", accountId: "acc-operating", days: [23] },

  { merchant: "State Dept. of Revenue", memo: "Estimated quarterly tax", categoryId: "taxes", direction: "expense", base: 28500, spread: 0, method: "ACH", accountId: "acc-reserve", days: [20] },

  { merchant: "Apple Business", memo: "MacBook Pro refresh, 2 units", categoryId: "equipment", direction: "expense", base: 5180, spread: 1600, method: "Card", accountId: "acc-card", days: [27] },
  { merchant: "Steelcase", memo: "Workstation and seating", categoryId: "equipment", direction: "expense", base: 2340, spread: 900, method: "ACH", accountId: "acc-operating", days: [28] },

  { merchant: "Transfer to Growth Savings", memo: "Monthly surplus sweep", categoryId: "transfers", direction: "expense", base: 12000, spread: 3000, method: "Transfer", accountId: "acc-operating", days: [29] }
];

/** Months rendered in the ledger, oldest first. */
export const months = [
  { key: "2026-02", label: "Feb" },
  { key: "2026-03", label: "Mar" },
  { key: "2026-04", label: "Apr" },
  { key: "2026-05", label: "May" },
  { key: "2026-06", label: "Jun" },
  { key: "2026-07", label: "Jul" }
];

/** Small deterministic hash so amounts vary per month without Math.random. */
function jitter(seed: string, spread: number) {
  if (spread === 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return ((hash % 200) / 200 - 0.5) * 2 * spread;
}

/** Revenue trends up across the six-month window. */
const monthGrowth = [0.86, 0.9, 0.95, 1, 1.06, 1.12];

function daysInMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function buildTransactions(): Transaction[] {
  const rows: Transaction[] = [];
  let counter = 1000;

  months.forEach((month, monthIndex) => {
    const growth = monthGrowth[monthIndex];
    const maxDay = daysInMonth(month.key);

    merchantSeeds.forEach((seed) => {
      seed.days.forEach((day) => {
        const safeDay = Math.min(day, maxDay);
        const date = `${month.key}-${String(safeDay).padStart(2, "0")}`;
        const raw =
          seed.base * (seed.direction === "income" ? growth : 1) +
          jitter(`${seed.merchant}${month.key}${day}`, seed.spread);
        const amount = Math.round(raw * 100) / 100;

        // The most recent days are still settling; one May card charge bounced.
        let status: TxStatus = "cleared";
        if (month.key === "2026-07" && safeDay >= 22) status = "pending";
        if (seed.merchant === "Casa Verde Foods" && month.key === "2026-05") status = "failed";

        counter += 1;
        rows.push({
          id: `TX-${counter}`,
          date,
          merchant: seed.merchant,
          memo: seed.memo,
          categoryId: seed.categoryId,
          accountId: seed.accountId,
          amount,
          direction: seed.direction,
          status,
          method: seed.method
        });
      });
    });
  });

  // Newest first, with a stable tie-break so the order never shifts.
  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
}

export const transactions: Transaction[] = buildTransactions();

/** Transfers are excluded so money moved between own accounts is not double counted. */
export const monthlySeries: MonthlyPoint[] = months.map((month) => {
  const rows = transactions.filter(
    (tx) => tx.date.startsWith(month.key) && tx.status !== "failed" && tx.categoryId !== "transfers"
  );
  const income = rows
    .filter((tx) => tx.direction === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = rows
    .filter((tx) => tx.direction === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  return {
    month: month.label,
    income: Math.round(income),
    expenses: Math.round(expenses),
    net: Math.round(income - expenses)
  };
});

export const budgets: Budget[] = [
  { id: "b-payroll", categoryId: "payroll", label: "Payroll & Benefits", allocated: 145000, spent: 139180, period: "July 2026", owner: "Sarah Kim" },
  { id: "b-software", categoryId: "software", label: "Software & SaaS", allocated: 12000, spent: 11402, period: "July 2026", owner: "Mia Patel" },
  { id: "b-marketing", categoryId: "marketing", label: "Marketing", allocated: 18000, spent: 19640, period: "July 2026", owner: "Daniel Ross" },
  { id: "b-office", categoryId: "office", label: "Office & Rent", allocated: 17000, spent: 16310, period: "July 2026", owner: "Ava Liu" },
  { id: "b-travel", categoryId: "travel", label: "Travel", allocated: 9000, spent: 6720, period: "July 2026", owner: "Daniel Ross" },
  { id: "b-professional", categoryId: "professional", label: "Professional Fees", allocated: 9000, spent: 7640, period: "July 2026", owner: "Sarah Kim" },
  { id: "b-equipment", categoryId: "equipment", label: "Equipment", allocated: 8000, spent: 7940, period: "July 2026", owner: "Mia Patel" }
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
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Marketing budget exceeded",
    body: "July marketing spend is $1,640 over the $18,000 allocation.",
    date: "2026-07-24",
    unread: true
  },
  {
    id: "n2",
    title: "Payment failed, Casa Verde Foods",
    body: "A $9,400 card payment was declined in May and has not been retried.",
    date: "2026-07-22",
    unread: true
  },
  {
    id: "n3",
    title: "Q4 tax goal nearly funded",
    body: "Q4 Tax Set-Aside has reached 92% of its $96,000 target.",
    date: "2026-07-19",
    unread: false
  },
  {
    id: "n4",
    title: "Runway reserve on track",
    body: "At $14,000 per month the 12-month reserve funds by June 2027.",
    date: "2026-07-15",
    unread: false
  }
];
