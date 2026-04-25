import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export type RecentPurchase = {
  id: string;
  providerId: string;
  tierUnits: number;
  amountUsdc: number;
  txHash: string;
  explorerUrl: string;
  buyerAddress: string | null;
  createdAt: string;
};

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) {
    return NextResponse.json({ purchases: [] satisfies RecentPurchase[] });
  }

  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = Math.max(1, Math.min(50, Number(limitRaw) || 8));

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("purchases")
      .select(
        "id, provider_id, tier_units, amount_usdc, tx_hash, explorer_url, buyer_address, created_at",
      )
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ purchases: [] satisfies RecentPurchase[] });
    }

    const purchases: RecentPurchase[] = (data ?? []).map((row) => ({
      id: row.id as string,
      providerId: row.provider_id as string,
      tierUnits: Number(row.tier_units),
      amountUsdc: Number(row.amount_usdc),
      txHash: row.tx_hash as string,
      explorerUrl: row.explorer_url as string,
      buyerAddress: (row.buyer_address as string | null) ?? null,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ purchases });
  } catch {
    return NextResponse.json({ purchases: [] satisfies RecentPurchase[] });
  }
}
