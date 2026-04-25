import Link from "next/link";
import { PROVIDERS_SEED } from "@/lib/providers-seed";
import { DirectoryControls } from "./_components/DirectoryControls";

export const metadata = {
  title: "Providers — ArcTrust",
  description:
    "Browse trustworthy API providers on Arc. Bulk-buy volume = market-driven reputation.",
};

export default function ProvidersPage() {
  return (
    <main className="relative min-h-screen bg-arc-bg bg-arc-gradient">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <nav className="text-sm text-arc-muted">
          <Link href="/" className="hover:text-arc-text">
            ArcTrust
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-arc-text">Providers</span>
        </nav>

        <header className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Provider directory
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-arc-muted md:text-base">
              Pay per use with Circle Nanopayments. Buy in bulk to lock in
              steeper per-call pricing. Bulk-buy volume this month is the
              reputation signal — the badges below show real demand.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-arc-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-arc-accent/40 bg-arc-accent/10 px-2.5 py-1 text-arc-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-arc-accent" />
              Live on Arc
            </span>
          </div>
        </header>

        <section className="mt-8">
          <DirectoryControls providers={PROVIDERS_SEED} />
        </section>
      </div>
    </main>
  );
}
