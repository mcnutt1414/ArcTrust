import Link from "next/link";
import { ArcMark } from "./ArcMark";

const GITHUB_URL = "https://github.com/mcnutt1414/ArcTrust";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Brand backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-arc-gradient"
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,92,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.18) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Glow orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-arc-glow/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 pb-20 pt-12 sm:pt-16 md:pb-28 md:pt-20">
        {/* Top nav */}
        <nav className="mb-16 flex w-full items-center justify-between sm:mb-24">
          <Link href="/" className="flex items-center gap-2.5">
            <ArcMark className="h-7 w-7" />
            <span className="text-base font-semibold tracking-tight text-arc-text">
              ArcTrust
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-arc-muted">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden transition-colors hover:text-arc-text sm:inline"
            >
              GitHub
            </a>
            <Link
              href="/providers"
              className="rounded-full border border-arc-border bg-arc-surface/60 px-4 py-1.5 text-arc-text backdrop-blur transition-colors hover:border-arc-glow/60"
            >
              Browse providers
            </Link>
          </div>
        </nav>

        {/* Eyebrow pill */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-arc-border bg-arc-surface/60 px-3 py-1 text-xs text-arc-muted backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arc-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-arc-accent" />
          </span>
          Built for Arc · Circle Nanopayments
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-arc-text sm:text-5xl md:text-6xl lg:text-7xl">
          Trustworthy API providers,{" "}
          <span className="bg-gradient-to-r from-arc-glow via-arc-glow to-arc-accent bg-clip-text text-transparent">
            paid by the call.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-arc-muted sm:text-lg">
          ArcTrust is the discovery layer for paid APIs on the Arc blockchain — pay per
          use with Circle Nanopayments, save with bulk pricing, and trust the providers
          real developers actually buy from.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/providers"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-arc-accent px-6 py-3 text-sm font-medium text-arc-bg shadow-[0_0_0_1px_rgba(0,224,176,0.4),0_8px_40px_-8px_rgba(0,224,176,0.55)] transition-all hover:shadow-[0_0_0_1px_rgba(0,224,176,0.6),0_8px_50px_-6px_rgba(0,224,176,0.7)]"
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
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-arc-border bg-arc-surface/40 px-6 py-3 text-sm font-medium text-arc-text backdrop-blur transition-colors hover:border-arc-glow/60 hover:bg-arc-surface"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                clipRule="evenodd"
              />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Sub-stats / proof strip */}
        <div className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-arc-border bg-arc-border">
          {[
            { k: "Per-call", v: "Pricing" },
            { k: "On-chain", v: "Receipts" },
            { k: "Bulk-buyer", v: "Reputation" },
          ].map((s) => (
            <div
              key={s.v}
              className="flex flex-col items-center bg-arc-surface/70 px-4 py-5 backdrop-blur"
            >
              <span className="text-xs uppercase tracking-wider text-arc-muted">
                {s.k}
              </span>
              <span className="mt-1 text-sm font-medium text-arc-text">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
