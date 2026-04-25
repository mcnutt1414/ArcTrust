import Link from "next/link";
import { notFound } from "next/navigation";
import { PROVIDERS_SEED } from "@/lib/providers-seed";
import { formatUsdc, tierTotal } from "../_components/format";
import { BuyAccessPanel } from "../_components/BuyAccessPanel";

export function generateStaticParams() {
  return PROVIDERS_SEED.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = PROVIDERS_SEED.find((p) => p.id === id);
  if (!provider) return { title: "Provider — ArcTrust" };
  return {
    title: `${provider.name} — ArcTrust`,
    description: provider.shortDescription,
  };
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = PROVIDERS_SEED.find((p) => p.id === id);
  if (!provider) {
    notFound();
  }

  const baseUnitPrice = provider.basePricePerCallUsdc;
  const isHot = provider.bulkBuyersThisMonth >= 500;

  return (
    <main className="relative min-h-screen bg-arc-bg bg-arc-gradient">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <nav className="text-sm text-arc-muted">
          <Link href="/" className="hover:text-arc-text">
            ArcTrust
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <Link href="/providers" className="hover:text-arc-text">
            Providers
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-arc-text">{provider.name}</span>
        </nav>

        <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-arc-border bg-arc-bg px-2 py-0.5 text-xs text-arc-muted">
                {provider.category}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  isHot
                    ? "border-arc-accent/40 bg-arc-accent/10 text-arc-accent"
                    : "border-arc-border bg-arc-bg text-arc-muted"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {provider.bulkBuyersThisMonth.toLocaleString()} bulk buyers this month
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {provider.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-arc-muted md:text-base">
              {provider.longDescription}
            </p>
          </div>
          <div className="rounded-xl border border-arc-border bg-arc-surface/60 px-5 py-4 text-right">
            <div className="text-[11px] uppercase tracking-wider text-arc-muted">
              Base price
            </div>
            <div className="mt-0.5 font-mono text-xl text-arc-text">
              {formatUsdc(baseUnitPrice)}
            </div>
            <div className="text-[11px] text-arc-muted">per call</div>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <section className="space-y-8 lg:col-span-3">
            <div>
              <h2 className="text-lg font-semibold">Bulk pricing</h2>
              <p className="mt-1 text-xs text-arc-muted">
                Lock in a tier with one nanopayment. Lower tiers stack savings as
                volume grows.
              </p>
              <div className="mt-3 overflow-hidden rounded-xl border border-arc-border bg-arc-surface/40">
                <table className="w-full text-left text-sm">
                  <thead className="bg-arc-bg/40 text-[11px] uppercase tracking-wider text-arc-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Tier</th>
                      <th className="px-4 py-2.5 font-medium">Per call</th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        Total
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {provider.bulkTiers.map((tier) => {
                      const total = tierTotal(tier);
                      const savings =
                        baseUnitPrice > 0
                          ? Math.max(
                              0,
                              Math.round(
                                ((baseUnitPrice - tier.pricePerUnitUsdc) /
                                  baseUnitPrice) *
                                  100,
                              ),
                            )
                          : 0;
                      return (
                        <tr
                          key={tier.units}
                          className="border-t border-arc-border/70"
                        >
                          <td className="px-4 py-3 font-mono text-arc-text">
                            {tier.units.toLocaleString()} ×
                          </td>
                          <td className="px-4 py-3 font-mono text-arc-text">
                            {formatUsdc(tier.pricePerUnitUsdc)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-arc-text">
                            {formatUsdc(total)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {savings > 0 ? (
                              <span className="rounded-full border border-arc-accent/40 bg-arc-accent/10 px-2 py-0.5 text-[11px] font-medium text-arc-accent">
                                −{savings}%
                              </span>
                            ) : (
                              <span className="text-xs text-arc-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Sample API call</h2>
              <p className="mt-1 text-xs text-arc-muted">
                Endpoint:{" "}
                <code className="rounded bg-arc-surface px-1.5 py-0.5 font-mono text-arc-text">
                  {provider.sampleEndpoint}
                </code>
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-arc-border bg-arc-surface/60 p-4 text-xs leading-relaxed text-arc-text">
                <code className="font-mono">{provider.sampleRequestSnippet}</code>
              </pre>
            </div>
          </section>

          <aside className="lg:col-span-2">
            <BuyAccessPanel provider={provider} />
          </aside>
        </div>

        <div className="mt-12">
          <Link
            href="/providers"
            className="inline-flex items-center gap-1.5 text-sm text-arc-muted hover:text-arc-text"
          >
            <span aria-hidden>←</span> Back to all providers
          </Link>
        </div>
      </div>
    </main>
  );
}
