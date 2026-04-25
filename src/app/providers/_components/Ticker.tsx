"use client";

import { useEffect, useRef, useState } from "react";
import type { TickerPurchase } from "@/app/api/purchases/ticker/route";
import { formatUsdc, relativeTime } from "./format";

const POLL_MS = 4_000;

type ProviderNameMap = Record<string, string>;

export function Ticker({ providerNames }: { providerNames: ProviderNameMap }) {
  const [purchases, setPurchases] = useState<TickerPurchase[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const res = await fetch("/api/purchases/ticker", { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as { purchases: TickerPurchase[] };
          if (mounted.current) {
            setPurchases(json.purchases ?? []);
          }
        }
      } catch {
        // swallow — keep last known list
      } finally {
        if (mounted.current) {
          timer = setTimeout(tick, POLL_MS);
        }
      }
    };
    tick();

    return () => {
      mounted.current = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Duplicate the list so the marquee loop is seamless.
  const items = purchases.length > 0 ? purchases : [];
  const doubled = items.length > 0 ? [...items, ...items] : [];

  return (
    <div className="relative overflow-hidden border-b border-arc-border bg-arc-bg/80">
      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-arc-bg to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-arc-bg to-transparent" />

      <div className="mx-auto max-w-6xl px-2">
        {doubled.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-arc-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-arc-glow/70 animate-pulse" />
            Live purchases · waiting for the first transaction…
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2">
            <span className="shrink-0 px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-arc-glow">
              Live
            </span>
            <div className="ticker-track flex shrink-0 gap-2 whitespace-nowrap">
              {doubled.map((p, idx) => {
                const name = providerNames[p.providerId] ?? p.providerId;
                return (
                  <span
                    key={`${p.id}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full border border-arc-border bg-arc-surface/70 px-3 py-1 text-xs text-arc-muted transition hover:border-arc-glow/40"
                  >
                    <span className="text-arc-text">{name}</span>
                    <span className="text-arc-border">·</span>
                    <span className="font-mono text-arc-accent">
                      {formatUsdc(p.amountUsdc)}
                    </span>
                    <span className="text-arc-border">·</span>
                    <span className="font-mono">{relativeTime(p.createdAt)}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: arctrust-ticker 40s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes arctrust-ticker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
