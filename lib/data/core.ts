import type { Account, Category, CategoryId } from "@/lib/types";

export const company = {
  name: "Aurelium Ledger",
  shortName: "Aurelium",
  legalName: "Aurelium Financial Systems, Inc.",
  tagline: "Finance clarity for growing teams",
  founded: "2021",
  headquarters: "Seattle, Washington",
  supportEmail: "support@aurelium.io",
  salesEmail: "sales@aurelium.io",
  phone: "+1 (206) 555-0148",
  address: "1200 Harbor Steps, Suite 400, Seattle, WA 98101",
  owner: {
    id: "tm-sarah",
    name: "Sarah Kim",
    role: "Head of Finance",
    initials: "SK",
    email: "sarah.kim@aurelium.io"
  }
};

/**
 * Category colours are picked for separation on a donut at small sizes and to
 * stay legible on both themes. Revenue and interest are the only two income
 * categories; transfers are excluded from cashflow entirely.
 */
export const categories: Category[] = [
  { id: "revenue", label: "Client Revenue", color: "#1fa163", direction: "income" },
  { id: "interest", label: "Interest Income", color: "#0d9488", direction: "income" },
  { id: "payroll", label: "Payroll", color: "#3b82f6", direction: "expense" },
  { id: "software", label: "Software & SaaS", color: "#8b5cf6", direction: "expense" },
  { id: "marketing", label: "Marketing", color: "#e8b34a", direction: "expense" },
  { id: "office", label: "Office & Rent", color: "#06b6d4", direction: "expense" },
  { id: "travel", label: "Travel", color: "#ec4899", direction: "expense" },
  { id: "professional", label: "Professional Fees", color: "#64748b", direction: "expense" },
  { id: "taxes", label: "Taxes", color: "#ef4444", direction: "expense" },
  { id: "equipment", label: "Equipment", color: "#14b8a6", direction: "expense" },
  { id: "insurance", label: "Insurance", color: "#a855f7", direction: "expense" },
  { id: "training", label: "Training", color: "#f97316", direction: "expense" },
  { id: "recruiting", label: "Recruiting", color: "#d946ef", direction: "expense" },
  { id: "shipping", label: "Shipping & Logistics", color: "#0ea5e9", direction: "expense" },
  { id: "meals", label: "Meals & Entertainment", color: "#84cc16", direction: "expense" },
  { id: "transfers", label: "Transfers", color: "#94a3b8", direction: "expense" }
];

export const categoryMap = categories.reduce<Record<CategoryId, Category>>((acc, category) => {
  acc[category.id] = category;
  return acc;
}, {} as Record<CategoryId, Category>);

export const expenseCategories = categories.filter((category) => category.direction === "expense");

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
    id: "acc-payroll",
    name: "Payroll Clearing",
    institution: "First Meridian Bank",
    kind: "checking",
    mask: "5530",
    balance: 68420.15,
    available: 68420.15,
    currency: "USD",
    openedOn: "2022-08-02"
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
