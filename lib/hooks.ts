"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Eases a number from its previous value to `target`. Respects
 * prefers-reduced-motion by snapping straight to the target, and always lands
 * exactly on it so the final figure is never a rounding artefact.
 *
 * `enabled` gates the animation while data is loading, so the count-up runs
 * once on the real value rather than racing a skeleton.
 */
export function useCountUp(target: number, { durationMs = 900, enabled = true } = {}) {
  const [value, setValue] = useState(enabled ? target : 0);
  const frame = useRef<number>();
  const from = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setValue(0);
      from.current = 0;
      return;
    }

    if (prefersReducedMotion() || durationMs <= 0) {
      setValue(target);
      from.current = target;
      return;
    }

    const start = performance.now();
    const origin = from.current;
    const delta = target - origin;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(origin + delta * eased);

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
        from.current = target;
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs, enabled]);

  return value;
}

/**
 * Flips to `false` shortly after mount so pages show skeletons on first paint,
 * and replays whenever `resetKey` changes — which is how the Refresh action
 * produces visible feedback without a real network layer.
 */
export function useSimulatedLoading(delayMs = 600, resetKey: unknown = 0) {
  const [loading, setLoading] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    // Skip the reset on the very first run so mount does not double-schedule.
    if (!first.current) setLoading(true);
    first.current = false;

    const timer = window.setTimeout(() => setLoading(false), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, resetKey]);

  return loading;
}

/** True once the component has mounted on the client. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Delays a fast-changing value so filtering does not run on every keystroke. */
export function useDebouncedValue<T>(value: T, delayMs = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/** Closes a popover on outside click and on Escape. */
export function useDismissable<T extends HTMLElement>(open: boolean, onDismiss: () => void) {
  const ref = useRef<T>(null);
  const dismiss = useCallback(() => onDismiss(), [onDismiss]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) dismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  return ref;
}
