"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, SearchX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Nothing matched — a dead end the user can act their way out of. */
export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surfaceMuted text-inkSubtle">
        <Icon size={20} aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-inkMuted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Something failed — distinct from empty, and always offers a retry. */
export function ErrorState({
  title = "Something went wrong",
  description = "This section could not be displayed. Retrying usually resolves it.",
  onRetry,
  className
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-loss-100 text-loss-600 dark:bg-loss-900/40 dark:text-loss-400">
        <AlertTriangle size={20} aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-inkMuted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" icon={RotateCcw} className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

interface BoundaryProps {
  children: ReactNode;
  /** Names the failing region in the fallback, e.g. "Cashflow trend". */
  section?: string;
  fallback?: ReactNode;
}

interface BoundaryState {
  error: Error | null;
}

/**
 * Keeps one broken widget from blanking the whole route. Charts get their own
 * boundary because Recharts throws on malformed geometry in some browsers.
 */
export class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaced in the console for debugging; no telemetry backend in this build.
    console.error(`[Aurelium] ${this.props.section ?? "Section"} failed to render`, error, info);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <ErrorState
        title={`${this.props.section ?? "This section"} could not load`}
        description="An unexpected error interrupted rendering. Your data is unaffected."
        onRetry={this.reset}
      />
    );
  }
}
