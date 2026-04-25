import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export type ProviderCounts = Record<string, number>;

/**
 * Returns a map of providerId -> live count of recent buyers.
 *
 * "Buyers" is `count(distinct buyer_address)` over purchases in the last 30
 * days. If buyer_address is null on every row for a provider, we fall back
 * to a count of all purchases for that provider in the same window.
 */
export async function GET() {
  try {
    const supabase = getServerSupabase();
    const sinceIso = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("purchases")
      .select("provider_id, buyer_address")
      .gte("created_at", sinceIso);

    if (error) {
      return NextResponse.json({ counts: {} satisfies ProviderCounts });
    }

    const distinctBuyers = new Map<string, Set<string>>();
    const totalRows = new Map<string, number>();

    for (const row of data ?? []) {
      const pid = (row.provider_id as string) ?? "";
      if (!pid) continue;
      const addr = (row.buyer_address as string | null) ?? null;
      totalRows.set(pid, (totalRows.get(pid) ?? 0) + 1);
      if (addr) {
        let set = distinctBuyers.get(pid);
        if (!set) {
          set = new Set<string>();
          distinctBuyers.set(pid, set);
        }
        set.add(addr.toLowerCase());
      }
    }

    const counts: ProviderCounts = {};
    const allPids = new Set<string>([
      ...distinctBuyers.keys(),
      ...totalRows.keys(),
    ]);
    for (const pid of allPids) {
      const distinct = distinctBuyers.get(pid)?.size ?? 0;
      const total = totalRows.get(pid) ?? 0;
      counts[pid] = distinct > 0 ? distinct : total;
    }

    return NextResponse.json({ counts });
  } catch {
    return NextResponse.json({ counts: {} satisfies ProviderCounts });
  }
}
