"use client";

import { useEffect, useState } from "react";
import { cn, clamp } from "@/lib/utils";

interface ProgressProps {
  /** 0-100. Values above 100 are clamped for the bar but colour the track red. */
  value: number;
  color?: string;
  className?: string;
  /** Staggers the fill so a list of bars animates in sequence. */
  delayMs?: number;
}

export function Progress({ value, color, className, delayMs = 0 }: ProgressProps) {
  const [width, setWidth] = useState(0);
  const over = value > 100;
  const clamped = clamp(value, 0, 100);

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(clamped), 80 + delayMs);
    return () => window.clearTimeout(timer);
  }, [clamped, delayMs]);

  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-[900ms] ease-out"
        style={{
          width: `${width}%`,
          backgroundColor: over ? "#ef4444" : color ?? "#1fb36a"
        }}
      />
    </div>
  );
}

export function RingProgress({
  value,
  size = 132,
  stroke = 10,
  color = "#1fb36a",
  children
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(value, 0, 100);

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(clamped), 120);
    return () => window.clearTimeout(timer);
  }, [clamped]);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
