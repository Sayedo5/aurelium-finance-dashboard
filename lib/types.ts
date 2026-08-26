import type { LucideIcon } from "lucide-react";

export type ThemeMode = "light" | "dark";

/* ---------------------------------------------------------------------------
 * Ledger
 * ------------------------------------------------------------------------ */

export type TxDirection = "income" | "expense";
export type TxStatus = "cleared" | "pending" | "failed";

export type CategoryId =
  | "revenue"
  | "interest"
  | "payroll"
  | "software"
  | "marketing"
  | "office"
  | "travel"
  | "professional"
  | "taxes"
  | "equipment"
  | "insurance"
  | "training"
  | "recruiting"
  | "shipping"
  | "meals"
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

export interface MonthlyPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

/* ---------------------------------------------------------------------------
 * Accounts receivable — clients and invoices
 * ------------------------------------------------------------------------ */

export type ClientStatus = "active" | "prospect" | "churned";

export interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  country: string;
  city: string;
  since: string;
  status: ClientStatus;
  /** Net terms in days — drives the invoice due date and ageing buckets. */
  paymentTerms: 15 | 30 | 45 | 60;
  /** Team member who owns the relationship. */
  ownerId: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  issuedOn: string;
  dueOn: string;
  paidOn?: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  /** Percentage, e.g. 8.5 for 8.5%. */
  taxRate: number;
  notes: string;
}

/** Ageing bucket for an unpaid invoice, measured against the reporting date. */
export type AgeingBucket = "current" | "1-30" | "31-60" | "61-90" | "90+";

/* ---------------------------------------------------------------------------
 * Accounts payable — vendors and bills
 * ------------------------------------------------------------------------ */

export type BillStatus = "draft" | "scheduled" | "paid" | "overdue";

export interface Vendor {
  id: string;
  name: string;
  categoryId: CategoryId;
  contactName: string;
  email: string;
  country: string;
  /** Net terms in days. */
  paymentTerms: 15 | 30 | 45 | 60;
  since: string;
}

export interface Bill {
  id: string;
  number: string;
  vendorId: string;
  issuedOn: string;
  dueOn: string;
  paidOn?: string;
  amount: number;
  status: BillStatus;
  categoryId: CategoryId;
  /** Recurring bills are excluded from one-off spend analysis. */
  recurring: boolean;
  accountId: string;
}

/* ---------------------------------------------------------------------------
 * Planning
 * ------------------------------------------------------------------------ */

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

export interface ForecastScenario {
  id: string;
  label: string;
  description: string;
  /** Month-over-month multipliers applied to the trailing average. */
  revenueGrowth: number;
  expenseGrowth: number;
  /** One-off monthly cost added from month three, e.g. planned hires. */
  additionalMonthlyCost: number;
}

export interface ForecastPoint {
  month: string;
  /** Actuals are historic; projections are modelled. Charts dash the latter. */
  actual: boolean;
  income: number;
  expenses: number;
  net: number;
  balance: number;
}

/* ---------------------------------------------------------------------------
 * Reporting
 * ------------------------------------------------------------------------ */

export interface ReportLine {
  label: string;
  current: number;
  previous: number;
  /** Indents the row and excludes it from section totals when true. */
  detail?: boolean;
  /** Renders as a bold subtotal rule. */
  total?: boolean;
}

export interface ReportSection {
  title: string;
  lines: ReportLine[];
}

export interface TaxPeriod {
  id: string;
  label: string;
  quarter: string;
  periodStart: string;
  periodEnd: string;
  dueOn: string;
  taxableIncome: number;
  estimatedTax: number;
  paid: number;
  status: "filed" | "due" | "upcoming";
}

/* ---------------------------------------------------------------------------
 * Governance
 * ------------------------------------------------------------------------ */

export type RoleId = "owner" | "admin" | "accountant" | "analyst" | "viewer";

export type PermissionId =
  | "view_dashboard"
  | "view_transactions"
  | "export_data"
  | "manage_budgets"
  | "manage_invoices"
  | "manage_bills"
  | "approve_payments"
  | "manage_team"
  | "manage_settings"
  | "view_audit";

export interface Role {
  id: RoleId;
  label: string;
  description: string;
  permissions: PermissionId[];
}

export type MemberStatus = "active" | "invited" | "suspended";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  roleId: RoleId;
  status: MemberStatus;
  joinedOn: string;
  lastActiveOn: string;
  department: string;
}

export type AuditSeverity = "info" | "notice" | "critical";

export interface AuditEvent {
  id: string;
  /** ISO date-time, always UTC, so ordering is unambiguous. */
  at: string;
  actorId: string;
  action: string;
  target: string;
  detail: string;
  severity: AuditSeverity;
  ip: string;
}

export type CalendarKind = "bill" | "invoice" | "tax" | "payroll" | "review";

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  kind: CalendarKind;
  amount?: number;
  detail: string;
}

/* ---------------------------------------------------------------------------
 * Navigation and notifications
 * ------------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown as a count chip in the sidebar, e.g. overdue invoices. */
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  unread: boolean;
  href?: string;
}
