import type { Metadata } from "next";
import { PricingView } from "@/components/marketing/pricing-view";

export const metadata: Metadata = {
  title: "Pricing | Aurelium Ledger",
  description:
    "Simple per-workspace pricing for Aurelium Ledger — Starter, Growth and Enterprise, with a full comparison of what each tier includes."
};

export default function PricingPage() {
  return <PricingView />;
}
