"use client";

import { Moon, Sun } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useAppContext();
  const mounted = useMounted();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Switch theme"}
      title={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : undefined}
      className={cn(
        "relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-control border border-line bg-surface sm:h-10 sm:w-10",
        "text-inkMuted transition duration-150 ease-smooth hover:border-lineStrong hover:text-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className
      )}
    >
      {/* Both icons render and cross-fade, so nothing reflows on toggle. Until
          mount neither is shown, so the icon can never contradict the theme. */}
      <Sun
        size={17}
        aria-hidden
        className={cn(
          "absolute transition-all duration-300 ease-smooth",
          mounted && dark ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
        )}
      />
      <Moon
        size={17}
        aria-hidden
        className={cn(
          "absolute transition-all duration-300 ease-smooth",
          mounted && !dark ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
        )}
      />
    </button>
  );
}
