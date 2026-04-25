type Value = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const values: Value[] = [
  {
    title: "No subscriptions",
    body: "Pay only for the calls you make. Cancel by simply not calling. Cash flow stays sane.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="m6.5 6.5 11 11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "On-chain receipts",
    body: "Every nanopayment is a verifiable record on Arc. Audit trails, finance reconciliation, and proof-of-usage are built in.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <path
          d="M5.5 3.75h9.25l3.75 3.75v12.75h-13z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 11.5h7M8.5 14.5h7M8.5 8.5h3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Bulk pricing tiers",
    body: "Pre-buy call volume at meaningful discounts. The market sets the rate; the chain settles it instantly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <path
          d="M4.5 7.5 12 4l7.5 3.5M4.5 7.5v9L12 20l7.5-3.5v-9M4.5 7.5 12 11l7.5-3.5M12 11v9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Reputation from real usage",
    body: "Forget vanity stars. Trust the providers that paying developers keep coming back to — measured in dollars, not hearts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <path
          d="M12 3.75 14.4 8.6l5.35.78-3.87 3.77.91 5.32L12 15.95l-4.79 2.52.91-5.32-3.87-3.77 5.35-.78z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function WhyArcTrust() {
  return (
    <section className="relative border-t border-arc-border/60">
      {/* Soft brand wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-arc-gradient"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-arc-accent">
              Why ArcTrust
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-arc-text sm:text-4xl md:text-5xl">
              Built for the way developers actually buy APIs.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-arc-muted">
            The plumbing of paid APIs hasn&apos;t kept up with how teams ship. Arc and
            Circle Nanopayments unlock an honest model — and ArcTrust is the front
            door.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-arc-border bg-arc-border sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="group relative flex flex-col gap-3 bg-arc-surface/80 p-7 backdrop-blur transition-colors hover:bg-arc-surface"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-arc-border bg-arc-bg/60 text-arc-glow">
                {v.icon}
              </span>
              <h3 className="text-lg font-semibold text-arc-text">{v.title}</h3>
              <p className="text-sm leading-relaxed text-arc-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
