import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { ToastViewport } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Only the weights the design system actually uses.
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: "Aurelium Ledger — Business Finance Dashboard",
    template: "%s"
  },
  description:
    "Track balances, cashflow, budgets and savings goals across every business account in one dashboard.",
  applicationName: "Aurelium Ledger"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f9" },
    { media: "(prefers-color-scheme: dark)", color: "#070a10" }
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-control focus:bg-aurum-400 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-aurum-950"
        >
          Skip to content
        </a>
        <AppProvider>
          {children}
          <ToastViewport />
        </AppProvider>
      </body>
    </html>
  );
}
