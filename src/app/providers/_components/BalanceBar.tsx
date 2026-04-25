"use client";

import { useEffect, useRef, useState } from "react";
import type { WalletBalanceResponse } from "@/app/api/wallet/balance/route";

const POLL_MS = 12_000;

function truncateAddress(addr: string | null): string {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatBalance(amount: number | null): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  // 3 decimals is plenty for USDC; trim trailing zeros for nicer display.
  const fixed = amount.toFixed(3);
  return fixed.replace(/\.?0+$/, "") || "0";
}

export function BalanceBar() {
  const [data, setData] = useState<WalletBalanceResponse | null>(null);
  const [stale, setStale] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const res = await fetch("/api/wallet/balance", { cache: "no-store" });
        if (!res.ok) {
          if (mounted.current) setStale(true);
        } else {
          const json = (await res.json()) as WalletBalanceResponse;
          if (mounted.current) {
            setData(json);
            setStale(json.balanceUsdc == null);
          }
        }
      } catch {
        if (mounted.current) setStale(true);
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

  const address = data?.address ?? null;
  const balance = data?.balanceUsdc ?? null;
  const isLive = !stale && balance != null;

  return (
    <div className="border-b border-arc-border bg-arc-surface/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-2 text-xs text-arc-muted">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isLive
                ? "bg-arc-accent shadow-[0_0_6px_rgba(45,212,191,0.8)] animate-pulse"
                : "bg-arc-muted/60"
            }`}
            aria-hidden="true"
          />
          <span className="uppercase tracking-wider text-[10px]">
            Sender wallet · Arc Testnet
          </span>
          <span className="font-mono text-arc-text/80">
            {truncateAddress(address)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {balance != null ? (
            <span className="font-mono">
              <span className="font-semibold text-arc-text tabular-nums">
                {formatBalance(balance)}
              </span>
              <span className="ml-1 text-arc-muted">USDC</span>
            </span>
          ) : (
            <span className="italic text-arc-muted">balance unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
