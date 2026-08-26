"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Search,
  Send,
  Timer,
  X
} from "lucide-react";
import { CollectionsChart } from "@/components/charts/finance-charts";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer, DetailRow } from "@/components/ui/drawer";
import { Field, Input, SegmentedControl, Select } from "@/components/ui/field";
import { InvoiceStatusBadge, Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/states";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useDebouncedValue, useSimulatedLoading } from "@/lib/hooks";
import {
  ageingBucket,
  ageingLabels,
  clientMap,
  clients,
  daysOverdue,
  invoiceSubtotal,
  invoiceTax,
  invoiceTotal,
  invoices,
  teamMap
} from "@/lib/mock-data";
import {
  daysSalesOutstanding,
  invoicedByMonth,
  receivableAgeing,
  totalOverdue,
  totalReceivable
} from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, ratioToPercent } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/lib/types";

type StatusFilter = InvoiceStatus | "all" | "outstanding";

const statusTabs: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "outstanding", label: "Outstanding" },
  { id: "overdue", label: "Overdue" },
  { id: "paid", label: "Paid" },
  { id: "draft", label: "Draft" }
];

export function InvoicesPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [clientId, setClientId] = useState("all");
  const [selected, setSelected] = useState<Invoice | null>(null);

  // Search results deep-link here as /dashboard/invoices?q=INV-2026-1004.
  const initialQuery = searchParams.get("q");
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const debouncedQuery = useDebouncedValue(query, 180);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (status === "outstanding") {
        if (invoice.status !== "sent" && invoice.status !== "overdue") return false;
      } else if (status !== "all" && invoice.status !== status) {
        return false;
      }
      if (clientId !== "all" && invoice.clientId !== clientId) return false;
      if (needle) {
        const client = clientMap[invoice.clientId];
        const haystack = `${invoice.number} ${client?.name ?? ""} ${invoice.notes}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [debouncedQuery, status, clientId]);

  const filteredValue = useMemo(
    () => filtered.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0),
    [filtered]
  );

  const activeFilters =
    (status !== "all" ? 1 : 0) + (clientId !== "all" ? 1 : 0) + (query.trim() ? 1 : 0);

  function reset() {
    setQuery("");
    setStatus("all");
    setClientId("all");
  }

  function exportInvoices() {
    if (filtered.length === 0) {
      addToast({
        title: "Nothing to export",
        body: "No invoices match the current filters.",
        tone: "warning"
      });
      return;
    }

    const csv = toCsv<Invoice>(filtered, [
      { header: "Number", value: (invoice) => invoice.number },
      { header: "Client", value: (invoice) => clientMap[invoice.clientId]?.name ?? "" },
      { header: "Issued", value: (invoice) => invoice.issuedOn },
      { header: "Due", value: (invoice) => invoice.dueOn },
      { header: "Paid", value: (invoice) => invoice.paidOn ?? "" },
      { header: "Status", value: (invoice) => invoice.status },
      { header: "Ageing", value: (invoice) => ageingLabels[ageingBucket(invoice)] },
      { header: "Subtotal (USD)", value: (invoice) => invoiceSubtotal(invoice).toFixed(2) },
      { header: "Tax (USD)", value: (invoice) => invoiceTax(invoice).toFixed(2) },
      { header: "Total (USD)", value: (invoice) => invoiceTotal(invoice).toFixed(2) }
    ]);

    const ok = downloadCsv(csvFilename("invoices", status), csv);
    addToast(
      ok
        ? {
            title: "Invoices exported",
            body: `${filtered.length} rows saved as CSV.`,
            tone: "success"
          }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  const columns: Column<Invoice>[] = [
    {
      id: "number",
      header: "Invoice",
      sortValue: (invoice) => invoice.number,
      cell: (invoice) => (
        <div className="min-w-0">
          <p className="numeric font-medium text-ink">{invoice.number}</p>
          <p className="truncate text-xs text-inkMuted">{fmt.date(invoice.issuedOn)}</p>
        </div>
      )
    },
    {
      id: "client",
      header: "Client",
      sortValue: (invoice) => clientMap[invoice.clientId]?.name ?? "",
      cell: (invoice) => {
        const client = clientMap[invoice.clientId];
        return (
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{client?.name}</p>
            <p className="truncate text-xs text-inkMuted">{client?.industry}</p>
          </div>
        );
      }
    },
    {
      id: "due",
      header: "Due",
      hideBelow: "lg",
      sortValue: (invoice) => invoice.dueOn,
      cell: (invoice) => {
        const late = invoice.status === "overdue";
        const days = daysOverdue(invoice);
        return (
          <div className="min-w-0">
            <p className="whitespace-nowrap text-inkMuted">{fmt.date(invoice.dueOn)}</p>
            {late ? (
              <p className="numeric text-xs font-medium text-loss-600 dark:text-loss-400">
                {days} days late
              </p>
            ) : null}
          </div>
        );
      }
    },
    {
      id: "ageing",
      header: "Ageing",
      hideBelow: "xl",
      sortValue: (invoice) => daysOverdue(invoice),
      cell: (invoice) =>
        invoice.status === "sent" || invoice.status === "overdue" ? (
          <span className="whitespace-nowrap text-xs text-inkMuted">
            {ageingLabels[ageingBucket(invoice)]}
          </span>
        ) : (
          <span className="text-xs text-inkSubtle">—</span>
        )
    },
    {
      id: "status",
      header: "Status",
      sortValue: (invoice) => invoice.status,
      cell: (invoice) => <InvoiceStatusBadge status={invoice.status} />
    },
    {
      id: "total",
      header: "Total",
      align: "right",
      sortValue: (invoice) => invoiceTotal(invoice),
      cell: (invoice) => (
        <span className="numeric whitespace-nowrap font-semibold text-ink">
          {fmt.money(invoiceTotal(invoice), 2)}
        </span>
      )
    }
  ];

  const ageingTotal = receivableAgeing.reduce((sum, row) => sum + row.value, 0);

  return (
    <>
      <section aria-label="Receivables summary" className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total receivable"
          value={totalReceivable}
          icon={CircleDollarSign}
          caption={`${receivableAgeing.reduce((sum, row) => sum + row.count, 0)} open invoices`}
          loading={loading}
        />
        <StatCard
          label="Overdue"
          value={totalOverdue}
          icon={AlertTriangle}
          caption={`${invoices.filter((invoice) => invoice.status === "overdue").length} invoices past due`}
          loading={loading}
          tone="loss"
        />
        <StatCard
          label="Days sales outstanding"
          value={daysSalesOutstanding}
          icon={Timer}
          caption="average time to collect"
          loading={loading}
          format={(value) => `${Math.round(value)} days`}
        />
        <StatCard
          label="Invoiced, all time"
          value={invoices
            .filter((invoice) => invoice.status !== "draft" && invoice.status !== "void")
            .reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)}
          icon={FileText}
          caption={`across ${invoices.length} invoices`}
          loading={loading}
        />
      </section>

      {/* Invoiced vs collected */}
      <Card className="animate-rise stagger-1">
        <CardHeader
          title="Invoiced vs. collected"
          description="What was billed each month against what actually landed"
        />
        <div className="mt-5">
          {loading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : (
            <ErrorBoundary section="Invoiced vs. collected">
              <CollectionsChart data={invoicedByMonth} height={240} />
            </ErrorBoundary>
          )}
        </div>
      </Card>

      {/* A/R ageing */}
      <Card className="animate-rise stagger-2">
        <CardHeader
          title="Receivables ageing"
          description="How long the money owed to you has been outstanding"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {receivableAgeing.map((row, index) => {
            const share = ratioToPercent(row.value, ageingTotal);
            const bad = row.bucket === "61-90" || row.bucket === "90+";
            return (
              <button
                key={row.bucket}
                type="button"
                onClick={() => {
                  setStatus(row.bucket === "current" ? "outstanding" : "overdue");
                  addToast({
                    title: `Filtered to ${ageingLabels[row.bucket].toLowerCase()}`,
                    body: `${row.count} invoices worth ${fmt.money(row.value)}.`,
                    tone: "info"
                  });
                }}
                className="rounded-card border border-line p-4 text-left transition duration-200 ease-smooth hover:border-lineStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400"
              >
                <p className="eyebrow truncate">{ageingLabels[row.bucket]}</p>
                {loading ? (
                  <Skeleton className="mt-2 h-7 w-24" />
                ) : (
                  <p
                    className={cn(
                      "numeric mt-2 text-xl font-semibold",
                      bad && row.value > 0 ? "text-loss-600 dark:text-loss-400" : "text-ink"
                    )}
                  >
                    {fmt.money(row.value)}
                  </p>
                )}
                <Progress
                  value={share}
                  color={bad ? "var(--loss)" : undefined}
                  className="mt-3"
                  delayMs={index * 70}
                  label={`${ageingLabels[row.bucket]} share of receivables`}
                />
                <p className="numeric mt-2 text-xs text-inkMuted">
                  {row.count} {row.count === 1 ? "invoice" : "invoices"} · {share.toFixed(0)}%
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card flush className="animate-rise stagger-3">
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(invoice) => invoice.id}
          loading={loading}
          onRowClick={setSelected}
          initialSort={{ id: "due", dir: "desc" }}
          emptyTitle="No invoices match these filters"
          emptyDescription="Try a different status or clear the client filter."
          emptyAction={
            <Button variant="secondary" size="sm" icon={X} onClick={reset}>
              Clear filters
            </Button>
          }
          mobileCard={(invoice) => {
            const client = clientMap[invoice.clientId];
            return (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="numeric font-medium text-ink">{invoice.number}</p>
                    <p className="truncate text-xs text-inkMuted">{client?.name}</p>
                  </div>
                  <p className="numeric shrink-0 font-semibold text-ink">
                    {fmt.money(invoiceTotal(invoice), 2)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <InvoiceStatusBadge status={invoice.status} />
                  <span className="text-xs text-inkMuted">Due {fmt.date(invoice.dueOn)}</span>
                </div>
              </>
            );
          }}
          toolbar={
            <div className="border-b border-line p-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[180px] flex-1">
                  <Input
                    icon={Search}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search invoice number or client…"
                    aria-label="Search invoices"
                    className="pr-9 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-inkSubtle transition hover:bg-surfaceMuted hover:text-ink"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                <SegmentedControl
                  label="Invoice status"
                  options={statusTabs}
                  value={status}
                  onChange={setStatus}
                  className="h-10 items-center"
                />

                <Button variant="secondary" icon={Download} onClick={exportInvoices}>
                  <span className="hidden sm:inline">Export</span>
                </Button>

                <Button
                  variant="accent"
                  icon={Send}
                  onClick={() =>
                    addToast({
                      title: "Reminder queued",
                      body: `${invoices.filter((invoice) => invoice.status === "overdue").length} overdue clients would receive a chase email.`,
                      tone: "info"
                    })
                  }
                >
                  <span className="hidden sm:inline">Chase overdue</span>
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <Field label="Client" className="w-full max-w-xs">
                  <Select
                    value={clientId}
                    aria-label="Filter by client"
                    onChange={(event) => setClientId(event.target.value)}
                  >
                    <option value="all">All clients</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="flex flex-1 flex-wrap items-center justify-end gap-3 pb-1">
                  <span className="text-xs text-inkMuted">
                    <strong className="numeric font-semibold text-ink">{filtered.length}</strong> of{" "}
                    {invoices.length} · worth{" "}
                    <strong className="numeric font-semibold text-ink">
                      {fmt.money(filteredValue)}
                    </strong>
                  </span>
                  {activeFilters > 0 ? (
                    <Button variant="ghost" size="sm" icon={X} onClick={reset}>
                      Clear
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          }
        />
      </Card>

      {/* Detail drawer */}
      <Drawer
        open={selected !== null}
        title={selected?.number ?? ""}
        subtitle={selected ? clientMap[selected.clientId]?.name : undefined}
        onClose={() => setSelected(null)}
        width="lg"
        footer={
          selected ? (
            <>
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => {
                  const csv = toCsv(selected.lines, [
                    { header: "Description", value: (line) => line.description },
                    { header: "Quantity", value: (line) => line.quantity },
                    { header: "Unit price (USD)", value: (line) => line.unitPrice.toFixed(2) },
                    {
                      header: "Amount (USD)",
                      value: (line) => (line.quantity * line.unitPrice).toFixed(2)
                    }
                  ]);
                  const ok = downloadCsv(csvFilename("invoice", selected.number), csv);
                  addToast(
                    ok
                      ? {
                          title: "Invoice exported",
                          body: `${selected.number} line items saved as CSV.`,
                          tone: "success"
                        }
                      : {
                          title: "Export blocked",
                          body: "Your browser prevented the download.",
                          tone: "error"
                        }
                  );
                }}
              >
                Export lines
              </Button>
              <Button
                variant="accent"
                icon={Send}
                onClick={() => {
                  addToast({
                    title:
                      selected.status === "paid" ? "Receipt resent" : "Reminder sent",
                    body: `${clientMap[selected.clientId]?.contactName} would receive ${selected.number}.`,
                    tone: "success"
                  });
                  setSelected(null);
                }}
              >
                {selected.status === "paid" ? "Resend receipt" : "Send reminder"}
              </Button>
            </>
          ) : null
        }
      >
        {selected ? <InvoiceDetail invoice={selected} /> : null}
      </Drawer>
    </>
  );
}

function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const fmt = useFormat();
  const client = clientMap[invoice.clientId];
  const owner = client ? teamMap[client.ownerId] : undefined;
  const subtotal = invoiceSubtotal(invoice);
  const tax = invoiceTax(invoice);
  const total = invoiceTotal(invoice);
  const late = invoice.status === "overdue";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
        {late ? (
          <Badge tone="bad">
            <Clock size={12} aria-hidden />
            {daysOverdue(invoice)} days past due
          </Badge>
        ) : null}
        {invoice.taxRate > 0 ? (
          <Badge tone="neutral">Tax {invoice.taxRate}%</Badge>
        ) : (
          <Badge tone="neutral">Tax exempt</Badge>
        )}
      </div>

      <dl className="mt-5 divide-y divide-line border-y border-line">
        <DetailRow label="Client">{client?.name}</DetailRow>
        <DetailRow label="Contact">
          <span className="block">{client?.contactName}</span>
          <span className="block text-xs font-normal text-inkMuted">{client?.email}</span>
        </DetailRow>
        <DetailRow label="Account manager">{owner?.name ?? "Unassigned"}</DetailRow>
        <DetailRow label="Payment terms">Net {client?.paymentTerms}</DetailRow>
        <DetailRow label="Issued">{fmt.date(invoice.issuedOn)}</DetailRow>
        <DetailRow label="Due">{fmt.date(invoice.dueOn)}</DetailRow>
        {invoice.paidOn ? (
          <DetailRow label="Paid">
            <span className="text-gain-600 dark:text-gain-400">{fmt.date(invoice.paidOn)}</span>
          </DetailRow>
        ) : null}
      </dl>

      <h3 className="mt-6 text-sm font-semibold text-ink">Line items</h3>
      <div className="mt-3 overflow-x-auto rounded-control border border-line">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surfaceMuted/60 text-label font-semibold uppercase text-inkMuted">
              <th scope="col" className="px-3 py-2">
                Description
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Qty
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Unit
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2.5 text-ink">{line.description}</td>
                <td className="numeric px-3 py-2.5 text-right text-inkMuted">{line.quantity}</td>
                <td className="numeric px-3 py-2.5 text-right text-inkMuted">
                  {fmt.money(line.unitPrice, 2)}
                </td>
                <td className="numeric px-3 py-2.5 text-right font-medium text-ink">
                  {fmt.money(line.quantity * line.unitPrice, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-inkMuted">Subtotal</dt>
          <dd className="numeric font-medium text-ink">{fmt.money(subtotal, 2)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-inkMuted">Tax ({invoice.taxRate}%)</dt>
          <dd className="numeric font-medium text-ink">{fmt.money(tax, 2)}</dd>
        </div>
        <div className="flex justify-between gap-4 rounded-control bg-surfaceMuted px-3 py-2.5 ring-1 ring-line">
          <dt className="font-medium text-ink">Total</dt>
          <dd className="numeric text-base font-semibold text-ink">{fmt.money(total, 2)}</dd>
        </div>
      </dl>

      <p className="mt-5 rounded-control border border-line bg-surfaceMuted px-4 py-3 text-xs leading-relaxed text-inkMuted">
        {invoice.notes}
      </p>
    </>
  );
}
