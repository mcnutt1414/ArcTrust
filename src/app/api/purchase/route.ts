import { NextResponse } from "next/server";
import { sendUsdcTransfer, buildExplorerUrl } from "@/lib/circle";
import { getServerSupabase } from "@/lib/supabase";
import type { PurchaseReceipt } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PurchaseRequestBody = {
  providerId?: unknown;
  tierUnits?: unknown;
  amountUsdc?: unknown;
};

export async function POST(req: Request) {
  let body: PurchaseRequestBody;
  try {
    body = (await req.json()) as PurchaseRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const providerId =
    typeof body.providerId === "string" ? body.providerId.trim() : "";
  const tierUnits =
    typeof body.tierUnits === "number" ? body.tierUnits : Number(body.tierUnits);
  const amountUsdc =
    typeof body.amountUsdc === "number"
      ? body.amountUsdc
      : Number(body.amountUsdc);

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(tierUnits) || tierUnits <= 0) {
    return NextResponse.json(
      { error: "tierUnits must be a positive number" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) {
    return NextResponse.json(
      { error: "amountUsdc must be a positive number" },
      { status: 400 },
    );
  }

  const providerAddress = process.env.CIRCLE_PROVIDER_WALLET_ADDRESS?.trim();
  const senderAddress = process.env.CIRCLE_SENDER_WALLET_ADDRESS?.trim() || null;
  if (!providerAddress) {
    return NextResponse.json(
      {
        error:
          "CIRCLE_PROVIDER_WALLET_ADDRESS is not set. Run /api/wallet/bootstrap and copy the output into .env.local.",
      },
      { status: 500 },
    );
  }

  try {
    const transfer = await sendUsdcTransfer({
      destinationAddress: providerAddress,
      amountUsdc,
      refId: `arctrust:${providerId}:${tierUnits}`,
    });

    if (!transfer.txHash) {
      return NextResponse.json(
        {
          error: `Transfer accepted (id ${transfer.transactionId}, state ${transfer.state}) but no tx hash within polling window. Try again in a moment.`,
        },
        { status: 504 },
      );
    }

    const explorerUrl = transfer.explorerUrl || buildExplorerUrl(transfer.txHash);
    const timestamp = new Date().toISOString();

    // Persist a market-driven reputation row in Supabase. If the insert
    // fails we still return the receipt — the on-chain tx is the source
    // of truth — but we surface the DB error in logs.
    try {
      const supabase = getServerSupabase();
      const { error: insertErr } = await supabase.from("purchases").insert({
        provider_id: providerId,
        tier_units: tierUnits,
        amount_usdc: amountUsdc,
        tx_hash: transfer.txHash,
        explorer_url: explorerUrl,
        buyer_address: senderAddress,
      });
      if (insertErr) {
        // eslint-disable-next-line no-console
        console.error("[purchase] supabase insert failed:", insertErr);
      }
    } catch (dbErr) {
      // eslint-disable-next-line no-console
      console.error("[purchase] supabase unavailable:", dbErr);
    }

    const receipt: PurchaseReceipt = {
      txHash: transfer.txHash,
      explorerUrl,
      amountUsdc,
      timestamp,
      providerId,
      tierUnits,
    };
    return NextResponse.json(receipt);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[purchase] failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
