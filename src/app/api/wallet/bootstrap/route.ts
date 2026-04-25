import { NextResponse } from "next/server";
import { bootstrapArcTrustWallets } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await bootstrapArcTrustWallets();

    // Print clearly so the human running the bootstrap can copy values into .env.local.
    // eslint-disable-next-line no-console
    console.log(
      [
        "",
        "==== ArcTrust Circle Bootstrap ====",
        `CIRCLE_WALLET_SET_ID=${result.walletSetId}`,
        `CIRCLE_SENDER_WALLET_ID=${result.senderWalletId}`,
        `CIRCLE_SENDER_WALLET_ADDRESS=${result.senderAddress}`,
        `CIRCLE_PROVIDER_WALLET_ID=${result.providerWalletId}`,
        `CIRCLE_PROVIDER_WALLET_ADDRESS=${result.providerAddress}`,
        `CIRCLE_ARC_BLOCKCHAIN=${result.blockchain}`,
        "Faucet:",
        `  ${result.faucetInstructions}`,
        "===================================",
        "",
      ].join("\n"),
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[wallet/bootstrap] failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
