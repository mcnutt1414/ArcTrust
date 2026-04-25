import { NextResponse } from "next/server";
import {
  ARC_TESTNET_USDC_ADDRESS,
  getArcBlockchain,
  getCircleClient,
} from "@/lib/circle";

export const dynamic = "force-dynamic";

export type WalletBalanceResponse = {
  balanceUsdc: number | null;
  address: string | null;
  blockchain: string;
  error?: string;
};

export async function GET() {
  const blockchain = String(getArcBlockchain());
  const senderWalletId = process.env.CIRCLE_SENDER_WALLET_ID?.trim() || "";
  const senderAddress =
    process.env.CIRCLE_SENDER_WALLET_ADDRESS?.trim() || null;

  if (!senderWalletId) {
    return NextResponse.json(
      {
        balanceUsdc: null,
        address: senderAddress,
        blockchain,
        error: "CIRCLE_SENDER_WALLET_ID is not set",
      } satisfies WalletBalanceResponse,
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        },
      },
    );
  }

  try {
    const client = getCircleClient();
    // No tokenAddresses filter: USDC on Arc is the native asset
    // (isNative=true, no tokenAddress), so filtering by address excludes it.
    const res = await client.getWalletTokenBalance({ id: senderWalletId });

    const balances = res.data?.tokenBalances ?? [];
    const usdc =
      balances.find((b) => (b.token.symbol ?? "").toUpperCase() === "USDC") ??
      balances[0];

    const amount = usdc ? Number(usdc.amount) : 0;
    const balanceUsdc = Number.isFinite(amount) ? amount : 0;

    return NextResponse.json(
      {
        balanceUsdc,
        address: senderAddress,
        blockchain,
      } satisfies WalletBalanceResponse,
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        },
      },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch wallet balance";
    return NextResponse.json(
      {
        balanceUsdc: null,
        address: senderAddress,
        blockchain,
        error: message,
      } satisfies WalletBalanceResponse,
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        },
      },
    );
  }
}
