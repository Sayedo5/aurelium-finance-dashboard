"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Download,
  Repeat,
  Scale,
  Search,
  Truck,
  Wallet,
  X
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer, DetailRow } from "@/components/ui/drawer";
import { Field, Input, SegmentedControl, Select } from "@/components/ui/field";
import { BillStatusBadge, Badge, Pill } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useDebouncedValue, useSimulatedLoading } from "@/lib/hooks";
import {
  billDaysUntilDue,
  bills,
  categoryMap,
  expenseCategories,
  vendorMap,
  vendorSpend,
  vendors
} from "@/lib/mock-data";
import {
  totalBillsOverdue,
  totalPayable,
  totalReceivable,
  workingCapital
} from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, ratioToPercent } from "@/lib/utils";
import type { Bill, BillStatus, CategoryId } from "@/lib/types";

type StatusFilter = BillStatus | "all" | "payable";

const statusTabs: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "payable", label: "Payable" },
  { id: "overdue", label: "Overdue" },
  { id: "paid", label: "Paid" },
  { id: "draft", label: "Draft" }
];

export function BillsPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [categoryId, setCategoryId] = useState<CategoryId | "all">("all");
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [selected, setSelected] = useState<Bill | null>(null);

  // Search results deep-link here as /dashboard/bills?q=Datadog.
  const initialQuery = searchParams.get("q");
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const debouncedQuery = useDebouncedValue(query, 180);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    return bills.filter((bill) => {
      if (status === "payable") {
        if (bill.status !== "scheduled" && bill.status !== "overdue") return false;
      } else if (status !== "all" && bill.status !== status) {
        return false;
      }
      if (categoryId !== "all" && bill.categoryId !== categoryId) return false;
      if (recurringOnly && !bill.recurring) return false;
      if (needle) {
        const vendor = vendorMap[bill.vendorId];
        const haystack = `${bill.number} ${vendor?.name ?? ""} ${categoryMap[bill.categoryId].label}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [debouncedQuery, status, categoryId, recurringOnly]);

  const filteredValue = useMemo(
    () => filtered.reduce((sum, bill) => sum + bill.amount, 0),
    [filtered]
  );

  const dueSoon = useMemo(
    () =>
      bills
        .filter((bill) => bill.status === "scheduled" && billDaysUntilDue(bill) <= 14)
        .reduce((sum, bill) => sum + bill.amount, 0),
    []
  );

  const topVendors = useMemo(() => vendorSpend.slice(0, 6), []);
  const topVendorValue = topVendors[0]?.lifetime ?? 1;

  const activeFilters =
    (status !== "all" ? 1 : 0) +
    (categoryId !== "all" ? 1 : 0) +
    (recurringOnly ? 1 : 0) +
    (query.trim() ? 1 : 0);

  function reset() {
    setQuery("");
    setStatus("all");
    setCategoryId("all");
    setRecurringOnly(false);
  }

  function exportBills() {
    if (filtered.length === 0) {
      addToast({
        title: "Nothing to export",
        body: "No bills match the current filters.",
        tone: "warning"
      });
      return;
    }

    const csv = toCsv<Bill>(filtered, [
      { header: "Number", value: (bill) => bill.number },
      { header: "Vendor", value: (bill) => vendorMap[bill.vendorId]?.name ?? "" },
      { header: "Category", value: (bill) => categoryMap[bill.categoryId].label },
      { header: "Issued", value: (bill) => bill.issuedOn },
      { header: "Due", value: (bill) => bill.dueOn },
      { header: "Paid", value: (bill) => bill.paidOn ?? "" },
      { header: "Status", value: (bill) => bill.status },
      { header: "Recurring", value: (bill) => (bill.recurring ? "yes" : "no") },
      { header: "Amount (USD)", value: (bill) => bill.amount.toFixed(2) }
    ]);

    const ok = downloadCsv(csvFilename("bills", status), csv);
    addToast(
      ok
        ? { title: "Bills exported", body: `${filtered.length} rows saved as CSV.`, tone: "success" }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  const columns: Column<Bill>[] = [
    {
      id: "vendor",
      header: "Vendor",
      sortValue: (bill) => vendorMap[bill.vendorId]?.name ?? "",
      cell: (bill) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{vendorMap[bill.vendorId]?.name}</p>
          <p className="numeric truncate text-xs text-inkMuted">{bill.number}</p>
        </div>
      )
    },
    {
      id: "category",
      header: "Category",
      hideBelow: "lg",
      sortValue: (bill) => categoryMap[bill.categoryId].label,
      cell: (bill) => (
        <Pill color={categoryMap[bill.categoryId].color}>{categoryMap[bill.categoryId].label}</Pill>
      )
    },
    {
      id: "due",
      header: "Due",
      sortValue: (bill) => bill.dueOn,
      cell: (bill) => {
        const days = billDaysUntilDue(bill);
        const late = bill.status === "overdue";
        const soon = bill.status === "scheduled" && days <= 7 && days >= 0;
        return (
          <div className="min-w-0">
            <p className="whitespace-nowrap text-inkMuted">{fmt.date(bill.dueOn)}</p>
            {late ? (
              <p className="numeric text-xs font-medium text-loss-600 dark:text-loss-400">
                {Math.abs(days)} days late
              </p>
            ) : soon ? (
              <p className="numeric text-xs font-medium text-caution-700 dark:text-caution-300">
                in {days} days
              </p>
            ) : null}
          </div>
        );
      }
    },
    {
      id: "recurring",
      header: "Type",
      hideBelow: "xl",
      sortValue: (bill) => (bill.recurring ? 1 : 0),
      cell: (bill) =>
        bill.recurring ? (
          <Badge tone="neutral">
            <Repeat size={11} aria-hidden />
            Recurring
          </Badge>
        ) : (
          <span className="text-xs text-inkSubtle">One-off</span>
        )
    },
    {
      id: "status",
      header: "Status",
      sortValue: (bill) => bill.status,
      cell: (bill) => <BillStatusBadge status={bill.status} />
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      sortValue: (bill) => bill.amount,
      cell: (bill) => (
        <span className="numeric whitespace-nowrap font-semibold text-ink">
          {fmt.money(bill.amount, 2)}
        </span>
      )
    }
  ];

  return (
    <>
      <section aria-label="Payables summary" className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total payable"
          value={totalPayable}
          icon={Wallet}
          caption={`${bills.filter((bill) => bill.status === "scheduled" || bill.status === "overdue").length} bills outstanding`}
          loading={loading}
          tone="loss"
        />
        <StatCard
          label="Overdue"
          value={totalBillsOverdue}
          icon={AlertTriangle}
          caption={`${bills.filter((bill) => bill.status === "overdue").length} past their due date`}
          loading={loading}
          tone="loss"
        />
        <StatCard
          label="Due within 14 days"
          value={dueSoon}
          icon={CalendarClock}
          caption="scheduled for payment"
          loading={loading}
        />
        <StatCard
          label="Working capital"
          value={workingCapital}
          icon={Scale}
          caption={`${fmt.compact(totalReceivable)} in, ${fmt.compact(totalPayable)} out`}
          loading={loading}
          tone={workingCapital >= 0 ? "gain" : "loss"}
        />
      </section>

      <section className="grid animate-rise gap-4 stagger-1 xl:grid-cols-[minmax(0,1fr),minmax(0,1.5fr)]">
        <Card>
          <CardHeader title="Top vendors" description="Ranked by total billed to date" />
          <div className="mt-5 space-y-3.5">
            {topVendors.map((row, index) => (
              <button
                key={row.vendor.id}
                type="button"
                onClick={() => setQuery(row.vendor.name)}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400"
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{row.vendor.name}</span>
                  <span className="numeric shrink-0 font-semibold text-ink">
                    {fmt.money(row.lifetime)}
                  </span>
                </div>
                <Progress
                  value={ratioToPercent(row.lifetime, topVendorValue)}
                  color={categoryMap[row.vendor.categoryId].color}
                  className="mt-2"
                  delayMs={index * 60}
                  label={`${row.vendor.name} share of vendor spend`}
                />
              </button>
            ))}
          </div>
          <p className="mt-5 border-t border-line pt-4 text-xs text-inkMuted">
            {vendors.length} vendors on file · click a name to filter the bill list
          </p>
        </Card>

        <Card flush>
          <DataTable
            rows={filtered}
            columns={columns}
            rowKey={(bill) => bill.id}
            loading={loading}
            onRowClick={setSelected}
            pageSize={10}
            minWidth="660px"
            initialSort={{ id: "due", dir: "desc" }}
            emptyTitle="No bills match these filters"
            emptyDescription="Try a different status or clear the category filter."
            emptyAction={
              <Button variant="secondary" size="sm" icon={X} onClick={reset}>
                Clear filters
              </Button>
            }
            mobileCard={(bill) => (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{vendorMap[bill.vendorId]?.name}</p>
                    <p className="numeric truncate text-xs text-inkMuted">{bill.number}</p>
                  </div>
                  <p className="numeric shrink-0 font-semibold text-ink">
                    {fmt.money(bill.amount, 2)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <BillStatusBadge status={bill.status} />
                  <Pill color={categoryMap[bill.categoryId].color}>
                    {categoryMap[bill.categoryId].label}
                  </Pill>
                  <span className="text-xs text-inkMuted">Due {fmt.date(bill.dueOn)}</span>
                </div>
              </>
            )}
            toolbar={
              <div className="border-b border-line p-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[180px] flex-1">
                    <Input
                      icon={Search}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search vendor or bill number…"
                      aria-label="Search bills"
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
                    label="Bill status"
                    options={statusTabs}
                    value={status}
                    onChange={setStatus}
                    className="h-10 items-center"
                  />

                  <Button variant="secondary" icon={Download} onClick={exportBills}>
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <Field label="Category" className="w-full max-w-xs">
                    <Select
                      value={categoryId}
                      aria-label="Filter by category"
                      onChange={(event) => setCategoryId(event.target.value as CategoryId | "all")}
                    >
                      <option value="all">All categories</option>
                      {expenseCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Button
                    variant={recurringOnly ? "primary" : "secondary"}
                    icon={Repeat}
                    onClick={() => setRecurringOnly((value) => !value)}
                    aria-pressed={recurringOnly}
                  >
                    Recurring only
                  </Button>

                  <div className="flex flex-1 flex-wrap items-center justify-end gap-3 pb-1">
                    <span className="text-xs text-inkMuted">
                      <strong className="numeric font-semibold text-ink">{filtered.length}</strong> of{" "}
                      {bills.length} · worth{" "}
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
      </section>

      <Drawer
        open={selected !== null}
        title={selected ? (vendorMap[selected.vendorId]?.name ?? "Bill") : ""}
        subtitle={selected?.number}
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                variant="accent"
                icon={CheckCircle2}
                disabled={selected.status === "paid"}
                onClick={() => {
                  addToast({
                    title: "Payment approved",
                    body: `${fmt.money(selected.amount, 2)} to ${vendorMap[selected.vendorId]?.name} would be released.`,
                    tone: "success"
                  });
                  setSelected(null);
                }}
              >
                {selected.status === "paid" ? "Already paid" : "Approve payment"}
              </Button>
            </>
          ) : null
        }
      >
        {selected ? <BillDetail bill={selected} /> : null}
      </Drawer>
    </>
  );
}

function BillDetail({ bill }: { bill: Bill }) {
  const fmt = useFormat();
  const vendor = vendorMap[bill.vendorId];
  const days = billDaysUntilDue(bill);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <BillStatusBadge status={bill.status} />
        {bill.recurring ? (
          <Badge tone="neutral">
            <Repeat size={11} aria-hidden />
            Recurring
          </Badge>
        ) : null}
        <Pill color={categoryMap[bill.categoryId].color}>
          {categoryMap[bill.categoryId].label}
        </Pill>
      </div>

      <div
        className={cn(
          "mt-5 rounded-control border px-4 py-4 text-center",
          bill.status === "overdue"
            ? "border-loss-300 bg-loss-100/50 dark:border-loss-900 dark:bg-loss-900/20"
            : "border-line bg-surfaceMuted"
        )}
      >
        <p className="eyebrow">Amount due</p>
        <p className="numeric mt-1.5 text-metric font-semibold text-ink">
          {fmt.money(bill.amount, 2)}
        </p>
        <p className="mt-1 text-xs text-inkMuted">
          {bill.status === "paid"
            ? `Settled ${bill.paidOn ? fmt.date(bill.paidOn) : ""}`
            : bill.status === "overdue"
              ? `${Math.abs(days)} days past due`
              : days >= 0
                ? `Due in ${days} days`
                : "Awaiting approval"}
        </p>
      </div>

      <dl className="mt-5 divide-y divide-line border-y border-line">
        <DetailRow label="Vendor">{vendor?.name}</DetailRow>
        <DetailRow label="Contact">
          <span className="block">{vendor?.contactName}</span>
          <span className="block text-xs font-normal text-inkMuted">{vendor?.email}</span>
        </DetailRow>
        <DetailRow label="Country">{vendor?.country}</DetailRow>
        <DetailRow label="Payment terms">Net {vendor?.paymentTerms}</DetailRow>
        <DetailRow label="Bill number">
          <span className="numeric">{bill.number}</span>
        </DetailRow>
        <DetailRow label="Issued">{fmt.date(bill.issuedOn)}</DetailRow>
        <DetailRow label="Due">{fmt.date(bill.dueOn)}</DetailRow>
        {bill.paidOn ? (
          <DetailRow label="Paid">
            <span className="text-gain-600 dark:text-gain-400">{fmt.date(bill.paidOn)}</span>
          </DetailRow>
        ) : null}
        <DetailRow label="Paid from">
          {bill.accountId === "acc-payroll" ? "Payroll Clearing" : "Operating Checking"}
        </DetailRow>
      </dl>

      <div className="mt-5 flex items-start gap-2.5 rounded-control border border-line bg-surfaceMuted px-4 py-3">
        <Truck size={15} className="mt-0.5 shrink-0 text-inkSubtle" aria-hidden />
        <p className="text-xs leading-relaxed text-inkMuted">
          Vendor since {vendor ? fmt.date(vendor.since) : "—"}. This bill is categorised as{" "}
          {categoryMap[bill.categoryId].label.toLowerCase()} and counts toward that budget.
        </p>
      </div>
    </>
  );
}
