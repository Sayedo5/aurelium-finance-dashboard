# Aurelium Ledger

**Every number your business runs on, in one calm place — a 16-module finance platform with a public product site.**

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-D99A29?style=flat-square)
![Routes](https://img.shields.io/badge/routes-25_static-1FA163?style=flat-square)
![Accessibility](https://img.shields.io/badge/a11y-WCAG_AA-1FA163?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-64748B?style=flat-square)

---

## What it is

Aurelium Ledger is a complete business finance product: a **public marketing portal** that
explains the offering, and a **sixteen-module dashboard** behind it covering receivables,
payables, planning, statutory reporting and governance.

It is built for the person who owns the numbers — a **finance lead, founder or bookkeeper
at a small-to-mid-size business** who needs to answer "where did the money go, who owes us,
what is due, and are we going to be fine?" without opening four bank tabs and a spreadsheet.

The interface is deliberately quiet. Gold marks what matters, green and red mean exactly one
thing each (money in, money out), and nothing animates unless the movement carries information.

> **Live demo:** _not yet deployed — replace this line with the deployment URL_

## Screenshots

### Desktop

![desktop](./screenshots/desktop.png)

### Tablet

![tablet](./screenshots/tablet.png)

### Mobile

![mobile](./screenshots/mobile.png)

---

## Site map

**Public portal**

| Route | What it is |
| --- | --- |
| `/` | Landing — hero with a live data preview, module grid, proof stats, design principles |
| `/features` | Full breakdown of every module, grouped by job, plus the engineering underneath |
| `/pricing` | Three tiers, a working monthly/annual toggle, a line-by-line comparison table, FAQ |
| `/about` | What it is, who it is for, the principles, the story, the workspace team, the stack |
| `/contact` | Validated contact form with a real submitted state |
| `/login` | Demonstration sign-in flow into the dashboard |

**Dashboard** — grouped in the sidebar by what you are trying to do

| Group | Routes |
| --- | --- |
| Overview | `/dashboard` · `/dashboard/analytics` · `/dashboard/calendar` |
| Money in | `/dashboard/invoices` · `/dashboard/clients` |
| Money out | `/dashboard/bills` · `/dashboard/transactions` · `/dashboard/accounts` |
| Planning | `/dashboard/budgets` · `/dashboard/goals` · `/dashboard/forecast` · `/dashboard/reports` · `/dashboard/tax` |
| Workspace | `/dashboard/team` · `/dashboard/audit` · `/dashboard/settings` |

---

## Key features

### Money in

**Invoices** — Line-item invoices with quantity, unit price and tax rate across five states
(draft, sent, paid, overdue, void). A full **A/R ageing report** splits receivables into
current / 1–30 / 31–60 / 61–90 / 90+ day buckets, each clickable to filter the list.
Days-sales-outstanding is computed from real settlement dates. A detail drawer shows the
line breakdown, subtotal, tax and total, and exports just those lines.

**Clients** — Forty accounts with contacts, industry, country, net terms and an assigned
account manager. Lifetime billings and outstanding balance per client, ranked. Filter by
status, industry and owner. The client drawer lists every invoice ever raised against them.

### Money out

**Bills & vendors** — A forty-supplier vendor book mapped to spend categories, with draft,
scheduled, paid and overdue bills. Recurring bills are flagged and separable. The
**working-capital position** (receivable minus payable) sits at the top.

**Transaction ledger** — ~640 transactions across twelve months and five accounts.
Debounced search, seven filters including an inclusive from/to month range, sortable
columns, selectable page size, and a CSV export of exactly what is on screen.

**Accounts** — Operating checking, payroll clearing, tax reserve, growth savings and a
credit line with a utilisation bar. Selecting an account drives its statement, monthly
inflow/outflow and per-account CSV export.

### Planning

**Budgets** — Ten category budgets with on-track, **near-limit (≥90%)** and over states.
Create or edit through a validated modal with a real category picker.

**Forecast** — Twelve months projected from the trailing three-month average across three
scenarios, with **live sliders** for revenue growth, expense growth and planned monthly
cost. Runway and break-even month are stated, and the projection is dashed so actuals and
model never blur together.

**Reports** — Profit & loss (with a cost-of-revenue split), balance sheet, and an indirect
cashflow statement. Every statement has a period comparison, a variance column and CSV export.

**Tax centre** — Five quarterly periods with filed / due / upcoming states, estimated
liability against amount paid, the shortfall, and a **working set-aside calculator**.

**Savings goals** — Reserve targets with animated funding rings, months-remaining maths and
contributions that apply immediately and cap at the target.

**Calendar** — A Monday-first month grid built from the *real* bills, invoices, payroll runs
and tax deadlines, so it can never disagree with the payables and receivables pages. Filter
by kind, click any day for its detail.

### Governance

**Team & roles** — Five roles across ten granular permissions, rendered as a **live matrix**.
Change someone's role and the matrix updates immediately. Invite, suspend and restore access.

**Audit log** — Eighty events over three weeks, filterable by actor, action, area and
severity, with critical actions called out. Actor, timestamp and source IP on every entry.

### Throughout

- **Global search** (`⌘K` / `Ctrl+K`) across invoices, clients, vendors, bills, transactions
  and accounts — keyboard-navigable, deep-linking into the right module with the query applied.
- **Real CSV export** on ten screens. Each builds an RFC 4180 file in the browser; if the
  browser blocks the download the app says so rather than claiming a success that never happened.
- **Light and dark**, applied before first paint so a reload never flashes the wrong palette.
- **Working preferences** — display currency, date format and row density propagate to every
  page and persist to `localStorage`.
- **Shimmering skeletons** on first paint, and a Refresh action that replays them on demand.
- **Error boundaries** around every chart, plus route-level and global fallbacks.
- **Accessible** — skip link, focus traps in dialogs and drawers, `aria-sort` on sortable
  columns, visible focus rings, WCAG AA contrast in both themes, reduced-motion support.
- **No dead clicks.** Every button, tab, filter, slider and dropdown produces visible behaviour.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, all 25 routes statically prerendered) |
| Language | TypeScript 5, `strict` |
| Styling | Tailwind CSS 3.4 with CSS-variable theme tokens |
| Charts | Recharts 2 (six memoised wrappers) |
| Icons | lucide-react |
| Fonts | Inter via `next/font` (self-hosted, four weights) |
| Utilities | clsx + tailwind-merge |
| Data | Local deterministic dataset — no backend |

Seven runtime dependencies. No state library, no component library, **no image assets** —
the entire UI is CSS and SVG.

## Design system

Declared once in `tailwind.config.ts` and `app/globals.css`, used everywhere:

- **Colour** — Aurelium means *aurum*, gold. One gold accent (`aurum-400`, `#e8b34a`) over a
  deep charcoal-navy canvas (`#070a10`) or a soft neutral light one (`#f5f6f9`). Green and red
  are reserved exclusively for gains and losses, never for UI chrome, so a colour in this app
  always means money.
- **Radius** — three tokens: `control` (10px) for inputs and buttons, `card` (16px) for panels,
  `pill` for chips.
- **Depth** — a four-step shadow ladder (`raised` → `card` → `lift` → `overlay`) paired with a
  1px border. Never a heavy border and a heavy shadow together.
- **Type** — Inter with tabular figures enabled globally, so every column of numbers aligns.
  Labels are small, tracked-out and uppercase; metrics are large and tight.

`tailwind-merge` is extended with the custom radius, shadow and font-size scales — otherwise
it treats `text-metric` as a colour and silently drops it next to `text-gain-600`.

## Data

All data is local and deterministic — there is no backend. It is generated in `lib/data/*`
from handwritten seeds via an FNV-1a hash, so **no `Math.random()` and no `Date.now()`**:
server and client render byte-identical output, hydration never mismatches, and figures never
drift between reloads. The whole dataset is anchored to a fixed reporting date (31 July 2026)
so overdue counts and ageing buckets stay stable.

| | Count |
| --- | --- |
| Transactions | ~640 across 12 months, 5 accounts, 16 categories |
| Invoices | 60 with line items, tax and payment history |
| Clients | 40 with contacts, terms and owners |
| Bills / vendors | 40 / 40 |
| Team members | 8 across 5 roles and 10 permissions |
| Audit events | 80 |

Figures cross-check between modules: the clients page's total outstanding equals the invoices
page's total receivable; lifetime billings equals invoiced-all-time; the overview's cash
balance equals the accounts page and the forecast's starting cash.

## Getting started

**Requirements:** Node.js 18.17 or newer.

```bash
git clone https://github.com/<your-username>/aurelium-finance-dashboard.git
cd aurelium-finance-dashboard
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Other scripts:

```bash
npm run lint         # next lint
npx tsc --noEmit     # type-check without emitting
```

## Project structure

```
app/
  layout.tsx              root layout, theme bootstrap, skip link
  error.tsx               route-level error fallback
  global-error.tsx        last-resort fallback (no providers, inline styles)
  not-found.tsx           404
  globals.css             theme tokens, component layer, utilities
  (marketing)/            public portal — /, /about, /features, /pricing, /contact
  login/                  demonstration sign-in
  dashboard/              16 module routes
components/
  charts/                 memoised Recharts wrappers, themed tooltips
  layout/                 dashboard shell
  marketing/              header, footer, sections, app preview, pricing, contact, login
  navigation/             sidebar, topbar, logo, theme toggle, global search
  pages/                  one client component per dashboard module
  providers/              theme, preferences, notifications, toasts, refresh
  ui/                     button, card, field, badge, modal, drawer, data-table,
                          progress, skeleton, stat-card, states, toast
lib/
  data/                   seed, core, team, clients, ledger, invoices, bills,
                          planning, governance, navigation
  mock-data.ts            barrel re-export of the whole dataset
  selectors.ts            derived totals, ageing, reports, forecasting, search
  hooks.ts                useCountUp, useSimulatedLoading, useDebouncedValue,
                          useDismissable, useMounted
  csv.ts                  RFC 4180 CSV builder and browser download
  types.ts                shared domain types
  utils.ts                currency, date and percentage formatting
```

## Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| `< 480px` | Single column. Sidebar becomes an overlay drawer behind a hamburger, with focus management and scroll lock. **Every table renders as stacked cards** rather than a sideways scroll. Search moves below the page title. |
| `~768px` | Two-column KPI and card grids; charts go full width; tables appear with low-priority columns hidden. |
| `1024px+` | Persistent grouped sidebar; multi-column dashboard. |
| `1280px+` | Asymmetric content grids; search returns to the topbar; remaining table columns reveal. |

## Author

**Sayed Muhammad** — React / Frontend Developer

- Email: [waleed.farrukh@gmail.com](mailto:waleed.farrukh@gmail.com)
- LinkedIn: [linkedin.com/in/sayed-muhammad](https://www.linkedin.com/in/sayed-muhammad)

> Update the LinkedIn URL above to your actual profile slug.

## Related project

This is the small/mid-business build. See **enterprise-finance-dashboard** for the larger
enterprise reporting version with multi-department views, approval workflows and role-based
navigation.

## License

MIT
