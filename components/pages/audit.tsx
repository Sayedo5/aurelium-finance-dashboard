"use client";

import { useMemo, useState } from "react";
import { Activity, Download, Search, ShieldAlert, ScrollText, Users, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, Input, SegmentedControl, Select } from "@/components/ui/field";
import { Avatar, Pill, SeverityBadge } from "@/components/ui/badge";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useDebouncedValue, useSimulatedLoading } from "@/lib/hooks";
import { auditActions, auditEvents, auditTargets, roleMap, teamMap, teamMembers } from "@/lib/mock-data";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import type { AuditEvent, AuditSeverity } from "@/lib/types";

type SeverityFilter = AuditSeverity | "all";

const severityTabs: Array<{ id: SeverityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "info", label: "Info" },
  { id: "notice", label: "Notice" },
  { id: "critical", label: "Critical" }
];

/** Renders the stored UTC timestamp without pulling in a date library. */
function formatTime(at: string) {
  return at.slice(11, 16);
}

export function AuditPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [actorId, setActorId] = useState("all");
  const [action, setAction] = useState("all");
  const [target, setTarget] = useState("all");

  const debouncedQuery = useDebouncedValue(query, 180);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    return auditEvents.filter((event) => {
      if (severity !== "all" && event.severity !== severity) return false;
      if (actorId !== "all" && event.actorId !== actorId) return false;
      if (action !== "all" && event.action !== action) return false;
      if (target !== "all" && event.target !== target) return false;
      if (needle) {
        const actor = teamMap[event.actorId];
        const haystack = `${event.action} ${event.target} ${event.detail} ${actor?.name ?? ""} ${event.ip}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [debouncedQuery, severity, actorId, action, target]);

  const stats = useMemo(() => {
    const critical = auditEvents.filter((event) => event.severity === "critical").length;
    const actors = new Set(auditEvents.map((event) => event.actorId)).size;
    const days = new Set(auditEvents.map((event) => event.at.slice(0, 10))).size;
    return { critical, actors, days };
  }, []);

  const activeFilters =
    (severity !== "all" ? 1 : 0) +
    (actorId !== "all" ? 1 : 0) +
    (action !== "all" ? 1 : 0) +
    (target !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  function reset() {
    setQuery("");
    setSeverity("all");
    setActorId("all");
    setAction("all");
    setTarget("all");
  }

  function exportLog() {
    if (filtered.length === 0) {
      addToast({
        title: "Nothing to export",
        body: "No events match the current filters.",
        tone: "warning"
      });
      return;
    }

    const csv = toCsv<AuditEvent>(filtered, [
      { header: "Timestamp (UTC)", value: (event) => event.at },
      { header: "Actor", value: (event) => teamMap[event.actorId]?.name ?? event.actorId },
      { header: "Role", value: (event) => roleMap[teamMap[event.actorId]?.roleId ?? "viewer"].label },
      { header: "Action", value: (event) => event.action },
      { header: "Target", value: (event) => event.target },
      { header: "Detail", value: (event) => event.detail },
      { header: "Severity", value: (event) => event.severity },
      { header: "IP", value: (event) => event.ip }
    ]);

    const ok = downloadCsv(csvFilename("audit-log", severity), csv);
    addToast(
      ok
        ? {
            title: "Audit log exported",
            body: `${filtered.length} events saved as CSV.`,
            tone: "success"
          }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  const columns: Column<AuditEvent>[] = [
    {
      id: "at",
      header: "When",
      sortValue: (event) => event.at,
      cell: (event) => (
        <div className="min-w-0">
          <p className="whitespace-nowrap font-medium text-ink">{fmt.date(event.at.slice(0, 10))}</p>
          <p className="numeric text-xs text-inkMuted">{formatTime(event.at)} UTC</p>
        </div>
      )
    },
    {
      id: "actor",
      header: "Actor",
      sortValue: (event) => teamMap[event.actorId]?.name ?? "",
      cell: (event) => {
        const actor = teamMap[event.actorId];
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar initials={actor?.initials ?? "??"} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{actor?.name ?? "Unknown"}</p>
              <p className="truncate text-xs text-inkMuted">
                {actor ? roleMap[actor.roleId].label : "—"}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      id: "action",
      header: "Action",
      sortValue: (event) => event.action,
      cell: (event) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{event.action}</p>
          <p className="truncate text-xs text-inkMuted">{event.detail}</p>
        </div>
      )
    },
    {
      id: "target",
      header: "Area",
      hideBelow: "lg",
      sortValue: (event) => event.target,
      cell: (event) => <Pill>{event.target}</Pill>
    },
    {
      id: "ip",
      header: "Source",
      hideBelow: "xl",
      sortValue: (event) => event.ip,
      cell: (event) => <span className="numeric text-xs text-inkMuted">{event.ip}</span>
    },
    {
      id: "severity",
      header: "Severity",
      align: "right",
      sortValue: (event) => ({ info: 0, notice: 1, critical: 2 })[event.severity],
      cell: (event) => <SeverityBadge severity={event.severity} />
    }
  ];

  return (
    <>
      <section aria-label="Audit summary" className="grid animate-rise gap-4 sm:grid-cols-3">
        <StatCard
          label="Events recorded"
          value={auditEvents.length}
          icon={ScrollText}
          caption={`across ${stats.days} days`}
          loading={loading}
          format={(value) => String(Math.round(value))}
        />
        <StatCard
          label="Critical actions"
          value={stats.critical}
          icon={ShieldAlert}
          caption="role changes, approvals, security"
          loading={loading}
          format={(value) => String(Math.round(value))}
          tone={stats.critical > 0 ? "loss" : "neutral"}
        />
        <StatCard
          label="Distinct actors"
          value={stats.actors}
          icon={Users}
          caption="members with recorded activity"
          loading={loading}
          format={(value) => String(Math.round(value))}
        />
      </section>

      <Card flush className="animate-rise stagger-1">
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(event) => event.id}
          loading={loading}
          pageSize={15}
          minWidth="760px"
          initialSort={{ id: "at", dir: "desc" }}
          emptyTitle="No events match these filters"
          emptyDescription="Try a different actor, action or severity."
          emptyAction={
            <Button variant="secondary" size="sm" icon={X} onClick={reset}>
              Clear filters
            </Button>
          }
          mobileCard={(event) => {
            const actor = teamMap[event.actorId];
            return (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar initials={actor?.initials ?? "??"} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{event.action}</p>
                      <p className="truncate text-xs text-inkMuted">{actor?.name}</p>
                    </div>
                  </div>
                  <SeverityBadge severity={event.severity} />
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-inkMuted">{event.detail}</p>
                <p className="numeric mt-2 text-xs text-inkSubtle">
                  {fmt.date(event.at.slice(0, 10))} · {formatTime(event.at)} UTC · {event.ip}
                </p>
              </>
            );
          }}
          toolbar={
            <div className="border-b border-line p-4 sm:p-5">
              <CardHeader
                title="Activity log"
                description="Who changed what, when, and from where"
                actions={
                  <>
                    <SegmentedControl
                      label="Severity"
                      options={severityTabs}
                      value={severity}
                      onChange={setSeverity}
                    />
                    <Button variant="secondary" size="md" icon={Download} onClick={exportLog}>
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </>
                }
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Search">
                  <div className="relative">
                    <Input
                      icon={Search}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Action, detail or IP…"
                      aria-label="Search the audit log"
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
                </Field>

                <Field label="Actor">
                  <Select
                    value={actorId}
                    aria-label="Filter by actor"
                    onChange={(event) => setActorId(event.target.value)}
                  >
                    <option value="all">Anyone</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Action">
                  <Select
                    value={action}
                    aria-label="Filter by action"
                    onChange={(event) => setAction(event.target.value)}
                  >
                    <option value="all">Any action</option>
                    {auditActions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Area">
                  <Select
                    value={target}
                    aria-label="Filter by area"
                    onChange={(event) => setTarget(event.target.value)}
                  >
                    <option value="all">Any area</option>
                    {auditTargets.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-inkMuted">
                  <Activity size={13} aria-hidden className="text-inkSubtle" />
                  <strong className="numeric font-semibold text-ink">{filtered.length}</strong> of{" "}
                  {auditEvents.length} events
                </span>
                {activeFilters > 0 ? (
                  <Button variant="ghost" size="sm" icon={X} onClick={reset}>
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </div>
          }
        />
      </Card>

      <p className="animate-rise px-1 text-xs leading-relaxed text-inkMuted stagger-2">
        The audit log is append-only and cannot be edited from the interface. Entries are retained
        for the life of the workspace and are exportable at any time.
      </p>
    </>
  );
}
