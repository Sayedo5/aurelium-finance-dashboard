import type { Bill, BillStatus, CategoryId, Vendor } from "@/lib/types";
import { TODAY, addDays, daysBetween, money, pick, rand, randInt } from "@/lib/data/seed";

/* ---------------------------------------------------------------------------
 * Vendors
 *
 * The payables side of the ledger. Vendors mirror the merchants that appear in
 * the transaction feed so the two views agree with each other.
 * ------------------------------------------------------------------------ */

interface VendorSeed {
  name: string;
  categoryId: CategoryId;
  contactName: string;
  country: string;
  domain: string;
}

const vendorSeeds: VendorSeed[] = [
  { name: "Amazon Web Services", categoryId: "software", contactName: "Enterprise Billing", country: "United States", domain: "aws.amazon.com" },
  { name: "Datadog", categoryId: "software", contactName: "Ilana Frost", country: "United States", domain: "datadoghq.com" },
  { name: "Figma", categoryId: "software", contactName: "Accounts Team", country: "United States", domain: "figma.com" },
  { name: "Linear", categoryId: "software", contactName: "Billing Desk", country: "United States", domain: "linear.app" },
  { name: "Slack", categoryId: "software", contactName: "Salesforce Billing", country: "United States", domain: "slack.com" },
  { name: "GitHub", categoryId: "software", contactName: "Enterprise Accounts", country: "United States", domain: "github.com" },
  { name: "Salesforce", categoryId: "software", contactName: "Renewals Team", country: "United States", domain: "salesforce.com" },
  { name: "Notion", categoryId: "software", contactName: "Billing Desk", country: "United States", domain: "notion.so" },
  { name: "Vercel", categoryId: "software", contactName: "Platform Billing", country: "United States", domain: "vercel.com" },
  { name: "Gusto Payroll", categoryId: "payroll", contactName: "Payroll Operations", country: "United States", domain: "gusto.com" },
  { name: "Sequoia Benefits", categoryId: "payroll", contactName: "Marta Oyelaran", country: "United States", domain: "sequoia.com" },
  { name: "Guideline 401(k)", categoryId: "payroll", contactName: "Plan Services", country: "United States", domain: "guideline.com" },
  { name: "Google Ads", categoryId: "marketing", contactName: "Account Billing", country: "Ireland", domain: "google.com" },
  { name: "LinkedIn Marketing", categoryId: "marketing", contactName: "Campaign Billing", country: "Ireland", domain: "linkedin.com" },
  { name: "Sable Creative Studio", categoryId: "marketing", contactName: "Imani Blake", country: "United States", domain: "sablecreative.com" },
  { name: "Hubspot", categoryId: "marketing", contactName: "Renewals Desk", country: "Ireland", domain: "hubspot.com" },
  { name: "Clearbit", categoryId: "marketing", contactName: "Billing Team", country: "United States", domain: "clearbit.com" },
  { name: "Atlas Workspace", categoryId: "office", contactName: "Property Management", country: "United States", domain: "atlasworkspace.com" },
  { name: "Meridian Utilities", categoryId: "office", contactName: "Commercial Accounts", country: "United States", domain: "meridianutil.com" },
  { name: "Verdant Facilities", categoryId: "office", contactName: "Dorian Vale", country: "United States", domain: "verdantfacilities.com" },
  { name: "Cascade Telecom", categoryId: "office", contactName: "Hana Yoshida", country: "United States", domain: "cascadetelecom.com" },
  { name: "Delta Air Lines", categoryId: "travel", contactName: "Corporate Travel", country: "United States", domain: "delta.com" },
  { name: "Marriott Bonvoy", categoryId: "travel", contactName: "Group Accounts", country: "United States", domain: "marriott.com" },
  { name: "Bluepeak Travel", categoryId: "travel", contactName: "Marisol Peña", country: "United States", domain: "bluepeaktravel.com" },
  { name: "Uber for Business", categoryId: "travel", contactName: "Business Billing", country: "Netherlands", domain: "uber.com" },
  { name: "Harbor Tax Partners", categoryId: "professional", contactName: "Marcus Hale", country: "United States", domain: "harbortax.com" },
  { name: "Whitfield Legal", categoryId: "professional", contactName: "Jonathan Whitfield", country: "United States", domain: "whitfieldlegal.com" },
  { name: "Beacon Audit Services", categoryId: "professional", contactName: "Renée Okonkwo", country: "United States", domain: "beaconaudit.com" },
  { name: "State Dept. of Revenue", categoryId: "taxes", contactName: "Business Tax Unit", country: "United States", domain: "revenue.wa.gov" },
  { name: "Apple Business", categoryId: "equipment", contactName: "Business Team", country: "United States", domain: "apple.com" },
  { name: "Steelcase", categoryId: "equipment", contactName: "Commercial Sales", country: "United States", domain: "steelcase.com" },
  { name: "Meridian Insurance", categoryId: "insurance", contactName: "Patrick Osei", country: "United States", domain: "meridianinsure.com" },
  { name: "Sentinel Cyber Cover", categoryId: "insurance", contactName: "Devon Marsh", country: "United Kingdom", domain: "sentinelcyber.com" },
  { name: "Pinecrest Education", categoryId: "training", contactName: "Laura Chen", country: "United States", domain: "pinecrestedu.com" },
  { name: "Greenhouse Recruiting", categoryId: "recruiting", contactName: "Talent Ops", country: "United States", domain: "greenhouse.io" },
  { name: "Orion Freight Systems", categoryId: "shipping", contactName: "Sergei Volkov", country: "United States", domain: "orionfreight.com" },
  { name: "Willowbrook Hospitality", categoryId: "meals", contactName: "Claire Dumont", country: "United States", domain: "willowbrookhg.com" },
  { name: "Ironvale Construction", categoryId: "office", contactName: "Boris Kowalski", country: "United States", domain: "ironvale.com" },
  { name: "Blackwood Security", categoryId: "office", contactName: "Marcus Blackwood", country: "United States", domain: "blackwoodsec.com" },
  { name: "Thornfield Automotive", categoryId: "equipment", contactName: "Klaus Thornfield", country: "Germany", domain: "thornfieldauto.de" }
];

const termOptions = [15, 30, 30, 30, 45, 60] as const;

export const vendors: Vendor[] = vendorSeeds.map((seed, index) => {
  const key = `vendor:${seed.name}`;
  const [first, ...rest] = seed.contactName.split(/\s+/);
  const last = rest[rest.length - 1] ?? "";
  const local = rest.length ? `${first}.${last}`.toLowerCase() : first.toLowerCase();

  return {
    id: `vn-${String(index + 1).padStart(3, "0")}`,
    name: seed.name,
    categoryId: seed.categoryId,
    contactName: seed.contactName,
    email: `${local.replace(/[^a-z.]/g, "")}@${seed.domain}`,
    country: seed.country,
    paymentTerms: pick(`${key}:terms`, termOptions),
    since: `${randInt(`${key}:year`, 2021, 2025)}-${String(randInt(`${key}:month`, 1, 12)).padStart(2, "0")}-${String(randInt(`${key}:day`, 1, 28)).padStart(2, "0")}`
  };
});

export const vendorMap = vendors.reduce<Record<string, Vendor>>((acc, vendor) => {
  acc[vendor.id] = vendor;
  return acc;
}, {});

/* ---------------------------------------------------------------------------
 * Bills
 *
 * Forty payables across the trailing five months. Most are settled; a handful
 * are scheduled ahead of the reporting date and three have slipped past due.
 * ------------------------------------------------------------------------ */

/** Vendors billed on a fixed cycle — their bills are marked recurring. */
const recurringVendors = new Set([
  "Amazon Web Services",
  "Datadog",
  "Figma",
  "Linear",
  "Slack",
  "GitHub",
  "Salesforce",
  "Notion",
  "Vercel",
  "Atlas Workspace",
  "Meridian Utilities",
  "Cascade Telecom",
  "Gusto Payroll",
  "Sequoia Benefits",
  "Meridian Insurance"
]);

const billBase: Record<CategoryId, number> = {
  revenue: 0,
  interest: 0,
  payroll: 61400,
  software: 2400,
  marketing: 5200,
  office: 6800,
  travel: 1900,
  professional: 3600,
  taxes: 28500,
  equipment: 4100,
  insurance: 2300,
  training: 1880,
  recruiting: 1560,
  shipping: 940,
  meals: 1180,
  transfers: 0
};

function buildBills(): Bill[] {
  const rows: Bill[] = [];

  for (let index = 0; index < 40; index += 1) {
    const key = `bill:${index}`;
    const vendor = pick(`${key}:vendor`, vendors);

    // Issue dates run back five months from the reporting date.
    const age = randInt(`${key}:age`, -20, 150);
    const issuedOn = addDays(TODAY, -age);
    const dueOn = addDays(issuedOn, vendor.paymentTerms);
    const overdueDays = daysBetween(dueOn, TODAY);

    const base = billBase[vendor.categoryId] || 2000;
    const amount = money(base * (0.7 + rand(`${key}:amount`) * 0.8));

    let status: BillStatus;
    let paidOn: string | undefined;

    if (age < 0) {
      // Dated in the future — entered but not yet approved.
      status = rand(`${key}:draft`) < 0.5 ? "draft" : "scheduled";
    } else if (overdueDays > 0) {
      if (rand(`${key}:paid`) < 0.88) {
        status = "paid";
        paidOn = addDays(issuedOn, randInt(`${key}:paidon`, 5, vendor.paymentTerms));
      } else {
        status = "overdue";
      }
    } else {
      status = rand(`${key}:sched`) < 0.25 ? "draft" : "scheduled";
    }

    rows.push({
      id: `bl-${String(index + 1).padStart(3, "0")}`,
      number: `BILL-${String(4200 + index)}`,
      vendorId: vendor.id,
      issuedOn,
      dueOn,
      paidOn,
      amount,
      status,
      categoryId: vendor.categoryId,
      recurring: recurringVendors.has(vendor.name),
      accountId: vendor.categoryId === "payroll" ? "acc-payroll" : "acc-operating"
    });
  }

  return rows.sort((a, b) => (a.dueOn < b.dueOn ? 1 : a.dueOn > b.dueOn ? -1 : a.number < b.number ? 1 : -1));
}

export const bills: Bill[] = buildBills();

export const billMap = bills.reduce<Record<string, Bill>>((acc, bill) => {
  acc[bill.id] = bill;
  return acc;
}, {});

/** A bill still owed — draft bills are not yet approved for payment. */
export function isPayable(bill: Bill): boolean {
  return bill.status === "scheduled" || bill.status === "overdue";
}

export function billDaysUntilDue(bill: Bill): number {
  return daysBetween(TODAY, bill.dueOn);
}

/** Total still owed to a vendor across scheduled and overdue bills. */
export function vendorOutstanding(vendorId: string): number {
  return money(
    bills
      .filter((bill) => bill.vendorId === vendorId && isPayable(bill))
      .reduce((sum, bill) => sum + bill.amount, 0)
  );
}

export function vendorLifetimeSpend(vendorId: string): number {
  return money(
    bills
      .filter((bill) => bill.vendorId === vendorId && bill.status !== "draft")
      .reduce((sum, bill) => sum + bill.amount, 0)
  );
}

export const vendorSpend = vendors
  .map((vendor) => ({
    vendor,
    lifetime: vendorLifetimeSpend(vendor.id),
    outstanding: vendorOutstanding(vendor.id),
    billCount: bills.filter((bill) => bill.vendorId === vendor.id).length
  }))
  .sort((a, b) => b.lifetime - a.lifetime);
