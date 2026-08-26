"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { useMounted } from "@/lib/hooks";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();
  const mounted = useMounted();

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      onClick={toggleTheme}
      className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-white/60 transition hover:-translate-y-0.5 hover:bg-white dark:bg-slate-950/60"
    >
      {/* Render nothing until mounted so the icon never contradicts the stored theme. */}
      {mounted ? theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} /> : <span className="h-[18px] w-[18px]" />}
    </button>
  );
}
