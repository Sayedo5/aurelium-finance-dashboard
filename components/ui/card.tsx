import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[28px] border bg-white/70 p-6 shadow-soft dark:bg-slate-950/60",
        className
      )}
      {...props}
    />
  );
}
