"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Landmark,
  Truck,
  Users
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedControl } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { TODAY, addMonths, calendarEvents, daysBetween } from "@/lib/mock-data";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn, formatMonthYear } from "@/lib/utils";
import type { CalendarEvent, CalendarKind } from "@/lib/types";

type KindFilter = CalendarKind | "all";

const kindTabs: Array<{ id: KindFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "bill", label: "Bills" },
  { id: "invoice", label: "Invoices" },
  { id: "payroll", label: "Payroll" },
  { id: "tax", label: "Tax" },
  { id: "review", label: "Reviews" }
];

const kindMeta: Record<CalendarKind, { label: string; color: string; icon: typeof Truck }> = {
  bill: { label: "Bill", color: "#f87171", icon: Truck },
  invoice: { label: "Invoice", color: "#43bd81", icon: FileText },
  payroll: { label: "Payroll", color: "#3b82f6", icon: Users },
  tax: { label: "Tax", color: "#e8b34a", icon: Landmark },
  review: { label: "Review", color: "#8b5cf6", icon: CalendarDays }
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Month key of the reporting date — the calendar opens here. */
const START_MONTH = TODAY.slice(0, 7);

interface DayCell {
  date: string | null;
  day: number;
}

/** Builds a Monday-first grid, padded so the first row starts on a weekday. */
function buildGrid(monthKey: string): DayCell[] {
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  // getUTCDay is Sunday-first; shift so Monday is index 0.
  const offset = (first.getUTCDay() + 6) % 7;

  const cells: DayCell[] = Array.from({ length: offset }, () => ({ date: null, day: 0 }));
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: `${monthKey}-${String(day).padStart(2, "0")}`, day });
  }
  // Pad the tail so the grid is always whole weeks.
  while (cells.length % 7 !== 0) cells.push({ date: null, day: 0 });

  return cells;
}

export function CalendarPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [monthKey, setMonthKey] = useState(START_MONTH);
  const [kind, setKind] = useState<KindFilter>("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(TODAY);

  const visibleEvents = useMemo(
    () => calendarEvents.filter((event) => kind === "all" || event.kind === kind),
    [kind]
  );

  /** Events indexed by date so each grid cell is an O(1) lookup. */
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of visibleEvents) {
      const list = map.get(event.date);
      if (list) list.push(event);
      else map.set(event.date, [event]);
    }
    return map;
  }, [visibleEvents]);

  const grid = useMemo(() => buildGrid(monthKey), [monthKey]);

  const monthEvents = useMemo(
    () => visibleEvents.filter((event) => event.date.startsWith(monthKey)),
    [visibleEvents, monthKey]
  );

  const monthTotals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const event of monthEvents) {
      if (event.amount === undefined) continue;
      if (event.amount >= 0) inflow += event.amount;
      else outflow += Math.abs(event.amount);
    }
    return { inflow, outflow, net: inflow - outflow };
  }, [monthEvents]);

  const upcoming = useMemo(
    () =>
      visibleEvents
        .filter((event) => daysBetween(TODAY, event.date) >= 0)
        .slice(0, 8),
    [visibleEvents]
  );

  const selectedEvents = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  function exportMonth() {
    if (monthEvents.length === 0) {
      addToast({
        title: "Nothing to export",
        body: `No events in ${formatMonthYear(monthKey)} for this filter.`,
        tone: "warning"
      });
      return;
    }

    const csv = toCsv<CalendarEvent>(monthEvents, [
      { header: "Date", value: (event) => event.date },
      { header: "Title", value: (event) => event.title },
      { header: "Kind", value: (event) => kindMeta[event.kind].label },
      { header: "Detail", value: (event) => event.detail },
      { header: "Amount (USD)", value: (event) => (event.amount ?? 0).toFixed(2) }
    ]);

    const ok = downloadCsv(csvFilename("calendar", monthKey), csv);
    addToast(
      ok
        ? {
            title: "Calendar exported",
            body: `${monthEvents.length} events saved as CSV.`,
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
      <section aria-label="Month totals" className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Scheduled in"
          value={monthTotals.inflow}
          icon={ArrowDownLeft}
          caption={formatMonthYear(monthKey)}
          loading={loading}
          tone="gain"
        />
        <StatCard
          label="Scheduled out"
          value={monthTotals.outflow}
          icon={ArrowUpRight}
          caption={formatMonthYear(monthKey)}
          loading={loading}
          tone="loss"
        />
        <StatCard
          label="Net movement"
          value={monthTotals.net}
          icon={CalendarDays}
          caption={`${monthEvents.length} dated events`}
          loading={loading}
          tone={monthTotals.net >= 0 ? "gain" : "loss"}
        />
        <StatCard
          label="Next 30 days"
          value={visibleEvents
            .filter((event) => {
              const days = daysBetween(TODAY, event.date);
              return days >= 0 && days <= 30 && event.amount !== undefined;
            })
            .reduce((sum, event) => sum + (event.amount ?? 0), 0)}
          icon={CalendarDays}
          caption="net across all kinds"
          loading={loading}
        />
      </section>

      <section className="grid animate-rise gap-4 stagger-1 xl:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)]">
        <Card flush>
          <div className="border-b border-line p-5">
            <CardHeader
              title={formatMonthYear(monthKey)}
              description="Every bill, invoice, payroll run and deadline in the period"
              actions={
                <>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ChevronLeft}
                      aria-label="Previous month"
                      onClick={() => setMonthKey((current) => addMonths(current, -1))}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMonthKey(START_MONTH)}
                      disabled={monthKey === START_MONTH}
                    >
                      Today
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ChevronRight}
                      aria-label="Next month"
                      onClick={() => setMonthKey((current) => addMonths(current, 1))}
                    />
                  </div>
                  <Button variant="secondary" size="md" icon={Download} onClick={exportMonth}>
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </>
              }
            />

            <div className="mt-4 overflow-x-auto no-scrollbar">
              <SegmentedControl
                label="Event kind"
                options={kindTabs}
                value={kind}
                onChange={setKind}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-5">
              <Skeleton className="h-[420px] w-full" />
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${formatMonthYear(monthKey)} calendar`}>
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    role="columnheader"
                    className="px-1 pb-2 text-center text-label font-semibold uppercase text-inkSubtle"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day[0]}</span>
                  </div>
                ))}

                {grid.map((cell, index) => {
                  if (!cell.date) {
                    return <div key={`pad-${index}`} role="gridcell" aria-hidden />;
                  }

                  const events = byDate.get(cell.date) ?? [];
                  const isToday = cell.date === TODAY;
                  const isSelected = cell.date === selectedDate;

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      role="gridcell"
                      aria-label={`${fmt.date(cell.date)}, ${events.length} events`}
                      aria-selected={isSelected}
                      onClick={() => setSelectedDate(cell.date)}
                      className={cn(
                        "flex min-h-[3.5rem] flex-col rounded-control border p-1.5 text-left transition duration-150 sm:min-h-[5.5rem] sm:p-2",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400",
                        isSelected
                          ? "border-aurum-400/60 bg-aurum-400/[0.08] ring-1 ring-aurum-400/40"
                          : "border-line hover:border-lineStrong hover:bg-surfaceMuted"
                      )}
                    >
                      <span
                        className={cn(
                          "numeric self-start rounded-full px-1.5 text-xs font-semibold leading-5",
                          isToday
                            ? "bg-aurum-400 text-aurum-950"
                            : events.length > 0
                              ? "text-ink"
                              : "text-inkSubtle"
                        )}
                      >
                        {cell.day}
                      </span>

                      {/* Dots on mobile, labelled chips once there is room. */}
                      <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                        {events.slice(0, 3).map((event) => (
                          <span
                            key={event.id}
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: kindMeta[event.kind].color }}
                          />
                        ))}
                      </span>

                      <span className="mt-1 hidden min-w-0 flex-1 flex-col gap-0.5 sm:flex">
                        {events.slice(0, 2).map((event) => (
                          <span
                            key={event.id}
                            className="truncate rounded-[4px] px-1 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: `${kindMeta[event.kind].color}1f`,
                              color: kindMeta[event.kind].color
                            }}
                          >
                            {event.title}
                          </span>
                        ))}
                        {events.length > 2 ? (
                          <span className="px-1 text-[10px] text-inkSubtle">
                            +{events.length - 2} more
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                {(Object.keys(kindMeta) as CalendarKind[]).map((key) => (
                  <span key={key} className="flex items-center gap-1.5 text-xs text-inkMuted">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: kindMeta[key].color }}
                    />
                    {kindMeta[key].label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {/* Selected day */}
          <Card>
            <CardHeader
              title={selectedDate ? fmt.date(selectedDate) : "Select a day"}
              description={
                selectedEvents.length === 1
                  ? "1 event on this date"
                  : `${selectedEvents.length} events on this date`
              }
            />

            {selectedEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled"
                description="Pick another day, or clear the kind filter to see everything."
                className="py-8"
              />
            ) : (
              <ul className="mt-4 space-y-2.5">
                {selectedEvents.map((event) => {
                  const meta = kindMeta[event.kind];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={event.id}
                      className="flex items-start gap-3 rounded-control border border-line p-3"
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-control"
                        style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
                      >
                        <Icon size={15} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{event.title}</p>
                        <p className="truncate text-xs text-inkMuted">{event.detail}</p>
                      </div>
                      {event.amount !== undefined ? (
                        <p
                          className={cn(
                            "numeric shrink-0 text-sm font-semibold",
                            event.amount >= 0
                              ? "text-gain-600 dark:text-gain-400"
                              : "text-loss-600 dark:text-loss-400"
                          )}
                        >
                          {fmt.signed(event.amount)}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader title="Coming up" description="Next dated obligations" />
            <ul className="mt-4 space-y-0.5">
              {upcoming.length === 0 ? (
                <li className="py-6 text-center text-sm text-inkMuted">
                  Nothing upcoming for this filter.
                </li>
              ) : (
                upcoming.map((event) => {
                  const meta = kindMeta[event.kind];
                  const days = daysBetween(TODAY, event.date);
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setMonthKey(event.date.slice(0, 7));
                          setSelectedDate(event.date);
                        }}
                        className="flex w-full items-center gap-3 rounded-control px-2 py-2.5 text-left transition-colors hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400"
                      >
                        <span
                          aria-hidden
                          className="h-8 w-1 shrink-0 rounded-pill"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">
                            {event.title}
                          </span>
                          <span className="block truncate text-xs text-inkMuted">
                            {fmt.date(event.date)}
                          </span>
                        </span>
                        <Badge tone={days <= 3 ? "warn" : "neutral"}>
                          {days === 0 ? "Today" : `${days}d`}
                        </Badge>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </Card>
        </div>
      </section>
    </>
  );
}
