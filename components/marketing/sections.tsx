import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow ? <p className="eyebrow text-aurum-700 dark:text-aurum-400">{eyebrow}</p> : null}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-inkMuted">{description}</p>
      ) : null}
    </div>
  );
}

/** Hairline gold rule used to separate major bands without a hard border. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-aurum-400/40 to-transparent",
        className
      )}
    />
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  href
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}) {
  const body = (
    <div className="group h-full rounded-card border border-line bg-surface p-5 shadow-card transition duration-200 ease-smooth hover:-translate-y-0.5 hover:border-aurum-400/40 hover:shadow-lift">
      <span className="grid h-10 w-10 place-items-center rounded-control border border-line bg-surfaceMuted text-aurum-700 transition-colors group-hover:border-aurum-400/40 dark:text-aurum-400">
        <Icon size={18} />
      </span>
      <h3 className="mt-4 text-[0.9375rem] font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-inkMuted">{description}</p>
      {href ? (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-aurum-700 dark:text-aurum-400">
          Explore
          <ArrowRight
            size={14}
            aria-hidden
            className="transition-transform duration-200 ease-smooth group-hover:translate-x-0.5"
          />
        </span>
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatStrip({
  items
}: {
  items: Array<{ value: string; label: string; detail?: string }>;
}) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-5 py-6 text-center">
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <p className="numeric text-metric font-semibold text-ink">{item.value}</p>
            <p className="mt-1.5 text-sm font-medium text-ink">{item.label}</p>
            {item.detail ? <p className="mt-1 text-xs text-inkMuted">{item.detail}</p> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CallToAction({
  title = "See the whole picture in one place",
  description = "Open the dashboard and explore every module with a full year of realistic sample data — no sign-up, nothing to install.",
  primaryHref = "/dashboard",
  primaryLabel = "Open the dashboard",
  secondaryHref = "/features",
  secondaryLabel = "See all features"
}: {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-panel border border-line bg-surface px-6 py-12 text-center shadow-card sm:px-12 sm:py-16">
        {/* Gold wash anchors the final band without introducing a new surface. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-aurum-400/10 blur-3xl"
        />
        <div className="relative">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-inkMuted">
            {description}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={primaryHref}>
              {/* The icon is rendered here rather than passed as `iconRight`: a
                  component reference cannot cross the server/client boundary. */}
              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                {primaryLabel}
                <ArrowRight size={16} aria-hidden />
              </Button>
            </Link>
            <Link href={secondaryHref}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                {secondaryLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
