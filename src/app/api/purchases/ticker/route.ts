import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export type TickerPurchase = {
  id: string;
  providerId: string;
  tierUnits: number;
  amountUsdc: number;
  txHash: string;
  explorerUrl: string;
  createdAt: string;
};

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("purchases")
      .select(
        "id, provider_id, tier_units, amount_usdc, tx_hash, explorer_url, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      return NextResponse.json({ purchases: [] satisfies TickerPurchase[] });
    }

    const purchases: TickerPurchase[] = (data ?? []).map((row) => ({
      id: row.id as string,
      providerId: row.provider_id as string,
      tierUnits: Number(row.tier_units),
      amountUsdc: Number(row.amount_usdc),
      txHash: (row.tx_hash as string) ?? "",
      explorerUrl: (row.explorer_url as string) ?? "",
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ purchases });
  } catch {
    return NextResponse.json({ purchases: [] satisfies TickerPurchase[] });
  }
}
