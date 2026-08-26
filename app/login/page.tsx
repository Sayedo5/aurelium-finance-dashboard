import type { Metadata } from "next";
import { LoginView } from "@/components/marketing/login-view";

export const metadata: Metadata = {
  title: "Sign in | Aurelium Ledger",
  description: "Demonstration sign-in for the Aurelium Ledger dashboard."
};

export default function LoginPage() {
  return <LoginView />;
}
