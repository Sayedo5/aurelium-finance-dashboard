import type { Client, ClientStatus } from "@/lib/types";
import { accountManagers } from "@/lib/data/team";
import { pick, randInt } from "@/lib/data/seed";

/**
 * Forty client records. Names, industries and contacts are handwritten so the
 * directory reads like a real book of business; the varying fields (terms,
 * owner, city, start date) are derived from the name so they never shuffle.
 */
interface ClientSeed {
  name: string;
  industry: string;
  contactName: string;
  status?: ClientStatus;
}

const clientSeeds: ClientSeed[] = [
  { name: "Northbeam Logistics", industry: "Logistics", contactName: "Rachel Okafor" },
  { name: "Vertex Analytics", industry: "Data & Analytics", contactName: "Tomás Ibarra" },
  { name: "Halden & Rowe LLP", industry: "Legal", contactName: "Grace Halden" },
  { name: "Brightline Health", industry: "Healthcare", contactName: "Dr. Priya Menon" },
  { name: "Casa Verde Foods", industry: "Food & Beverage", contactName: "Mateo Ruiz" },
  { name: "Kestrel Robotics", industry: "Manufacturing", contactName: "Ingrid Bauer" },
  { name: "Solstice Media Group", industry: "Media", contactName: "Dominic Farrow" },
  { name: "Ridgeway Capital", industry: "Financial Services", contactName: "Amelia Ridge" },
  { name: "Tidewater Marine", industry: "Maritime", contactName: "Erik Lindqvist" },
  { name: "Cobalt Aerospace", industry: "Aerospace", contactName: "Nadia Petrov" },
  { name: "Fernwood Retail", industry: "Retail", contactName: "Simone Adeyemi" },
  { name: "Arclight Energy", industry: "Energy", contactName: "Hugo Marchetti" },
  { name: "Pinecrest Education", industry: "Education", contactName: "Laura Chen" },
  { name: "Meridian Insurance", industry: "Insurance", contactName: "Patrick Osei" },
  { name: "Lumen Biotech", industry: "Biotechnology", contactName: "Dr. Yuki Tanaka" },
  { name: "Ashford Property Co.", industry: "Real Estate", contactName: "Nora Ashford" },
  { name: "Granite Peak Outfitters", industry: "Consumer Goods", contactName: "Wyatt Doyle" },
  { name: "Sable Creative Studio", industry: "Design", contactName: "Imani Blake" },
  { name: "Orion Freight Systems", industry: "Logistics", contactName: "Sergei Volkov" },
  { name: "Willowbrook Hospitality", industry: "Hospitality", contactName: "Claire Dumont" },
  { name: "Ironvale Construction", industry: "Construction", contactName: "Boris Kowalski" },
  { name: "Cascade Telecom", industry: "Telecommunications", contactName: "Hana Yoshida" },
  { name: "Blackwood Security", industry: "Security", contactName: "Marcus Blackwood" },
  { name: "Ember Agritech", industry: "Agriculture", contactName: "Rosa Delgado" },
  { name: "Quillon Publishing", industry: "Publishing", contactName: "Edward Quillon" },
  { name: "Harborlight Travel", industry: "Travel", contactName: "Sofia Marchand" },
  { name: "Nimbus Cloud Services", industry: "Technology", contactName: "Ravi Krishnan" },
  { name: "Stonebridge Legal", industry: "Legal", contactName: "Olivia Stone" },
  { name: "Verity Pharma", industry: "Pharmaceutical", contactName: "Dr. Anton Reiss" },
  { name: "Copperfield Mining", industry: "Mining", contactName: "Jonas Bergman" },
  { name: "Aurora Fitness Group", industry: "Fitness", contactName: "Tania Moreau" },
  { name: "Larkspur Interiors", industry: "Design", contactName: "Beatrice Lark" },
  { name: "Sentinel Compliance", industry: "Compliance", contactName: "Devon Marsh" },
  { name: "Thornfield Automotive", industry: "Automotive", contactName: "Klaus Thornfield" },
  { name: "Bluepeak Travel", industry: "Travel", contactName: "Marisol Peña", status: "churned" },
  { name: "Radiant Textiles", industry: "Textiles", contactName: "Aisha Rahman", status: "churned" },
  { name: "Highmark Consulting", industry: "Consulting", contactName: "Gregory Vance", status: "prospect" },
  { name: "Silverleaf Ventures", industry: "Venture Capital", contactName: "Elise Verhoeven", status: "prospect" },
  { name: "Coastal Grid Utilities", industry: "Utilities", contactName: "Tobias Nkemelu", status: "prospect" },
  { name: "Juniper Labs", industry: "Research", contactName: "Freya Sandberg", status: "prospect" }
];

const locations = [
  { city: "Seattle", country: "United States" },
  { city: "Portland", country: "United States" },
  { city: "Austin", country: "United States" },
  { city: "Chicago", country: "United States" },
  { city: "Boston", country: "United States" },
  { city: "Denver", country: "United States" },
  { city: "Toronto", country: "Canada" },
  { city: "Vancouver", country: "Canada" },
  { city: "London", country: "United Kingdom" },
  { city: "Dublin", country: "Ireland" },
  { city: "Berlin", country: "Germany" },
  { city: "Amsterdam", country: "Netherlands" }
];

const termOptions = [15, 30, 30, 30, 45, 60] as const;

/** Strips punctuation so "Halden & Rowe LLP" becomes a usable mail domain. */
function domainOf(name: string) {
  return `${name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .join("")}.com`;
}

function emailOf(contactName: string, company: string) {
  const [first, ...rest] = contactName.replace(/^Dr\.\s+/, "").split(/\s+/);
  const last = rest[rest.length - 1] ?? "";
  return `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + `@${domainOf(company)}`;
}

export const clients: Client[] = clientSeeds.map((seed, index) => {
  const key = `client:${seed.name}`;
  const location = pick(`${key}:loc`, locations);
  const owner = pick(`${key}:owner`, accountManagers);
  const status = seed.status ?? "active";

  // Prospects have no signed date yet, so they start "since" in the current year.
  const year = status === "prospect" ? 2026 : randInt(`${key}:year`, 2021, 2025);
  const month = randInt(`${key}:month`, 1, 12);
  const day = randInt(`${key}:day`, 1, 28);

  return {
    id: `cl-${String(index + 1).padStart(3, "0")}`,
    name: seed.name,
    contactName: seed.contactName,
    email: emailOf(seed.contactName, seed.name),
    phone: `+1 (${randInt(`${key}:area`, 201, 989)}) 555-${String(randInt(`${key}:line`, 100, 9999)).padStart(4, "0")}`,
    industry: seed.industry,
    country: location.country,
    city: location.city,
    since: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    status,
    paymentTerms: pick(`${key}:terms`, termOptions),
    ownerId: owner.id
  };
});

export const clientMap = clients.reduce<Record<string, Client>>((acc, client) => {
  acc[client.id] = client;
  return acc;
}, {});

/** Clients that can be invoiced — prospects and churned accounts cannot. */
export const billableClients = clients.filter((client) => client.status === "active");

export const industries = Array.from(new Set(clients.map((client) => client.industry))).sort();
