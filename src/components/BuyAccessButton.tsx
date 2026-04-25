"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleTryItNow = useCallback(async () => {
    if (!receipt?.accessToken) {
      setSandboxError("No access token on this receipt — cannot call sandbox.");
      setSandboxStatus("error");
      setIsModalOpen(true);
      return;
    }
    setIsModalOpen(true);
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
  }, [providerId, receipt]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, closeModal]);

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
      <>
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
                disabled={allUsed}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-arc-glow px-4 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {allUsed ? "All calls used" : "Try it now"}
              </button>
            </div>
          ) : (
            <div className="text-xs text-amber-400">
              Sandbox token not minted — DB write may have failed. On-chain
              payment still settled.
            </div>
          )}
        </div>

        {isModalOpen ? (
          <SandboxModal
            providerName={providerName}
            sandboxStatus={sandboxStatus}
            sandboxResponse={sandboxResponse}
            sandboxError={sandboxError}
            callsRemaining={remaining}
            tierUnits={tierUnits}
            onClose={closeModal}
            onCallAgain={handleTryItNow}
          />
        ) : null}
      </>
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

type SandboxModalProps = {
  providerName: string;
  sandboxStatus: SandboxStatus;
  sandboxResponse: SandboxResponse | null;
  sandboxError: string;
  callsRemaining: number;
  tierUnits: number;
  onClose: () => void;
  onCallAgain: () => void;
};

function SandboxModal({
  providerName,
  sandboxStatus,
  sandboxResponse,
  sandboxError,
  callsRemaining,
  tierUnits,
  onClose,
  onCallAgain,
}: SandboxModalProps) {
  const allUsed = callsRemaining <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sandbox-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-arc-border bg-arc-bg shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-arc-border bg-arc-surface/40 px-5 py-4">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-arc-muted">
              Sandbox response
            </p>
            <h2
              id="sandbox-modal-title"
              className="text-lg font-semibold text-arc-text"
            >
              {providerName}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-arc-border bg-arc-bg px-2.5 py-1 text-xs text-arc-muted">
              {callsRemaining} / {tierUnits} calls left
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-arc-border bg-arc-bg text-arc-muted transition-colors hover:bg-arc-surface hover:text-arc-text"
            >
              <span aria-hidden className="text-base leading-none">
                ×
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {sandboxStatus === "calling" ? (
            <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-arc-muted">
              <span
                aria-hidden
                className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-arc-glow border-t-transparent"
              />
              <p className="text-sm">Calling {providerName} sandbox…</p>
            </div>
          ) : sandboxStatus === "ok" && sandboxResponse ? (
            <div className="flex flex-col gap-3">
              <SandboxResponseView response={sandboxResponse} />
              <p className="text-xs text-arc-muted">
                Status {sandboxResponse.status} · {sandboxResponse.latencyMs}ms
                · {sandboxResponse.callsRemaining} calls left
              </p>
            </div>
          ) : sandboxStatus === "error" ? (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-4">
              <p className="text-sm font-semibold text-rose-300">
                Sandbox call failed
              </p>
              <p className="mt-1 text-xs text-rose-200/90">
                {sandboxError || "Unknown error"}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-arc-border bg-arc-surface/40 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-arc-border bg-arc-bg px-3 py-2 text-sm text-arc-text hover:bg-arc-surface"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onCallAgain}
            disabled={sandboxStatus === "calling" || allUsed}
            className="inline-flex items-center gap-2 rounded-md bg-arc-glow px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
              "All calls used"
            ) : sandboxStatus === "ok" || sandboxStatus === "error" ? (
              "Call again"
            ) : (
              "Make API call"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
