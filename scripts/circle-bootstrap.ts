/**
 * Standalone Circle bootstrap script.
 *
 * Runs the same flow as POST /api/wallet/bootstrap from the command line so a
 * human can prepare wallets before the Next.js app is even running.
 *
 * Usage:
 *   npx tsx scripts/circle-bootstrap.ts
 *
 * Reads CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET, and (optionally)
 * CIRCLE_ARC_BLOCKCHAIN, CIRCLE_WALLET_SET_ID, CIRCLE_SENDER_WALLET_ID,
 * CIRCLE_SENDER_WALLET_ADDRESS, CIRCLE_PROVIDER_WALLET_ID,
 * CIRCLE_PROVIDER_WALLET_ADDRESS from .env.local. Prints values that should
 * be copied back into .env.local.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { bootstrapArcTrustWallets } from "../src/lib/circle";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  let raw: string;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    return; // No .env.local — rely on the surrounding shell env.
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvLocal();
  const result = await bootstrapArcTrustWallets();

  console.log("");
  console.log("==== ArcTrust Circle Bootstrap ====");
  console.log(`CIRCLE_WALLET_SET_ID=${result.walletSetId}`);
  console.log(`CIRCLE_SENDER_WALLET_ID=${result.senderWalletId}`);
  console.log(`CIRCLE_SENDER_WALLET_ADDRESS=${result.senderAddress}`);
  console.log(`CIRCLE_PROVIDER_WALLET_ID=${result.providerWalletId}`);
  console.log(`CIRCLE_PROVIDER_WALLET_ADDRESS=${result.providerAddress}`);
  console.log(`CIRCLE_ARC_BLOCKCHAIN=${result.blockchain}`);
  console.log("");
  console.log("Faucet:");
  console.log(`  ${result.faucetInstructions}`);
  console.log("===================================");
  console.log("");
}

main().catch((err) => {
  console.error("Bootstrap failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
