"use client";

import { useMemo, useRef, useState } from "react";
import type { Provider, PurchaseReceipt } from "@/lib/types";
import { BuyAccessButton } from "@/components/BuyAccessButton";
import { ActivityFeed, type ActivityFeedHandle } from "./ActivityFeed";
import { formatUsdc, tierTotal } from "./format";

export function BuyAccessPanel({ provider }: { provider: Provider }) {
  const tiers = provider.bulkTiers;
  const defaultIndex = useMemo(() => {
    // Default to a meaningful bulk tier (second-cheapest by units if exists)
    if (tiers.length === 0) return 0;
    const sorted = [...tiers].sort((a, b) => a.units - b.units);
    const target = sorted[Math.min(1, sorted.length - 1)];
    return tiers.findIndex((t) => t === target);
  }, [tiers]);

  const [selectedIndex, setSelectedIndex] = useState<number>(defaultIndex);
  const feedRef = useRef<ActivityFeedHandle>(null);

  const selected = tiers[selectedIndex];
  const total = selected ? tierTotal(selected) : 0;
  const baseUnitPrice = provider.basePricePerCallUsdc;
  const savingsPct =
    selected && baseUnitPrice > 0
      ? Math.max(
          0,
          Math.round(
            ((baseUnitPrice - selected.pricePerUnitUsdc) / baseUnitPrice) * 100,
          ),
        )
      : 0;

  const handleSuccess = (_receipt: PurchaseReceipt) => {
    feedRef.current?.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-arc-border bg-arc-surface/60 p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-semibold">Buy access</h3>
          {savingsPct > 0 && (
            <span className="rounded-full border border-arc-accent/40 bg-arc-accent/10 px-2 py-0.5 text-[11px] font-medium text-arc-accent">
              Save {savingsPct}% vs base
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiers.map((tier, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={tier.units}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-pressed={active}
                className={`flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition ${
                  active
                    ? "border-arc-glow bg-arc-glow/10 text-arc-text shadow-[0_0_0_1px_rgba(124,92,255,0.4)]"
                    : "border-arc-border bg-arc-bg text-arc-muted hover:border-arc-glow/50 hover:text-arc-text"
                }`}
              >
                <span className="font-mono text-sm">
                  {tier.units.toLocaleString()} ×
                </span>
                <span className="mt-0.5 text-[11px] text-arc-muted">
                  {formatUsdc(tier.pricePerUnitUsdc)} / call
                </span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-5 flex flex-col gap-4 border-t border-arc-border pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-arc-muted">
                Total due
              </div>
              <div className="mt-0.5 font-mono text-2xl text-arc-text">
                {formatUsdc(total)}{" "}
                <span className="text-sm text-arc-muted">USDC</span>
              </div>
              <div className="mt-1 text-xs text-arc-muted">
                {selected.units.toLocaleString()} calls at{" "}
                {formatUsdc(selected.pricePerUnitUsdc)} each
              </div>
            </div>
            <BuyAccessButton
              providerId={provider.id}
              providerName={provider.name}
              tierUnits={selected.units}
              totalPriceUsdc={total}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-arc-text">Recent activity</h3>
        <p className="mt-1 text-xs text-arc-muted">
          Last 8 on-chain purchases of {provider.name}.
        </p>
        <div className="mt-3">
          <ActivityFeed ref={feedRef} providerId={provider.id} />
        </div>
      </div>
    </div>
  );
}
