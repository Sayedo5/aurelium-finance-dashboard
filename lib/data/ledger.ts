import type { CategoryId, MonthlyPoint, Transaction, TxDirection, TxStatus } from "@/lib/types";
import { jitter, monthLabel, monthLabelWithYear, monthRange, money, safeDate } from "@/lib/data/seed";

/* ---------------------------------------------------------------------------
 * Transaction ledger
 *
 * Twelve months of activity generated from handwritten merchant seeds. Every
 * row reads like real business activity, and there are enough of them (~600)
 * for filtering, sorting, pagination and category analysis to be meaningful.
 * The generator is fully deterministic, so server and client agree exactly.
 * ------------------------------------------------------------------------ */

interface MerchantSeed {
  merchant: string;
  memo: string;
  categoryId: CategoryId;
  direction: TxDirection;
  base: number;
  spread: number;
  method: Transaction["method"];
  accountId: string;
  /** Days of the month this merchant typically bills on. */
  days: number[];
}

const merchantSeeds: MerchantSeed[] = [
  /* --- Revenue ---------------------------------------------------------- */
  { merchant: "Northbeam Logistics", memo: "Platform retainer, Enterprise tier", categoryId: "revenue", direction: "income", base: 58000, spread: 6000, method: "Wire", accountId: "acc-operating", days: [3] },
  { merchant: "Vertex Analytics", memo: "Quarterly implementation milestone", categoryId: "revenue", direction: "income", base: 44000, spread: 4500, method: "ACH", accountId: "acc-operating", days: [8] },
  { merchant: "Halden & Rowe LLP", memo: "Managed services agreement", categoryId: "revenue", direction: "income", base: 26000, spread: 2500, method: "ACH", accountId: "acc-operating", days: [12] },
  { merchant: "Brightline Health", memo: "Annual license, monthly installment", categoryId: "revenue", direction: "income", base: 22000, spread: 1800, method: "ACH", accountId: "acc-operating", days: [19] },
  { merchant: "Casa Verde Foods", memo: "Onboarding and support package", categoryId: "revenue", direction: "income", base: 12000, spread: 2200, method: "Card", accountId: "acc-operating", days: [24] },
  { merchant: "Kestrel Robotics", memo: "Integration retainer, Growth tier", categoryId: "revenue", direction: "income", base: 34000, spread: 3100, method: "Wire", accountId: "acc-operating", days: [6] },
  { merchant: "Ridgeway Capital", memo: "Reporting module, annual instalment", categoryId: "revenue", direction: "income", base: 19500, spread: 1600, method: "ACH", accountId: "acc-operating", days: [14] },
  { merchant: "Cobalt Aerospace", memo: "Compliance workspace, 120 seats", categoryId: "revenue", direction: "income", base: 40000, spread: 3800, method: "Wire", accountId: "acc-operating", days: [17] },
  { merchant: "Arclight Energy", memo: "Data warehouse connector licence", categoryId: "revenue", direction: "income", base: 16500, spread: 2400, method: "ACH", accountId: "acc-operating", days: [21] },
  { merchant: "Nimbus Cloud Services", memo: "Partner revenue share", categoryId: "revenue", direction: "income", base: 11500, spread: 1900, method: "ACH", accountId: "acc-operating", days: [27] },
  { merchant: "Northgate Savings", memo: "Interest on reserve balances", categoryId: "interest", direction: "income", base: 640, spread: 90, method: "Transfer", accountId: "acc-growth", days: [1] },

  /* --- Payroll ---------------------------------------------------------- */
  { merchant: "Gusto Payroll", memo: "Semi-monthly payroll run", categoryId: "payroll", direction: "expense", base: 61400, spread: 3200, method: "ACH", accountId: "acc-payroll", days: [15, 30] },
  { merchant: "Sequoia Benefits", memo: "Team health and dental premiums", categoryId: "payroll", direction: "expense", base: 8940, spread: 420, method: "ACH", accountId: "acc-payroll", days: [5] },
  { merchant: "Contractor, R. Alvarez", memo: "Design contract, 62 hours", categoryId: "payroll", direction: "expense", base: 7440, spread: 1400, method: "ACH", accountId: "acc-operating", days: [22] },
  { merchant: "Contractor, J. Whitfield", memo: "Backend contract, 48 hours", categoryId: "payroll", direction: "expense", base: 6240, spread: 1250, method: "ACH", accountId: "acc-operating", days: [25] },
  { merchant: "Guideline 401(k)", memo: "Employer match contribution", categoryId: "payroll", direction: "expense", base: 5820, spread: 340, method: "ACH", accountId: "acc-payroll", days: [16] },

  /* --- Software --------------------------------------------------------- */
  { merchant: "Amazon Web Services", memo: "Production and staging infrastructure", categoryId: "software", direction: "expense", base: 6820, spread: 940, method: "Card", accountId: "acc-card", days: [2] },
  { merchant: "Datadog", memo: "Observability, 40 hosts", categoryId: "software", direction: "expense", base: 1890, spread: 160, method: "Card", accountId: "acc-card", days: [6] },
  { merchant: "Figma", memo: "Organization seats, 24 editors", categoryId: "software", direction: "expense", base: 1080, spread: 90, method: "Card", accountId: "acc-card", days: [11] },
  { merchant: "Linear", memo: "Product workspace, Business plan", categoryId: "software", direction: "expense", base: 672, spread: 48, method: "Card", accountId: "acc-card", days: [14] },
  { merchant: "Slack", memo: "Business+ workspace seats", categoryId: "software", direction: "expense", base: 918, spread: 60, method: "Card", accountId: "acc-card", days: [18] },
  { merchant: "GitHub", memo: "Enterprise seats and Actions minutes", categoryId: "software", direction: "expense", base: 1340, spread: 120, method: "Card", accountId: "acc-card", days: [8] },
  { merchant: "Salesforce", memo: "CRM licences, 18 seats", categoryId: "software", direction: "expense", base: 2760, spread: 180, method: "ACH", accountId: "acc-operating", days: [12] },
  { merchant: "Notion", memo: "Company wiki, Enterprise plan", categoryId: "software", direction: "expense", base: 480, spread: 40, method: "Card", accountId: "acc-card", days: [20] },
  { merchant: "Vercel", memo: "Edge hosting and analytics", categoryId: "software", direction: "expense", base: 890, spread: 210, method: "Card", accountId: "acc-card", days: [23] },

  /* --- Marketing -------------------------------------------------------- */
  { merchant: "Google Ads", memo: "Search and demand-gen campaigns", categoryId: "marketing", direction: "expense", base: 9250, spread: 2400, method: "Card", accountId: "acc-card", days: [4] },
  { merchant: "LinkedIn Marketing", memo: "Sponsored content, pipeline programme", categoryId: "marketing", direction: "expense", base: 4300, spread: 1100, method: "Card", accountId: "acc-card", days: [10] },
  { merchant: "Sable Creative Studio", memo: "Brand refresh, phase deliverable", categoryId: "marketing", direction: "expense", base: 5600, spread: 1900, method: "ACH", accountId: "acc-operating", days: [21] },
  { merchant: "Hubspot", memo: "Marketing automation, Pro tier", categoryId: "marketing", direction: "expense", base: 2180, spread: 190, method: "Card", accountId: "acc-card", days: [15] },
  { merchant: "Clearbit", memo: "Enrichment credits", categoryId: "marketing", direction: "expense", base: 1450, spread: 320, method: "Card", accountId: "acc-card", days: [26] },

  /* --- Office ----------------------------------------------------------- */
  { merchant: "Atlas Workspace", memo: "Office lease, Suite 400", categoryId: "office", direction: "expense", base: 14200, spread: 0, method: "ACH", accountId: "acc-operating", days: [1] },
  { merchant: "Meridian Utilities", memo: "Power, water and waste", categoryId: "office", direction: "expense", base: 1240, spread: 380, method: "ACH", accountId: "acc-operating", days: [9] },
  { merchant: "Verdant Facilities", memo: "Cleaning and plant service", categoryId: "office", direction: "expense", base: 860, spread: 120, method: "ACH", accountId: "acc-operating", days: [16] },
  { merchant: "Cascade Telecom", memo: "Fibre and phone lines", categoryId: "office", direction: "expense", base: 720, spread: 60, method: "ACH", accountId: "acc-operating", days: [11] },

  /* --- Travel ----------------------------------------------------------- */
  { merchant: "Delta Air Lines", memo: "Client onsite, Chicago", categoryId: "travel", direction: "expense", base: 2180, spread: 860, method: "Card", accountId: "acc-card", days: [7] },
  { merchant: "Marriott Bonvoy", memo: "Conference lodging, 3 nights", categoryId: "travel", direction: "expense", base: 1420, spread: 460, method: "Card", accountId: "acc-card", days: [13] },
  { merchant: "Bluepeak Travel", memo: "Team offsite, group booking", categoryId: "travel", direction: "expense", base: 3260, spread: 1250, method: "Card", accountId: "acc-card", days: [26] },
  { merchant: "Uber for Business", memo: "Ground transport, month total", categoryId: "travel", direction: "expense", base: 640, spread: 240, method: "Card", accountId: "acc-card", days: [28] },

  /* --- Professional ----------------------------------------------------- */
  { merchant: "Harbor Tax Partners", memo: "Quarterly advisory retainer", categoryId: "professional", direction: "expense", base: 4500, spread: 0, method: "ACH", accountId: "acc-operating", days: [17] },
  { merchant: "Whitfield Legal", memo: "Contract review and filings", categoryId: "professional", direction: "expense", base: 3120, spread: 1400, method: "ACH", accountId: "acc-operating", days: [23] },
  { merchant: "Beacon Audit Services", memo: "Interim controls review", categoryId: "professional", direction: "expense", base: 2600, spread: 700, method: "ACH", accountId: "acc-operating", days: [19] },

  /* --- Taxes, equipment, insurance -------------------------------------- */
  { merchant: "State Dept. of Revenue", memo: "Estimated quarterly tax", categoryId: "taxes", direction: "expense", base: 28500, spread: 0, method: "ACH", accountId: "acc-reserve", days: [20] },
  { merchant: "Apple Business", memo: "MacBook Pro refresh, 2 units", categoryId: "equipment", direction: "expense", base: 5180, spread: 1600, method: "Card", accountId: "acc-card", days: [27] },
  { merchant: "Steelcase", memo: "Workstation and seating", categoryId: "equipment", direction: "expense", base: 2340, spread: 900, method: "ACH", accountId: "acc-operating", days: [28] },
  { merchant: "Meridian Insurance", memo: "General liability and E&O", categoryId: "insurance", direction: "expense", base: 3180, spread: 90, method: "ACH", accountId: "acc-operating", days: [4] },
  { merchant: "Sentinel Cyber Cover", memo: "Cyber liability policy", categoryId: "insurance", direction: "expense", base: 1420, spread: 60, method: "ACH", accountId: "acc-operating", days: [18] },

  /* --- Training, recruiting, shipping, meals ---------------------------- */
  { merchant: "Pinecrest Education", memo: "Engineering certification cohort", categoryId: "training", direction: "expense", base: 1880, spread: 620, method: "Card", accountId: "acc-card", days: [10] },
  { merchant: "Greenhouse Recruiting", memo: "ATS subscription and job slots", categoryId: "recruiting", direction: "expense", base: 1560, spread: 340, method: "Card", accountId: "acc-card", days: [22] },
  { merchant: "Orion Freight Systems", memo: "Hardware shipping, month total", categoryId: "shipping", direction: "expense", base: 940, spread: 380, method: "ACH", accountId: "acc-operating", days: [24] },
  { merchant: "Willowbrook Hospitality", memo: "Client dinners and team lunches", categoryId: "meals", direction: "expense", base: 1180, spread: 460, method: "Card", accountId: "acc-card", days: [25] },

  /* --- Internal transfers ----------------------------------------------- */
  { merchant: "Transfer to Growth Savings", memo: "Monthly surplus sweep", categoryId: "transfers", direction: "expense", base: 12000, spread: 3000, method: "Transfer", accountId: "acc-operating", days: [29] },
  { merchant: "Transfer to Payroll Clearing", memo: "Payroll funding", categoryId: "transfers", direction: "expense", base: 70000, spread: 3000, method: "Transfer", accountId: "acc-operating", days: [13] }
];

/** Twelve months of ledger, oldest first, ending in the reporting month. */
export const months = monthRange("2026-07", 12).map((key) => ({
  key,
  label: monthLabel(key),
  longLabel: monthLabelWithYear(key)
}));

export const monthKeys = months.map((month) => month.key);

/**
 * Revenue trends up across the window with a dip in the winter quarter, so the
 * charts show a real shape rather than a straight line.
 */
const monthGrowth = [0.78, 0.82, 0.86, 0.83, 0.88, 0.93, 0.96, 0.99, 1.03, 1.06, 1.09, 1.14];

function buildTransactions(): Transaction[] {
  const rows: Transaction[] = [];
  let counter = 1000;

  months.forEach((month, monthIndex) => {
    const growth = monthGrowth[monthIndex];

    merchantSeeds.forEach((seed) => {
      seed.days.forEach((day) => {
        const date = safeDate(month.key, day);
        const seedKey = `${seed.merchant}:${month.key}:${day}`;

        // Income scales with the growth curve; costs drift more gently.
        const scale = seed.direction === "income" ? growth : 0.94 + monthIndex * 0.01;
        const amount = money(seed.base * scale + jitter(seedKey, seed.spread));

        // The final week of the reporting month is still settling, and one card
        // charge bounced in May so the failed state is represented in the data.
        let status: TxStatus = "cleared";
        if (month.key === "2026-07" && Number(date.slice(8)) >= 25) status = "pending";
        if (seed.merchant === "Casa Verde Foods" && month.key === "2026-05") status = "failed";

        counter += 1;
        rows.push({
          id: `TX-${counter}`,
          date,
          merchant: seed.merchant,
          memo: seed.memo,
          categoryId: seed.categoryId,
          accountId: seed.accountId,
          amount,
          direction: seed.direction,
          status,
          method: seed.method
        });
      });
    });
  });

  // Newest first, with a stable tie-break so the order never shifts.
  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
}

export const transactions: Transaction[] = buildTransactions();

/** Transfers are excluded so money moved between own accounts is not double counted. */
export const monthlySeries: MonthlyPoint[] = months.map((month) => {
  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    if (!tx.date.startsWith(month.key)) continue;
    if (tx.status === "failed" || tx.categoryId === "transfers") continue;
    if (tx.direction === "income") income += tx.amount;
    else expenses += tx.amount;
  }

  return {
    month: month.label,
    income: Math.round(income),
    expenses: Math.round(expenses),
    net: Math.round(income - expenses)
  };
});
