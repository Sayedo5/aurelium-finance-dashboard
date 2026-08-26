"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CircleDollarSign,
  Download,
  Mail,
  MapPin,
  Phone,
  Search,
  TrendingUp,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer, DetailRow } from "@/components/ui/drawer";
import { Field, Input, SegmentedControl, Select } from "@/components/ui/field";
import { Avatar, ClientStatusBadge, InvoiceStatusBadge, Pill } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useDebouncedValue, useSimulatedLoading } from "@/lib/hooks";
import {
  clientRevenueMap,
  clients,
  industries,
  invoiceTotal,
  invoices,
  teamMap,
  teamMembers
} from "@/lib/mock-data";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { ratioToPercent } from "@/lib/utils";
import type { Client, ClientStatus } from "@/lib/types";

type StatusFilter = ClientStatus | "all";

const statusTabs: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "prospect", label: "Prospects" },
  { id: "churned", label: "Churned" }
];

export function ClientsPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [industry, setIndustry] = useState("all");
  const [ownerId, setOwnerId] = useState("all");
  const [selected, setSelected] = useState<Client | null>(null);

  // Search results deep-link here as /dashboard/clients?client=cl-004.
  const initialClient = searchParams.get("client");
  useEffect(() => {
    if (!initialClient) return;
    const match = clients.find((client) => client.id === initialClient);
    if (match) setSelected(match);
  }, [initialClient]);

  const debouncedQuery = useDebouncedValue(query, 180);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    return clients.filter((client) => {
      if (status !== "all" && client.status !== status) return false;
      if (industry !== "all" && client.industry !== industry) return false;
      if (ownerId !== "all" && client.ownerId !== ownerId) return false;
      if (needle) {
        const haystack = `${client.name} ${client.contactName} ${client.email} ${client.industry} ${client.city}`;
        if (!haystack.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [debouncedQuery, status, industry, ownerId]);

  const totals = useMemo(() => {
    const active = clients.filter((client) => client.status === "active").length;
    const lifetime = clients.reduce(
      (sum, client) => sum + (clientRevenueMap[client.id]?.lifetime ?? 0),
      0
    );
    const outstanding = clients.reduce(
      (sum, client) => sum + (clientRevenueMap[client.id]?.outstanding ?? 0),
      0
    );
    return { active, lifetime, outstanding, average: active ? lifetime / active : 0 };
  }, []);

  const topClients = useMemo(
    () =>
      clients
        .map((client) => ({
          client,
          lifetime: clientRevenueMap[client.id]?.lifetime ?? 0
        }))
        .filter((row) => row.lifetime > 0)
        .sort((a, b) => b.lifetime - a.lifetime)
        .slice(0, 6),
    []
  );

  const topValue = topClients[0]?.lifetime ?? 1;

  const activeFilters =
    (status !== "all" ? 1 : 0) +
    (industry !== "all" ? 1 : 0) +
    (ownerId !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  function reset() {
    setQuery("");
    setStatus("all");
    setIndustry("all");
    setOwnerId("all");
  }

  function exportClients() {
    if (filtered.length === 0) {
      addToast({
        title: "Nothing to export",
        body: "No clients match the current filters.",
        tone: "warning"
      });
      return;
    }

    const csv = toCsv<Client>(filtered, [
      { header: "Client", value: (client) => client.name },
      { header: "Contact", value: (client) => client.contactName },
      { header: "Email", value: (client) => client.email },
      { header: "Phone", value: (client) => client.phone },
      { header: "Industry", value: (client) => client.industry },
      { header: "City", value: (client) => client.city },
      { header: "Country", value: (client) => client.country },
      { header: "Status", value: (client) => client.status },
      { header: "Terms", value: (client) => `Net ${client.paymentTerms}` },
      { header: "Owner", value: (client) => teamMap[client.ownerId]?.name ?? "" },
      { header: "Since", value: (client) => client.since },
      {
        header: "Lifetime billings (USD)",
        value: (client) => (clientRevenueMap[client.id]?.lifetime ?? 0).toFixed(2)
      },
      {
        header: "Outstanding (USD)",
        value: (client) => (clientRevenueMap[client.id]?.outstanding ?? 0).toFixed(2)
      }
    ]);

    const ok = downloadCsv(csvFilename("clients", status), csv);
    addToast(
      ok
        ? { title: "Clients exported", body: `${filtered.length} rows saved as CSV.`, tone: "success" }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  const columns: Column<Client>[] = [
    {
      id: "name",
      header: "Client",
      sortValue: (client) => client.name,
      cell: (client) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar initials={client.name.slice(0, 2).toUpperCase()} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{client.name}</p>
            <p className="truncate text-xs text-inkMuted">{client.contactName}</p>
          </div>
        </div>
      )
    },
    {
      id: "industry",
      header: "Industry",
      hideBelow: "lg",
      sortValue: (client) => client.industry,
      cell: (client) => <Pill>{client.industry}</Pill>
    },
    {
      id: "location",
      header: "Location",
      hideBelow: "xl",
      sortValue: (client) => client.city,
      cell: (client) => (
        <span className="whitespace-nowrap text-inkMuted">
          {client.city}, {client.country}
        </span>
      )
    },
    {
      id: "status",
      header: "Status",
      sortValue: (client) => client.status,
      cell: (client) => <ClientStatusBadge status={client.status} />
    },
    {
      id: "outstanding",
      header: "Outstanding",
      align: "right",
      hideBelow: "md",
      sortValue: (client) => clientRevenueMap[client.id]?.outstanding ?? 0,
      cell: (client) => {
        const value = clientRevenueMap[client.id]?.outstanding ?? 0;
        return (
          <span
            className={
              value > 0
                ? "numeric whitespace-nowrap font-semibold text-ink"
                : "numeric whitespace-nowrap text-inkSubtle"
            }
          >
            {value > 0 ? fmt.money(value) : "—"}
          </span>
        );
      }
    },
    {
      id: "lifetime",
      header: "Lifetime",
      align: "right",
      sortValue: (client) => clientRevenueMap[client.id]?.lifetime ?? 0,
      cell: (client) => (
        <span className="numeric whitespace-nowrap font-semibold text-ink">
          {fmt.money(clientRevenueMap[client.id]?.lifetime ?? 0)}
        </span>
      )
    }
  ];

  return (
    <>
      <section aria-label="Client summary" className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active clients"
          value={totals.active}
          icon={Users}
          caption={`of ${clients.length} in the directory`}
          loading={loading}
          format={(value) => String(Math.round(value))}
        />
        <StatCard
          label="Lifetime billings"
          value={totals.lifetime}
          icon={TrendingUp}
          caption="across all invoices raised"
          loading={loading}
          tone="gain"
        />
        <StatCard
          label="Outstanding"
          value={totals.outstanding}
          icon={CircleDollarSign}
          caption="awaiting payment"
          loading={loading}
        />
        <StatCard
          label="Average client value"
          value={totals.average}
          icon={Building2}
          caption="lifetime, active clients"
          loading={loading}
        />
      </section>

      <section className="grid animate-rise gap-4 stagger-1 xl:grid-cols-[minmax(0,1fr),minmax(0,1.4fr)]">
        <Card>
          <CardHeader title="Top clients" description="Ranked by lifetime billings" />
          <div className="mt-5 space-y-3.5">
            {topClients.map((row, index) => (
              <button
                key={row.client.id}
                type="button"
                onClick={() => setSelected(row.client)}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400"
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{row.client.name}</span>
                  <span className="numeric shrink-0 font-semibold text-ink">
                    {fmt.money(row.lifetime)}
                  </span>
                </div>
                <Progress
                  value={ratioToPercent(row.lifetime, topValue)}
                  className="mt-2"
                  delayMs={index * 60}
                  label={`${row.client.name} share of top billings`}
                />
              </button>
            ))}
          </div>
        </Card>

        <Card flush>
          <div className="border-b border-line p-4">
            <CardHeader
              title="Directory"
              description={`${filtered.length} of ${clients.length} clients`}
              actions={
                <>
                  <Button variant="secondary" size="md" icon={Download} onClick={exportClients}>
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button
                    variant="accent"
                    icon={UserPlus}
                    onClick={() =>
                      addToast({
                        title: "Client intake opened",
                        body: "New client onboarding is handled by the sales workspace.",
                        tone: "info"
                      })
                    }
                  >
                    <span className="hidden sm:inline">Add client</span>
                  </Button>
                </>
              }
            />
          </div>

          <DataTable
            rows={filtered}
            columns={columns}
            rowKey={(client) => client.id}
            loading={loading}
            onRowClick={setSelected}
            pageSize={10}
            minWidth="640px"
            initialSort={{ id: "lifetime", dir: "desc" }}
            emptyTitle="No clients match these filters"
            emptyDescription="Try a different industry or account manager."
            emptyAction={
              <Button variant="secondary" size="sm" icon={X} onClick={reset}>
                Clear filters
              </Button>
            }
            mobileCard={(client) => (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={client.name.slice(0, 2).toUpperCase()} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{client.name}</p>
                      <p className="truncate text-xs text-inkMuted">{client.industry}</p>
                    </div>
                  </div>
                  <p className="numeric shrink-0 font-semibold text-ink">
                    {fmt.money(clientRevenueMap[client.id]?.lifetime ?? 0)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ClientStatusBadge status={client.status} />
                  <span className="text-xs text-inkMuted">
                    {client.city} · Net {client.paymentTerms}
                  </span>
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
                      placeholder="Search name, contact or city…"
                      aria-label="Search clients"
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
                    label="Client status"
                    options={statusTabs}
                    value={status}
                    onChange={setStatus}
                    className="h-10 items-center"
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Industry">
                    <Select
                      value={industry}
                      aria-label="Filter by industry"
                      onChange={(event) => setIndustry(event.target.value)}
                    >
                      <option value="all">All industries</option>
                      {industries.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Account manager">
                    <Select
                      value={ownerId}
                      aria-label="Filter by account manager"
                      onChange={(event) => setOwnerId(event.target.value)}
                    >
                      <option value="all">Anyone</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                {activeFilters > 0 ? (
                  <div className="mt-3">
                    <Button variant="ghost" size="sm" icon={X} onClick={reset}>
                      Clear filters
                    </Button>
                  </div>
                ) : null}
              </div>
            }
          />
        </Card>
      </section>

      <Drawer
        open={selected !== null}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.industry} · ${selected.city}, ${selected.country}` : undefined}
        onClose={() => setSelected(null)}
        width="lg"
        footer={
          selected ? (
            <>
              <Link href={`/dashboard/invoices?q=${encodeURIComponent(selected.name)}`}>
                <Button variant="secondary">View invoices</Button>
              </Link>
              <Button
                variant="accent"
                icon={Mail}
                onClick={() => {
                  addToast({
                    title: "Draft opened",
                    body: `A message to ${selected.contactName} would open in your mail client.`,
                    tone: "info"
                  });
                  setSelected(null);
                }}
              >
                Contact
              </Button>
            </>
          ) : null
        }
      >
        {selected ? <ClientDetail client={selected} /> : null}
      </Drawer>
    </>
  );
}

function ClientDetail({ client }: { client: Client }) {
  const fmt = useFormat();
  const revenue = clientRevenueMap[client.id];
  const owner = teamMap[client.ownerId];
  const clientInvoices = invoices
    .filter((invoice) => invoice.clientId === client.id)
    .slice(0, 10);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ClientStatusBadge status={client.status} />
        <Pill>Net {client.paymentTerms}</Pill>
        <Pill>{client.industry}</Pill>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-control border border-line p-3">
          <p className="eyebrow">Lifetime</p>
          <p className="numeric mt-1.5 text-lg font-semibold text-ink">
            {fmt.money(revenue?.lifetime ?? 0)}
          </p>
        </div>
        <div className="rounded-control border border-line p-3">
          <p className="eyebrow">Outstanding</p>
          <p className="numeric mt-1.5 text-lg font-semibold text-ink">
            {fmt.money(revenue?.outstanding ?? 0)}
          </p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-line border-y border-line">
        <DetailRow label="Contact">{client.contactName}</DetailRow>
        <DetailRow label="Email">
          <a href={`mailto:${client.email}`} className="inline-flex items-center gap-1.5 hover:underline">
            <Mail size={13} aria-hidden className="text-inkSubtle" />
            {client.email}
          </a>
        </DetailRow>
        <DetailRow label="Phone">
          <span className="inline-flex items-center gap-1.5">
            <Phone size={13} aria-hidden className="text-inkSubtle" />
            {client.phone}
          </span>
        </DetailRow>
        <DetailRow label="Location">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} aria-hidden className="text-inkSubtle" />
            {client.city}, {client.country}
          </span>
        </DetailRow>
        <DetailRow label="Account manager">{owner?.name ?? "Unassigned"}</DetailRow>
        <DetailRow label="Client since">{fmt.date(client.since)}</DetailRow>
        <DetailRow label="Invoices raised">{revenue?.invoiceCount ?? 0}</DetailRow>
      </dl>

      <h3 className="mt-6 text-sm font-semibold text-ink">Invoice history</h3>
      {clientInvoices.length === 0 ? (
        <p className="mt-3 rounded-control border border-line bg-surfaceMuted px-4 py-6 text-center text-sm text-inkMuted">
          No invoices have been raised against this client yet.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-control border border-line">
          {clientInvoices.map((invoice) => (
            <li key={invoice.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="numeric text-sm font-medium text-ink">{invoice.number}</p>
                <p className="text-xs text-inkMuted">Issued {fmt.date(invoice.issuedOn)}</p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
              <p className="numeric shrink-0 text-sm font-semibold text-ink">
                {fmt.money(invoiceTotal(invoice))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
