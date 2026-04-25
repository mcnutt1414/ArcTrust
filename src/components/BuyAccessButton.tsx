"use client";

import type { BuyAccessButtonProps } from "@/lib/types";

export function BuyAccessButton(_props: BuyAccessButtonProps) {
  return (
    <button
      disabled
      className="rounded-md border border-arc-border bg-arc-surface px-4 py-2 text-arc-muted"
    >
      Buy access (Circle integration pending)
    </button>
  );
}
