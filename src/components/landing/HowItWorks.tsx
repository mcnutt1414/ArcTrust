type Step = {
  n: string;
  title: string;
  body: string;
  icon: React.ReactNode;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Discover trustworthy providers",
    body: "Browse a curated catalog of API providers on Arc — filtered, categorized, and ranked by real on-chain usage.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="m20 20-3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Pay per use, on-chain",
    body: "Every API call is settled with Circle Nanopayments — USDC micro-transactions on Arc. No subscriptions, no commitments.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <rect
          x="3.25"
          y="6.25"
          width="17.5"
          height="11.5"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M3.25 10.25h17.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.5" cy="14" r="1.25" fill="currentColor" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Reputation from real demand",
    body: "Bulk-purchase volume per provider is the signal. The more developers buying access, the higher the trust — market-driven, not star-driven.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <path
          d="M4 17V9m6 8V5m6 12v-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M3.5 20h17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="relative border-t border-arc-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-arc-accent">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-arc-text sm:text-4xl md:text-5xl">
            Three steps from discovery to first call.
          </h2>
        </div>

        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="group relative flex flex-col rounded-2xl border border-arc-border bg-arc-surface/60 p-6 transition-colors hover:border-arc-glow/40"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-xs text-arc-muted">{s.n}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-arc-border bg-arc-bg/60 text-arc-accent">
                  {s.icon}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-arc-text">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-arc-muted">{s.body}</p>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-arc-glow/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
