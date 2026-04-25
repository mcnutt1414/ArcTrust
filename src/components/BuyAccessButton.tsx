"use client";

import { useState } from "react";
import type { BuyAccessButtonProps, PurchaseReceipt } from "@/lib/types";

type Status = "idle" | "pending" | "success" | "error";

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export function BuyAccessButton(props: BuyAccessButtonProps) {
  const { providerId, providerName, tierUnits, totalPriceUsdc, onSuccess } =
    props;
  const [status, setStatus] = useState<Status>("idle");
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleClick() {
    setStatus("pending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerId,
          tierUnits,
          amountUsdc: totalPriceUsdc,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as
        | PurchaseReceipt
        | { error?: string };
      if (!res.ok) {
        const msg =
          (json as { error?: string }).error ??
          `Purchase failed (HTTP ${res.status})`;
        throw new Error(msg);
      }
      const purchase = json as PurchaseReceipt;
      setReceipt(purchase);
      setStatus("success");
      onSuccess?.(purchase);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      setStatus("error");
    }
  }

  const priceLabel = `${tierUnits} units · ${totalPriceUsdc.toFixed(4)} USDC`;

  if (status === "pending") {
    return (
      <button
        disabled
        aria-busy="true"
        className="inline-flex items-center gap-2 rounded-md border border-arc-border bg-arc-surface px-4 py-2 text-arc-muted"
      >
        <span
          aria-hidden
          className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-arc-muted border-t-transparent"
        />
        <span>Sending payment on Arc…</span>
      </button>
    );
  }

  if (status === "success" && receipt) {
    return (
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2 text-emerald-500">
          <span aria-hidden>✓</span>
          <span>
            Paid {receipt.amountUsdc.toFixed(4)} USDC to {providerName}
          </span>
        </div>
        <a
          href={receipt.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-arc-muted underline hover:text-arc-text"
        >
          {truncateHash(receipt.txHash)} ↗
        </a>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleClick}
          className="rounded-md border border-arc-border bg-arc-surface px-4 py-2 text-arc-text hover:bg-arc-surface/80"
        >
          Retry · {priceLabel}
        </button>
        <p className="text-xs text-rose-400" role="alert">
          {errorMessage || "Payment failed. Try again."}
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-arc-border bg-arc-accent px-4 py-2 text-arc-bg hover:opacity-90"
    >
      Buy {priceLabel}
    </button>
  );
}
