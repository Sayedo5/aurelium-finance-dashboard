import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { ToastViewport } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Aurelium Ledger — Business Finance Dashboard",
    template: "%s"
  },
  description:
    "Track balances, cashflow, budgets and savings goals across every business account in one dashboard."
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#06101d" }
  ]
};

/**
 * Applies the stored theme before first paint so a dark-mode reload never
 * flashes the light palette.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('aurelium-theme');
    if (stored !== 'light') document.documentElement.classList.add('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} bg-mesh font-sans text-ink antialiased dark:bg-mesh-dark`}>
        <AppProvider>
          {children}
          <ToastViewport />
        </AppProvider>
      </body>
    </html>
  );
}
