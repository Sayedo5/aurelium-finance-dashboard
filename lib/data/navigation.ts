import {
  Banknote,
  CalendarDays,
  ChartPie,
  FileSpreadsheet,
  FileText,
  Landmark,
  LayoutDashboard,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import type { NavSection } from "@/lib/types";
import { invoices } from "@/lib/data/invoices";
import { bills } from "@/lib/data/bills";

/** Counts that earn a badge in the sidebar — only ever things needing action. */
const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue").length;
const overdueBills = bills.filter((bill) => bill.status === "overdue").length;

/**
 * Sixteen destinations is too many for a flat list, so navigation is grouped by
 * what the user is trying to do rather than by data type.
 */
export const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/dashboard/analytics", icon: ChartPie },
      { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays }
    ]
  },
  {
    title: "Money in",
    items: [
      { label: "Invoices", href: "/dashboard/invoices", icon: FileText, badge: overdueInvoices },
      { label: "Clients", href: "/dashboard/clients", icon: Users }
    ]
  },
  {
    title: "Money out",
    items: [
      { label: "Bills", href: "/dashboard/bills", icon: Truck, badge: overdueBills },
      { label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
      { label: "Accounts", href: "/dashboard/accounts", icon: Wallet }
    ]
  },
  {
    title: "Planning",
    items: [
      { label: "Budgets", href: "/dashboard/budgets", icon: Banknote },
      { label: "Savings Goals", href: "/dashboard/goals", icon: Target },
      { label: "Forecast", href: "/dashboard/forecast", icon: TrendingUp },
      { label: "Reports", href: "/dashboard/reports", icon: FileSpreadsheet },
      { label: "Tax Centre", href: "/dashboard/tax", icon: Landmark }
    ]
  },
  {
    title: "Workspace",
    items: [
      { label: "Team & Roles", href: "/dashboard/team", icon: ShieldCheck },
      { label: "Audit Log", href: "/dashboard/audit", icon: ScrollText },
      { label: "Settings", href: "/dashboard/settings", icon: Settings }
    ]
  }
];

/** Flat list, used by the command palette and the mobile bottom bar. */
export const navigationItems = navigation.flatMap((section) => section.items);

/** Public marketing routes. */
export const marketingNav = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];
