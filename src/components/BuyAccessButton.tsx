"use client";

import { useState } from "react";
import type {
  BuyAccessButtonProps,
  PurchaseReceipt,
  SandboxResponse,
} from "@/lib/types";
import { SandboxResponseView } from "@/app/providers/_components/SandboxResponseView";

type Status = "idle" | "pending" | "success" | "error";
type SandboxStatus = "idle" | "calling" | "ok" | "error";

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

  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus>("idle");
  const [sandboxResponse, setSandboxResponse] = useState<SandboxResponse | null>(
    null,
  );
  const [sandboxError, setSandboxError] = useState<string>("");
  const [callsRemaining, setCallsRemaining] = useState<number | null>(null);

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
      setCallsRemaining(
        typeof purchase.callsRemaining === "number"
          ? purchase.callsRemaining
          : tierUnits,
      );
      setStatus("success");
      onSuccess?.(purchase);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      setStatus("error");
    }
  }

  async function handleTryItNow() {
    if (!receipt?.accessToken) {
      setSandboxError("No access token on this receipt — cannot call sandbox.");
      setSandboxStatus("error");
      return;
    }
    setSandboxStatus("calling");
    setSandboxError("");
    try {
      const res = await fetch(`/api/sandbox/${encodeURIComponent(providerId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessToken: receipt.accessToken }),
      });
      const json = (await res.json().catch(() => ({}))) as
        | SandboxResponse
        | { error?: string };
      if (!res.ok) {
        const msg =
          (json as { error?: string }).error ??
          `Sandbox call failed (HTTP ${res.status})`;
        throw new Error(msg);
      }
      const payload = json as SandboxResponse;
      setSandboxResponse(payload);
      setCallsRemaining(payload.callsRemaining);
      setSandboxStatus("ok");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSandboxError(message);
      setSandboxStatus("error");
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
    const remaining = callsRemaining ?? tierUnits;
    const tokenAvailable = Boolean(receipt.accessToken);
    const allUsed = remaining <= 0;

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-col gap-1">
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

        {tokenAvailable ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-arc-muted">
              {remaining} / {tierUnits} API calls remaining
            </div>
            <button
              type="button"
              onClick={handleTryItNow}
              disabled={sandboxStatus === "calling" || allUsed}
              className="inline-flex w-fit items-center gap-2 rounded-md bg-arc-glow px-4 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sandboxStatus === "calling" ? (
                <>
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
                  />
                  <span>Calling…</span>
                </>
              ) : allUsed ? (
                <span>All calls used</span>
              ) : (
                <span>Try it now</span>
              )}
            </button>

            {sandboxStatus === "ok" && sandboxResponse ? (
              <div className="flex flex-col gap-2">
                <SandboxResponseView response={sandboxResponse} />
                <p className="text-xs text-arc-muted">
                  Status {sandboxResponse.status} · {sandboxResponse.latencyMs}
                  ms · {sandboxResponse.callsRemaining} calls left
                </p>
              </div>
            ) : null}

            {sandboxStatus === "error" ? (
              <p className="text-xs text-rose-400" role="alert">
                {sandboxError || "Sandbox call failed."}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="text-xs text-amber-400">
            Sandbox token not minted — DB write may have failed. On-chain payment
            still settled.
          </div>
        )}
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
