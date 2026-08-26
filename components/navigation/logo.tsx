export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white shadow-soft">
        AL
      </div>
      {!compact ? (
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-inkMuted">AURELIUM</p>
          <p className="text-lg font-semibold leading-none">Ledger</p>
        </div>
      ) : null}
    </div>
  );
}
