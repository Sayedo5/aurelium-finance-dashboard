import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line bg-surfaceMuted text-inkSubtle">
          <Compass size={20} aria-hidden />
        </span>
        <p className="mt-5 text-4xl font-semibold tracking-tight text-aurum-500">404</p>
        <h1 className="mt-2 text-base font-semibold text-ink">This page does not exist</h1>
        <p className="mt-2 text-sm leading-relaxed text-inkMuted">
          The route you followed is not part of the dashboard. Everything is reachable from the
          overview.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-control bg-aurum-400 px-5 text-sm font-medium text-aurum-950 shadow-raised transition hover:bg-aurum-300"
        >
          Back to overview
        </Link>
      </div>
    </main>
  );
}
