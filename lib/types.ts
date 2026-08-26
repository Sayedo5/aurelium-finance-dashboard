import type { LucideIcon } from "lucide-react";

export type ThemeMode = "light" | "dark";

export type TxDirection = "income" | "expense";
export type TxStatus = "cleared" | "pending" | "failed";

export type CategoryId =
  | "revenue"
  | "payroll"
  | "software"
  | "marketing"
  | "office"
  | "travel"
  | "professional"
  | "taxes"
  | "equipment"
  | "transfers";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  direction: TxDirection;
}

export type AccountKind = "checking" | "savings" | "credit" | "reserve";

export interface Account {
  id: string;
  name: string;
  institution: string;
  kind: AccountKind;
  mask: string;
  balance: number;
  available: number;
  currency: "USD";
  /** Credit accounts only — the limit the balance is drawn against. */
  limit?: number;
  openedOn: string;
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  memo: string;
  categoryId: CategoryId;
  accountId: string;
  /** Always positive; `direction` carries the sign. */
  amount: number;
  direction: TxDirection;
  status: TxStatus;
  method: "ACH" | "Card" | "Wire" | "Transfer" | "Check";
}

export interface Budget {
  id: string;
  categoryId: CategoryId;
  label: string;
  allocated: number;
  spent: number;
  period: string;
  owner: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  purpose: string;
  target: number;
  saved: number;
  monthlyContribution: number;
  targetDate: string;
  accountId: string;
}

export interface MonthlyPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  unread: boolean;
}
