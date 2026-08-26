"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Receipt,
  Search,
  Store,
  Truck,
  Users,
  X
} from "lucide-react";
import { useDebouncedValue, useDismissable } from "@/lib/hooks";
import { useFormat } from "@/components/providers/app-provider";
import { searchAll, type SearchResultKind } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const kindIcon: Record<SearchResultKind, typeof Search> = {
  page: LayoutDashboard,
  transaction: Receipt,
  account: CreditCard,
  merchant: Store,
  client: Users,
  invoice: FileText,
  vendor: Store,
  bill: Truck
};

const kindLabel: Record<SearchResultKind, string> = {
  page: "Page",
  transaction: "Transaction",
  account: "Account",
  merchant: "Merchant",
  client: "Client",
  invoice: "Invoice",
  vendor: "Vendor",
  bill: "Bill"
};

/**
 * Searches invoices, clients, vendors, bills, transactions and accounts.
 * Results are keyboard navigable and each one routes somewhere real, deep-
 * linking into the right module with the query pre-applied.
 */
export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const fmt = useFormat();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useDismissable<HTMLDivElement>(open, () => setOpen(false));

  const debounced = useDebouncedValue(query, 160);
  const results = useMemo(() => searchAll(debounced), [debounced]);

  useEffect(() => setHighlight(0), [debounced]);

  /* Cmd/Ctrl+K focuses search from anywhere. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(index: number) {
    const result = results[index];
    if (!result) return;
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(result.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(highlight);
    }
  }

  const showPanel = open && debounced.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSubtle"
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        aria-label="Search invoices, clients, vendors, transactions and accounts"
        placeholder="Search invoices, clients, vendors…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-control border border-line bg-surface pl-10 pr-16 text-sm text-ink outline-none transition duration-150 ease-smooth placeholder:text-inkSubtle hover:border-lineStrong focus:border-aurum-400 focus:ring-2 focus:ring-aurum-400/25 [&::-webkit-search-cancel-button]:hidden"
      />

      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-inkSubtle transition hover:bg-surfaceMuted hover:text-ink"
        >
          <X size={14} />
        </button>
      ) : (
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surfaceMuted px-1.5 py-0.5 text-[10px] font-medium text-inkSubtle sm:block"
        >
          ⌘K
        </kbd>
      )}

      {showPanel ? (
        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-12 z-50 animate-rise overflow-hidden rounded-card border border-line bg-surface shadow-overlay"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-inkMuted">
              No matches for “{debounced.trim()}”
            </p>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto py-1.5">
              {results.map((result, index) => {
                const Icon = kindIcon[result.kind];
                const active = index === highlight;
                return (
                  <li key={result.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => go(index)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        active ? "bg-surfaceMuted" : "hover:bg-surfaceMuted"
                      )}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control border border-line bg-surface text-inkSubtle">
                        <Icon size={15} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {result.title}
                        </span>
                        <span className="block truncate text-xs text-inkMuted">
                          {kindLabel[result.kind]} · {result.subtitle}
                        </span>
                      </span>
                      {result.amount !== undefined ? (
                        <span
                          className={cn(
                            "numeric shrink-0 text-sm font-semibold",
                            result.amount >= 0
                              ? "text-gain-600 dark:text-gain-400"
                              : "text-ink"
                          )}
                        >
                          {fmt.signed(result.amount)}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
