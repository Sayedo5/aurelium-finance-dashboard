# Aurelium Ledger — Business Finance Dashboard

A finance dashboard for a growing business: balances across every account, income
versus expense trends, a fully filterable transaction ledger, monthly budget
tracking, and savings goals with funding projections.

> **Live demo:** _add the deployment URL here_

![Overview](./screenshots/01-overview.png)

## Features

**Overview**
- Four animated KPI cards — total balance, income, expenses and net cash — each
  with month-over-month change and directional colouring.
- Income vs. expense area chart with a 3M / 6M range toggle.
- July spend donut, net-cash-by-month bars, recent activity feed, budget health
  bars, and the headline savings goal.

**Transactions**
- 174 generated transactions across six months and four accounts.
- Live search across merchant, memo, ID and category.
- Filters: direction (all/income/expenses), category, account, status, and an
  inclusive from/to month range.
- Sortable by date, merchant or signed amount; 12 rows per page with pagination.
- Income / expense / net totals recompute against the current filter set.
- CSV export action wired to a toast confirmation.

**Accounts**
- Four accounts — checking, reserve, savings and a credit card with a
  utilisation bar against its limit.
- Selecting an account drives its activity list, July inflow/outflow summary and
  detail panel.

**Budgets**
- Seven category budgets with animated progress bars, staggered on load.
- Over-budget categories turn red and are flagged; filter by on-track vs. over.
- "New budget" modal validates input and adds to the list.

**Savings Goals**
- Four goals with progress bars and an animated SVG ring for the selected goal.
- Funding plan panel computes months remaining from the monthly contribution.
- "Add funds" modal with preset amounts; contributions apply immediately and are
  capped at the goal target.

**Settings**
- Four tabs — profile, preferences, notifications, security — with working form
  state, toggle switches, theme control and a revocable session list.

**Throughout**
- Dark theme by default with a light mode toggle; the choice persists to
  `localStorage` and is applied before first paint so there is no flash.
- Animated count-ups on every KPI, skeleton loaders on first render, chart entry
  animations and custom themed tooltips.
- Fully responsive: the sidebar becomes an overlay drawer below `lg`, KPI grids
  collapse 4 → 2 → 1, and the transaction table scrolls horizontally rather than
  breaking.
- `prefers-reduced-motion` is honoured — count-ups snap and transitions are
  disabled.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 with CSS-variable theme tokens |
| Charts | Recharts 2 |
| Icons | lucide-react |
| Fonts | Inter via `next/font` |

## Design

Dark navy canvas (`#06101d`) with an emerald brand accent (`#1fb36a`) for
positive figures and rose (`#f43f5e`) for expenses — so the sign of a number is
readable before the digits are. Amounts use tabular figures so columns align.
Both themes are defined as CSS variables on `:root` / `.dark`.

## Data

All data is local and deterministic — there is no backend. The ledger is
generated in `lib/mock-data.ts` from handwritten merchant seeds (AWS, Gusto,
Google Ads, Atlas Workspace and so on) so rows read like real business activity
while there are enough of them for filtering and pagination to be meaningful.
The generator avoids `Date.now()` and `Math.random()` so the server and client
render identical output.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

## Project Structure

```
app/                    routes: /, /transactions, /accounts, /budgets,
                        /goals, /analytics, /settings
components/
  charts/               Recharts wrappers with themed tooltips
  layout/               dashboard shell
  navigation/           sidebar, topbar, logo, theme toggle
  pages/                one client component per route
  providers/            theme, notifications and toast context
  ui/                   button, card, input, modal, progress,
                        skeleton, stat-card, badge, toast
lib/
  mock-data.ts          accounts, ledger generator, budgets, goals
  selectors.ts          derived totals and aggregations
  hooks.ts              useCountUp, useSimulatedLoading, useMounted
  types.ts              shared domain types
  utils.ts              currency, date and percentage formatting
```

## Related Project

This is the small/mid-business scale finance dashboard. See
**enterprise-finance-dashboard** for the larger enterprise reporting build with
multi-department views, approval workflows and role-based navigation.
