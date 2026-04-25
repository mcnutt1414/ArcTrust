"use client";

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from "react";
import type { RecentPurchase } from "@/app/api/purchases/recent/route";
import { formatUsdc, relativeTime, truncateHash } from "./format";

export type ActivityFeedHandle = {
  refresh: () => void;
};

export const ActivityFeed = forwardRef<ActivityFeedHandle, { providerId: string }>(
  function ActivityFeed({ providerId }, ref) {
    const [purchases, setPurchases] = useState<RecentPurchase[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/purchases/recent?providerId=${encodeURIComponent(providerId)}&limit=8`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = (await res.json()) as { purchases: RecentPurchase[] };
          setPurchases(data.purchases ?? []);
        } else {
          setPurchases([]);
        }
      } catch {
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    }, [providerId]);

    useEffect(() => {
      load();
    }, [load]);

    useImperativeHandle(ref, () => ({ refresh: load }), [load]);

    if (loading && purchases.length === 0) {
      return (
        <div className="rounded-xl border border-arc-border bg-arc-surface/40 p-6 text-sm text-arc-muted">
          Loading recent activity…
        </div>
      );
    }

    if (purchases.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-arc-border bg-arc-surface/30 p-8 text-center text-sm text-arc-muted">
          No on-chain purchases yet — be the first.
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-arc-border bg-arc-surface/40">
        <table className="w-full text-left text-sm">
          <thead className="bg-arc-bg/40 text-[11px] uppercase tracking-wider text-arc-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">When</th>
              <th className="px-4 py-2.5 font-medium">Tier</th>
              <th className="px-4 py-2.5 font-medium text-right">Amount</th>
              <th className="px-4 py-2.5 font-medium">Tx</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr
                key={p.id}
                className="border-t border-arc-border/70 hover:bg-arc-bg/30"
              >
                <td className="px-4 py-3 text-arc-muted">
                  {relativeTime(p.createdAt)}
                </td>
                <td className="px-4 py-3 font-mono text-arc-text">
                  {p.tierUnits.toLocaleString()} ×
                </td>
                <td className="px-4 py-3 text-right font-mono text-arc-accent">
                  {formatUsdc(p.amountUsdc)}
                </td>
                <td className="px-4 py-3 font-mono">
                  <a
                    href={p.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-arc-glow hover:underline"
                  >
                    {truncateHash(p.txHash)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);
