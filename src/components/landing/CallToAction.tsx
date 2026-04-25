import Link from "next/link";

export function CallToAction() {
  return (
    <section className="relative border-t border-arc-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-arc-border bg-arc-surface/70 p-10 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-arc-gradient opacity-80"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-arc-accent/20 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-arc-text sm:text-4xl">
                Find a provider you can trust.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-arc-muted sm:text-base">
                Browse the catalog, see who real developers are buying from, and pay
                for your first call in seconds.
              </p>
            </div>
            <Link
              href="/providers"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-arc-accent px-6 py-3 text-sm font-medium text-arc-bg shadow-[0_0_0_1px_rgba(0,224,176,0.4),0_8px_40px_-8px_rgba(0,224,176,0.55)] transition-all hover:shadow-[0_0_0_1px_rgba(0,224,176,0.6),0_8px_50px_-6px_rgba(0,224,176,0.7)]"
            >
              Browse providers
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 8h10m0 0L9 4m4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
