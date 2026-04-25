import Link from "next/link";
import type { Provider } from "@/lib/types";
import { formatUsdc, lowestTier } from "./format";

export function ProviderCard({ provider }: { provider: Provider }) {
  const best = lowestTier(provider.bulkTiers);
  const isHot = provider.bulkBuyersThisMonth >= 500;

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group flex h-full flex-col rounded-xl border border-arc-border bg-arc-surface/60 p-5 transition hover:-translate-y-0.5 hover:border-arc-glow/60 hover:bg-arc-surface hover:shadow-[0_0_0_1px_rgba(124,92,255,0.25),0_20px_60px_-30px_rgba(124,92,255,0.5)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-arc-text group-hover:text-white">
            {provider.name}
          </h3>
          <span className="mt-1 inline-block rounded-full border border-arc-border bg-arc-bg px-2 py-0.5 text-xs text-arc-muted">
            {provider.category}
          </span>
        </div>
        <BulkBuyersBadge count={provider.bulkBuyersThisMonth} hot={isHot} />
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-arc-muted">
        {provider.shortDescription}
      </p>

      <div className="mt-5 flex items-end justify-between border-t border-arc-border pt-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-arc-muted">
            Base price
          </div>
          <div className="mt-0.5 font-mono text-sm text-arc-text">
            {formatUsdc(provider.basePricePerCallUsdc)} / call
          </div>
        </div>
        {best && (
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-arc-muted">
              Bulk from
            </div>
            <div className="mt-0.5 font-mono text-sm text-arc-accent">
              {formatUsdc(best.pricePerUnitUsdc)}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function BulkBuyersBadge({ count, hot }: { count: number; hot: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        hot
          ? "border-arc-accent/40 bg-arc-accent/10 text-arc-accent"
          : "border-arc-border bg-arc-bg text-arc-muted"
      }`}
      title={`${count.toLocaleString()} bulk buyers this month`}
    >
      {hot ? <FlameIcon /> : <DotIcon />}
      <span className="font-mono tabular-nums">{count.toLocaleString()}</span>
    </div>
  );
}

function FlameIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2s4 4.5 4 8a4 4 0 1 1-8 0c0-1.2.4-2.3 1-3.2C8.4 8.4 8 9.7 8 11a6 6 0 1 0 12 0c0-5-8-9-8-9z" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3" fill="currentColor" />
    </svg>
  );
}
