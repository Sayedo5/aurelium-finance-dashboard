"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, SegmentedControl, Select } from "@/components/ui/field";
import { DeltaBadge } from "@/components/ui/badge";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { months } from "@/lib/mock-data";
import { balanceSheet, cashflowStatement, profitAndLoss } from "@/lib/selectors";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, formatMonthYear, percentChange } from "@/lib/utils";
import type { ReportLine, ReportSection } from "@/lib/types";

type ReportId = "pnl" | "balance" | "cashflow";

const reports: Array<{ id: ReportId; label: string }> = [
  { id: "pnl", label: "Profit & loss" },
  { id: "balance", label: "Balance sheet" },
  { id: "cashflow", label: "Cashflow" }
];

const descriptions: Record<ReportId, string> = {
  pnl: "Revenue, cost of revenue and operating expenses for the period, compared with the prior period.",
  balance:
    "Assets, liabilities and equity at the reporting date. Fixed assets and long-term debt are modelling constants.",
  cashflow:
    "Indirect method: net income adjusted for non-cash items and working-capital movement, then investing and financing."
};

export function ReportsPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [report, setReport] = useState<ReportId>("pnl");
  const [periodKey, setPeriodKey] = useState(months[months.length - 1].key);
  const [comparisonKey, setComparisonKey] = useState(months[months.length - 2].key);

  const sections = useMemo<ReportSection[]>(() => {
    if (report === "balance") return balanceSheet();
    if (report === "cashflow") return cashflowStatement(periodKey, comparisonKey);
    return profitAndLoss(periodKey, comparisonKey);
  }, [report, periodKey, comparisonKey]);

  const reportLabel = reports.find((item) => item.id === report)?.label ?? "Report";

  function exportReport() {
    // Flatten the sections so the CSV keeps the visual hierarchy in a column.
    const flat = sections.flatMap((section) =>
      section.lines.map((line) => ({ section: section.title, line }))
    );

    const csv = toCsv(flat, [
      { header: "Section", value: (row) => row.section },
      { header: "Line", value: (row) => row.line.label },
      { header: "Type", value: (row) => (row.line.total ? "total" : "detail") },
      { header: "Current (USD)", value: (row) => row.line.current.toFixed(2) },
      { header: "Prior (USD)", value: (row) => row.line.previous.toFixed(2) },
      {
        header: "Variance (USD)",
        value: (row) => (row.line.current - row.line.previous).toFixed(2)
      },
      {
        header: "Variance (%)",
        value: (row) => percentChange(row.line.current, row.line.previous).toFixed(1)
      }
    ]);

    const ok = downloadCsv(csvFilename(report, periodKey), csv);
    addToast(
      ok
        ? {
            title: `${reportLabel} exported`,
            body: `${flat.length} lines saved as CSV.`,
            tone: "success"
          }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  return (
    <>
      <Card className="animate-rise">
        <CardHeader
          title="Financial statements"
          description={descriptions[report]}
          actions={
            <>
              <SegmentedControl
                label="Statement"
                options={reports}
                value={report}
                onChange={setReport}
              />
              <Button variant="secondary" size="md" icon={Download} onClick={exportReport}>
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={Printer}
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
              >
                <span className="hidden lg:inline">Print</span>
              </Button>
            </>
          }
        />

        {report !== "balance" ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:max-w-lg">
            <Field label="Period" htmlFor="report-period">
              <Select
                id="report-period"
                value={periodKey}
                onChange={(event) => setPeriodKey(event.target.value)}
              >
                {months.map((month) => (
                  <option key={month.key} value={month.key}>
                    {formatMonthYear(month.key)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Compared with" htmlFor="report-comparison">
              <Select
                id="report-comparison"
                value={comparisonKey}
                onChange={(event) => setComparisonKey(event.target.value)}
              >
                {months.map((month) => (
                  <option key={month.key} value={month.key}>
                    {formatMonthYear(month.key)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : (
          <p className="mt-5 rounded-control border border-line bg-surfaceMuted px-4 py-3 text-xs leading-relaxed text-inkMuted">
            The balance sheet is stated at the reporting date, 31 July 2026. The prior-period column
            models the position one month earlier.
          </p>
        )}
      </Card>

      {loading ? (
        <Card className="animate-rise stagger-1">
          <Skeleton className="h-[520px] w-full" />
        </Card>
      ) : (
        <Card flush className="animate-rise stagger-1">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">
                {reportLabel} for {formatMonthYear(periodKey)} compared with{" "}
                {formatMonthYear(comparisonKey)}
              </caption>
              <thead>
                <tr className="border-b border-line bg-surfaceMuted/60 text-label font-semibold uppercase text-inkMuted">
                  <th scope="col" className="px-5 py-3">
                    Line
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    {report === "balance" ? "At 31 Jul" : formatMonthYear(periodKey)}
                  </th>
                  <th scope="col" className="hidden px-5 py-3 text-right sm:table-cell">
                    {report === "balance" ? "Prior month" : formatMonthYear(comparisonKey)}
                  </th>
                  <th scope="col" className="hidden px-5 py-3 text-right md:table-cell">
                    Variance
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <ReportSectionRows key={section.title} section={section} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2.5 border-t border-line px-5 py-3.5">
            <FileSpreadsheet size={14} className="shrink-0 text-inkSubtle" aria-hidden />
            <p className="text-xs leading-relaxed text-inkMuted">
              Figures are derived from the transaction ledger. Cost of revenue is modelled as 60% of
              payroll and 70% of infrastructure spend — a stated assumption, not a posted journal.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

/** One section: a heading row, its lines, and the subtotal rules within it. */
function ReportSectionRows({ section }: { section: ReportSection }) {
  const fmt = useFormat();

  return (
    <>
      <tr className="bg-surfaceMuted/40">
        <th
          scope="colgroup"
          colSpan={5}
          className="px-5 py-2 text-left text-label font-semibold uppercase text-inkMuted"
        >
          {section.title}
        </th>
      </tr>
      {section.lines.map((line) => (
        <ReportRow key={`${section.title}-${line.label}`} line={line} format={fmt.money} />
      ))}
    </>
  );
}

function ReportRow({
  line,
  format
}: {
  line: ReportLine;
  format: (value: number, fractionDigits?: number) => string;
}) {
  const variance = line.current - line.previous;
  const change = percentChange(line.current, line.previous);

  return (
    <tr
      className={cn(
        "border-b border-line last:border-0",
        line.total && "bg-surfaceMuted/30 font-semibold"
      )}
    >
      <th
        scope="row"
        className={cn(
          "px-5 py-2.5 text-left font-normal",
          line.total ? "font-semibold text-ink" : "text-inkMuted",
          line.detail && "pl-8"
        )}
      >
        {line.label}
      </th>
      <td className="numeric px-5 py-2.5 text-right text-ink">{format(line.current)}</td>
      <td className="numeric hidden px-5 py-2.5 text-right text-inkMuted sm:table-cell">
        {format(line.previous)}
      </td>
      <td
        className={cn(
          "numeric hidden px-5 py-2.5 text-right md:table-cell",
          variance >= 0 ? "text-gain-600 dark:text-gain-400" : "text-loss-600 dark:text-loss-400"
        )}
      >
        {variance >= 0 ? "+" : "−"}
        {format(Math.abs(variance))}
      </td>
      <td className="px-5 py-2.5 text-right">
        {line.previous === 0 ? (
          <span className="text-xs text-inkSubtle">—</span>
        ) : (
          <DeltaBadge value={change} />
        )}
      </td>
    </tr>
  );
}
