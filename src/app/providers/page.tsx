import Link from "next/link";
import { PROVIDERS_SEED } from "@/lib/providers-seed";
import { getServerSupabase } from "@/lib/supabase";
import type { Provider } from "@/lib/types";
import { BalanceBar } from "./_components/BalanceBar";
import { DirectoryControls } from "./_components/DirectoryControls";
import { Ticker } from "./_components/Ticker";

export const metadata = {
  title: "Providers — ArcTrust",
  description:
    "Browse trustworthy API providers on Arc. Bulk-buy volume = market-driven reputation.",
};

// Always render fresh so live counts reflect new purchases.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type LiveCounts = Record<string, number>;

async function fetchLiveCounts(): Promise<LiveCounts> {
  try {
    const supabase = getServerSupabase();
    const sinceIso = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("purchases")
      .select("provider_id, buyer_address")
      .gte("created_at", sinceIso);

    if (error || !data) return {};

    const distinctBuyers = new Map<string, Set<string>>();
    const totalRows = new Map<string, number>();

    for (const row of data) {
      const pid = (row.provider_id as string) ?? "";
      if (!pid) continue;
      const addr = (row.buyer_address as string | null) ?? null;
      totalRows.set(pid, (totalRows.get(pid) ?? 0) + 1);
      if (addr) {
        let set = distinctBuyers.get(pid);
        if (!set) {
          set = new Set<string>();
          distinctBuyers.set(pid, set);
        }
        set.add(addr.toLowerCase());
      }
    }

    const counts: LiveCounts = {};
    const allPids = new Set<string>([
      ...distinctBuyers.keys(),
      ...totalRows.keys(),
    ]);
    for (const pid of allPids) {
      const distinct = distinctBuyers.get(pid)?.size ?? 0;
      const total = totalRows.get(pid) ?? 0;
      counts[pid] = distinct > 0 ? distinct : total;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function ProvidersPage() {
  const liveCounts = await fetchLiveCounts();

  const providers: Provider[] = PROVIDERS_SEED.map((p) => ({
    ...p,
    bulkBuyersThisMonth: p.bulkBuyersThisMonth + (liveCounts[p.id] ?? 0),
  }));

  const providerNames: Record<string, string> = Object.fromEntries(
    PROVIDERS_SEED.map((p) => [p.id, p.name]),
  );

  return (
    <main className="relative min-h-screen bg-arc-bg bg-arc-gradient">
      <Ticker providerNames={providerNames} />
      <BalanceBar />

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
          <DirectoryControls providers={providers} />
        </section>
      </div>
    </main>
  );
}
