import type { AgeingBucket, Invoice, InvoiceLine, InvoiceStatus } from "@/lib/types";
import { billableClients, clientMap, clients } from "@/lib/data/clients";
import { TODAY, addDays, daysBetween, money, pick, randInt, rand } from "@/lib/data/seed";

/**
 * Sixty invoices spread across the trailing eight months, anchored to the fixed
 * reporting date so the ageing buckets are stable. Roughly two thirds are paid,
 * which leaves a realistic receivables book to chase.
 */

interface ServiceSeed {
  description: string;
  unitPrice: number;
  unit: "hours" | "seats" | "months" | "each";
  minQty: number;
  maxQty: number;
}

const serviceCatalogue: ServiceSeed[] = [
  { description: "Platform licence — Enterprise tier", unitPrice: 1850, unit: "months", minQty: 1, maxQty: 12 },
  { description: "Platform licence — Growth tier", unitPrice: 940, unit: "months", minQty: 1, maxQty: 12 },
  { description: "Additional workspace seats", unitPrice: 42, unit: "seats", minQty: 10, maxQty: 220 },
  { description: "Implementation & data migration", unitPrice: 195, unit: "hours", minQty: 8, maxQty: 120 },
  { description: "Solution architecture consulting", unitPrice: 245, unit: "hours", minQty: 4, maxQty: 60 },
  { description: "Custom reporting module", unitPrice: 3200, unit: "each", minQty: 1, maxQty: 3 },
  { description: "Priority support retainer", unitPrice: 1400, unit: "months", minQty: 1, maxQty: 12 },
  { description: "Onboarding & training workshop", unitPrice: 2600, unit: "each", minQty: 1, maxQty: 4 },
  { description: "API integration build", unitPrice: 215, unit: "hours", minQty: 12, maxQty: 90 },
  { description: "Compliance audit package", unitPrice: 4800, unit: "each", minQty: 1, maxQty: 2 },
  { description: "Data warehouse connector", unitPrice: 1750, unit: "each", minQty: 1, maxQty: 4 },
  { description: "Dedicated success manager", unitPrice: 2200, unit: "months", minQty: 1, maxQty: 12 }
];

const notesPool = [
  "Payment by ACH or wire. Reference the invoice number on the remittance.",
  "Thank you for your business. Late payments accrue 1.5% monthly interest.",
  "Covers the period stated above. Contact billing with any queries.",
  "Purchase order reference supplied by the client's procurement team.",
  "Renewal invoice issued under the master services agreement."
];

/** Issue dates run across the trailing eight months, weighted toward recent. */
const issueWindowDays = 240;

function buildLines(invoiceKey: string): InvoiceLine[] {
  const count = randInt(`${invoiceKey}:lines`, 1, 4);

  return Array.from({ length: count }, (_, index) => {
    const lineKey = `${invoiceKey}:line:${index}`;
    const service = pick(lineKey, serviceCatalogue);
    const quantity = randInt(`${lineKey}:qty`, service.minQty, service.maxQty);

    return {
      id: `${invoiceKey}-L${index + 1}`,
      description: service.description,
      quantity,
      unitPrice: service.unitPrice
    };
  });
}

function buildInvoices(): Invoice[] {
  const rows: Invoice[] = [];

  for (let index = 0; index < 60; index += 1) {
    const key = `invoice:${index}`;
    const number = `INV-2026-${String(1000 + index)}`;

    // Prospects and churned accounts never receive a new invoice.
    const client = pick(`${key}:client`, billableClients);

    // Square the roll so recent months carry more invoices than old ones.
    const age = Math.round(issueWindowDays * Math.pow(rand(`${key}:age`), 1.6));
    const issuedOn = addDays(TODAY, -age);
    const dueOn = addDays(issuedOn, client.paymentTerms);
    const overdueDays = daysBetween(dueOn, TODAY);

    const lines = buildLines(key);
    const roll = rand(`${key}:status`);

    let status: InvoiceStatus;
    let paidOn: string | undefined;

    if (age < 6 && roll < 0.35) {
      // Very recent and not yet issued to the client.
      status = "draft";
    } else if (roll > 0.985) {
      status = "void";
    } else if (overdueDays > 0) {
      // Past due: most were settled, the rest are the receivables problem.
      if (rand(`${key}:paid`) < 0.78) {
        status = "paid";
        // Settled somewhere between issue and a fortnight past the due date.
        const span = client.paymentTerms + 14;
        paidOn = addDays(issuedOn, randInt(`${key}:paidon`, Math.round(span * 0.4), span));
        if (daysBetween(paidOn, TODAY) < 0) paidOn = dueOn;
      } else {
        status = "overdue";
      }
    } else if (rand(`${key}:early`) < 0.3) {
      // Paid ahead of the due date.
      status = "paid";
      paidOn = addDays(issuedOn, randInt(`${key}:early-on`, 3, Math.max(4, client.paymentTerms - 2)));
      if (daysBetween(paidOn, TODAY) > 0) paidOn = TODAY;
    } else {
      status = "sent";
    }

    rows.push({
      id: `inv-${String(index + 1).padStart(3, "0")}`,
      number,
      clientId: client.id,
      issuedOn,
      dueOn,
      paidOn,
      status,
      lines,
      taxRate: pick(`${key}:tax`, [0, 0, 8.5, 8.5, 9.25, 10.1]),
      notes: pick(`${key}:notes`, notesPool)
    });
  }

  // Newest first, stable tie-break on the invoice number.
  return rows.sort((a, b) =>
    a.issuedOn < b.issuedOn ? 1 : a.issuedOn > b.issuedOn ? -1 : a.number < b.number ? 1 : -1
  );
}

export const invoices: Invoice[] = buildInvoices();

export const invoiceMap = invoices.reduce<Record<string, Invoice>>((acc, invoice) => {
  acc[invoice.id] = invoice;
  return acc;
}, {});

/* ---------------------------------------------------------------------------
 * Derived money
 * ------------------------------------------------------------------------ */

export function invoiceSubtotal(invoice: Invoice): number {
  return money(invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
}

export function invoiceTax(invoice: Invoice): number {
  return money((invoiceSubtotal(invoice) * invoice.taxRate) / 100);
}

export function invoiceTotal(invoice: Invoice): number {
  return money(invoiceSubtotal(invoice) + invoiceTax(invoice));
}

/** Void and draft invoices are not receivable; paid ones are settled. */
export function isOutstanding(invoice: Invoice): boolean {
  return invoice.status === "sent" || invoice.status === "overdue";
}

/** Days past due — negative when the invoice is not due yet. */
export function daysOverdue(invoice: Invoice): number {
  return daysBetween(invoice.dueOn, TODAY);
}

export function ageingBucket(invoice: Invoice): AgeingBucket {
  const days = daysOverdue(invoice);
  if (days <= 0) return "current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

export const ageingBuckets: AgeingBucket[] = ["current", "1-30", "31-60", "61-90", "90+"];

export const ageingLabels: Record<AgeingBucket, string> = {
  current: "Not yet due",
  "1-30": "1–30 days",
  "31-60": "31–60 days",
  "61-90": "61–90 days",
  "90+": "90+ days"
};

/** Total invoiced to a client, excluding drafts and voids. */
export function clientLifetimeValue(clientId: string): number {
  return money(
    invoices
      .filter((invoice) => invoice.clientId === clientId && invoice.status !== "draft" && invoice.status !== "void")
      .reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
  );
}

export function clientOutstanding(clientId: string): number {
  return money(
    invoices
      .filter((invoice) => invoice.clientId === clientId && isOutstanding(invoice))
      .reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
  );
}

/** Clients ranked by lifetime billings, richest first. */
export const clientRevenue = clients
  .map((client) => ({
    client,
    lifetime: clientLifetimeValue(client.id),
    outstanding: clientOutstanding(client.id),
    invoiceCount: invoices.filter((invoice) => invoice.clientId === client.id).length
  }))
  .sort((a, b) => b.lifetime - a.lifetime);

export const clientRevenueMap = clientRevenue.reduce<Record<string, (typeof clientRevenue)[number]>>(
  (acc, row) => {
    acc[row.client.id] = row;
    return acc;
  },
  {}
);

export { clientMap };
