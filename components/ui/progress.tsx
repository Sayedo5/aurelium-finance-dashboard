"use client";

import { useEffect, useState } from "react";
import { cn, clamp } from "@/lib/utils";

interface ProgressProps {
  /** 0-100. Values above 100 are clamped for the bar but colour it red. */
  value: number;
  color?: string;
  className?: string;
  /** Staggers the fill so a list of bars animates in sequence. */
  delayMs?: number;
  label?: string;
}

const DEFAULT_FILL = "#e8b34a";

export function Progress({ value, color, className, delayMs = 0, label }: ProgressProps) {
  const [width, setWidth] = useState(0);
  const over = value > 100;
  const clamped = clamp(value, 0, 100);

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(clamped), 60 + delayMs);
    return () => window.clearTimeout(timer);
  }, [clamped, delayMs]);

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-pill bg-surfaceMuted", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${Math.round(value)}%`}
    >
      <div
        className="h-full rounded-pill transition-[width] duration-700 ease-smooth"
        style={{ width: `${width}%`, backgroundColor: over ? "#dc2626" : (color ?? DEFAULT_FILL) }}
      />
    </div>
  );
}

export function RingProgress({
  value,
  size = 132,
  stroke = 10,
  color = DEFAULT_FILL,
  label,
  children
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(value, 0, 100);

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(clamped), 100);
    return () => window.clearTimeout(timer);
  }, [clamped]);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line"
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
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
