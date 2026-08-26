import type { AuditEvent, AuditSeverity, CalendarEvent, NotificationItem } from "@/lib/types";
import { teamMembers } from "@/lib/data/team";
import { bills, vendorMap } from "@/lib/data/bills";
import { invoiceTotal, invoices } from "@/lib/data/invoices";
import { clientMap } from "@/lib/data/clients";
import { TODAY, addDays, daysBetween, pick, randInt } from "@/lib/data/seed";

/* ---------------------------------------------------------------------------
 * Audit log
 *
 * Eighty events across the trailing three weeks. Actions are drawn from what
 * the application can actually do, so the log reads as a plausible record of
 * this workspace rather than filler.
 * ------------------------------------------------------------------------ */

interface ActionSeed {
  action: string;
  target: string;
  detail: string;
  severity: AuditSeverity;
}

const actionSeeds: ActionSeed[] = [
  { action: "Signed in", target: "Session", detail: "Password and one-time code accepted.", severity: "info" },
  { action: "Signed out", target: "Session", detail: "Session ended from the account menu.", severity: "info" },
  { action: "Exported ledger", target: "Transactions", detail: "CSV export of the filtered transaction set.", severity: "notice" },
  { action: "Exported statement", target: "Accounts", detail: "Account statement downloaded as CSV.", severity: "notice" },
  { action: "Created budget", target: "Budgets", detail: "New monthly allocation added for July 2026.", severity: "info" },
  { action: "Edited budget", target: "Budgets", detail: "Monthly allocation changed.", severity: "info" },
  { action: "Sent invoice", target: "Invoices", detail: "Invoice issued to the client contact.", severity: "notice" },
  { action: "Voided invoice", target: "Invoices", detail: "Invoice cancelled and removed from receivables.", severity: "critical" },
  { action: "Recorded payment", target: "Invoices", detail: "Invoice marked as settled.", severity: "info" },
  { action: "Scheduled bill", target: "Bills", detail: "Vendor bill queued for payment on the due date.", severity: "notice" },
  { action: "Approved payment", target: "Bills", detail: "Payment released to the vendor.", severity: "critical" },
  { action: "Added contribution", target: "Savings goals", detail: "Funds moved into a savings goal.", severity: "info" },
  { action: "Changed role", target: "Team", detail: "Member permissions updated.", severity: "critical" },
  { action: "Invited member", target: "Team", detail: "Invitation email sent.", severity: "notice" },
  { action: "Revoked session", target: "Security", detail: "A device was signed out remotely.", severity: "critical" },
  { action: "Enabled two-factor", target: "Security", detail: "One-time codes now required at sign in.", severity: "critical" },
  { action: "Updated preferences", target: "Settings", detail: "Display currency or date format changed.", severity: "info" },
  { action: "Viewed report", target: "Reports", detail: "Profit and loss statement opened.", severity: "info" },
  { action: "Ran forecast", target: "Forecast", detail: "Cashflow projection recalculated for a scenario.", severity: "info" },
  { action: "Filed tax estimate", target: "Tax centre", detail: "Quarterly estimate submitted.", severity: "critical" }
];

function buildAuditEvents(): AuditEvent[] {
  const rows: AuditEvent[] = [];

  for (let index = 0; index < 80; index += 1) {
    const key = `audit:${index}`;
    const actor = pick(`${key}:actor`, teamMembers);
    const seed = pick(`${key}:action`, actionSeeds);

    const daysAgo = randInt(`${key}:day`, 0, 20);
    const date = addDays(TODAY, -daysAgo);
    const hour = randInt(`${key}:hour`, 7, 20);
    const minute = randInt(`${key}:minute`, 0, 59);

    rows.push({
      id: `au-${String(index + 1).padStart(3, "0")}`,
      at: `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`,
      actorId: actor.id,
      action: seed.action,
      target: seed.target,
      detail: seed.detail,
      severity: seed.severity,
      ip: `${randInt(`${key}:ip1`, 12, 208)}.${randInt(`${key}:ip2`, 0, 255)}.${randInt(`${key}:ip3`, 0, 255)}.${randInt(`${key}:ip4`, 2, 250)}`
    });
  }

  // Newest first, stable tie-break on id.
  return rows.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : a.id < b.id ? 1 : -1));
}

export const auditEvents: AuditEvent[] = buildAuditEvents();

export const auditActions = Array.from(new Set(actionSeeds.map((seed) => seed.action))).sort();
export const auditTargets = Array.from(new Set(actionSeeds.map((seed) => seed.target))).sort();

/* ---------------------------------------------------------------------------
 * Calendar
 *
 * Built from real records rather than invented dates: every bill due, every
 * invoice due, plus the fixed payroll, tax and review dates. That way the
 * calendar and the payables/receivables pages can never disagree.
 * ------------------------------------------------------------------------ */

function buildCalendar(): CalendarEvent[] {
  const rows: CalendarEvent[] = [];

  bills
    .filter((bill) => bill.status === "scheduled" || bill.status === "overdue")
    .forEach((bill) => {
      rows.push({
        id: `cal-bill-${bill.id}`,
        date: bill.dueOn,
        title: `${vendorMap[bill.vendorId]?.name ?? "Vendor"} bill due`,
        kind: "bill",
        amount: -bill.amount,
        detail: `${bill.number} · ${bill.status === "overdue" ? "Overdue" : "Scheduled"}`
      });
    });

  invoices
    .filter((invoice) => invoice.status === "sent" || invoice.status === "overdue")
    .forEach((invoice) => {
      rows.push({
        id: `cal-inv-${invoice.id}`,
        date: invoice.dueOn,
        title: `${clientMap[invoice.clientId]?.name ?? "Client"} payment due`,
        kind: "invoice",
        amount: invoiceTotal(invoice),
        detail: `${invoice.number} · ${invoice.status === "overdue" ? "Overdue" : "Awaiting payment"}`
      });
    });

  // Payroll runs on the 15th and the last day of each month in the window.
  ["2026-07", "2026-08", "2026-09"].forEach((monthKey) => {
    rows.push({
      id: `cal-payroll-${monthKey}-15`,
      date: `${monthKey}-15`,
      title: "Payroll run",
      kind: "payroll",
      amount: -61400,
      detail: "Semi-monthly payroll, 24 employees"
    });
    rows.push({
      id: `cal-payroll-${monthKey}-30`,
      date: `${monthKey}-30`,
      title: "Payroll run",
      kind: "payroll",
      amount: -61400,
      detail: "Semi-monthly payroll, 24 employees"
    });
  });

  rows.push({
    id: "cal-tax-q2",
    date: "2026-07-15",
    title: "Q2 estimated tax due",
    kind: "tax",
    amount: -99550,
    detail: "Federal and state quarterly estimate"
  });
  rows.push({
    id: "cal-tax-q3",
    date: "2026-10-15",
    title: "Q3 estimated tax due",
    kind: "tax",
    amount: -35725,
    detail: "Federal and state quarterly estimate"
  });
  rows.push({
    id: "cal-review-jul",
    date: "2026-08-05",
    title: "July close review",
    kind: "review",
    detail: "Reconcile accounts and sign off the monthly close"
  });
  rows.push({
    id: "cal-review-board",
    date: "2026-08-19",
    title: "Board finance review",
    kind: "review",
    detail: "Present Q2 results and the updated forecast"
  });

  return rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
}

export const calendarEvents: CalendarEvent[] = buildCalendar();

/** Events from the reporting date forward, soonest first. */
export const upcomingEvents = calendarEvents
  .filter((event) => daysBetween(TODAY, event.date) >= 0)
  .slice(0, 40);

/* ---------------------------------------------------------------------------
 * Notifications
 * ------------------------------------------------------------------------ */

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "3 invoices are overdue",
    body: "The oldest is 47 days past due. Chasing them clears most of the receivables gap.",
    date: "2026-07-30",
    unread: true,
    href: "/dashboard/invoices"
  },
  {
    id: "n2",
    title: "Marketing budget exceeded",
    body: "July marketing spend is $1,640 over the $18,000 allocation.",
    date: "2026-07-28",
    unread: true,
    href: "/dashboard/budgets"
  },
  {
    id: "n3",
    title: "Q2 estimated tax underpaid",
    body: "$28,550 of the $99,550 Q2 estimate is still outstanding.",
    date: "2026-07-26",
    unread: true,
    href: "/dashboard/tax"
  },
  {
    id: "n4",
    title: "Payment failed, Casa Verde Foods",
    body: "A card payment was declined in May and has not been retried.",
    date: "2026-07-22",
    unread: false,
    href: "/dashboard/transactions"
  },
  {
    id: "n5",
    title: "Priya Raman has not accepted her invite",
    body: "The invitation was sent on 24 July and expires in 7 days.",
    date: "2026-07-24",
    unread: false,
    href: "/dashboard/team"
  },
  {
    id: "n6",
    title: "Q4 tax goal nearly funded",
    body: "Q4 Tax Set-Aside has reached 92% of its $96,000 target.",
    date: "2026-07-19",
    unread: false,
    href: "/dashboard/goals"
  }
];
