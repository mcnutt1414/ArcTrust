import type { BulkTier } from "@/lib/types";

export function formatUsdc(amount: number): string {
  if (amount >= 1) {
    return `$${amount.toFixed(2)}`;
  }
  if (amount >= 0.01) {
    return `$${amount.toFixed(4)}`;
  }
  if (amount >= 0.0001) {
    return `$${amount.toFixed(5)}`;
  }
  return `$${amount.toFixed(6)}`;
}

export function lowestTier(tiers: BulkTier[]): BulkTier | undefined {
  if (tiers.length === 0) return undefined;
  return tiers.reduce((min, t) =>
    t.pricePerUnitUsdc < min.pricePerUnitUsdc ? t : min,
  );
}

export function tierTotal(tier: BulkTier): number {
  return tier.units * tier.pricePerUnitUsdc;
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const now = Date.now();
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

export function truncateHash(hash: string, head = 6, tail = 4): string {
  if (!hash) return "";
  if (hash.length <= head + tail + 2) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}
