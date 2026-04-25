// Standalone wallet bootstrap — bypasses Next server.
// Creates wallet set + sender + provider wallets via Circle SDK,
// prints everything, appends IDs to .env.local.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const envPath = path.join(repoRoot, ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

function setEnvKey(key, value) {
  let content = fs.readFileSync(envPath, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, content, "utf8");
}

loadEnv();

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
const blockchain = process.env.CIRCLE_ARC_BLOCKCHAIN || "ARC-TESTNET";

if (!apiKey || !entitySecret) {
  console.error("ERROR: CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET missing");
  process.exit(1);
}

const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

async function ensureWalletSet() {
  if (process.env.CIRCLE_WALLET_SET_ID) {
    return process.env.CIRCLE_WALLET_SET_ID;
  }
  console.log("Creating wallet set 'ArcTrust'...");
  const res = await client.createWalletSet({ name: "ArcTrust" });
  const id = res.data?.walletSet?.id;
  if (!id) throw new Error(`createWalletSet returned no id: ${JSON.stringify(res.data)}`);
  setEnvKey("CIRCLE_WALLET_SET_ID", id);
  console.log("  walletSetId:", id);
  return id;
}

async function createWallet(walletSetId, name) {
  console.log(`Creating wallet '${name}' on ${blockchain}...`);
  const res = await client.createWallets({
    walletSetId,
    blockchains: [blockchain],
    count: 1,
    accountType: "EOA",
    metadata: [{ name }],
  });
  const wallet = res.data?.wallets?.[0];
  if (!wallet?.id || !wallet?.address) {
    throw new Error(`createWallets returned malformed result: ${JSON.stringify(res.data)}`);
  }
  console.log(`  ${name}.id:`, wallet.id);
  console.log(`  ${name}.address:`, wallet.address);
  return wallet;
}

async function main() {
  const walletSetId = await ensureWalletSet();

  let senderId = process.env.CIRCLE_SENDER_WALLET_ID;
  let senderAddress = process.env.CIRCLE_SENDER_WALLET_ADDRESS;
  if (!senderId || !senderAddress) {
    const w = await createWallet(walletSetId, "sender");
    senderId = w.id;
    senderAddress = w.address;
    setEnvKey("CIRCLE_SENDER_WALLET_ID", senderId);
    setEnvKey("CIRCLE_SENDER_WALLET_ADDRESS", senderAddress);
  }

  let providerId = process.env.CIRCLE_PROVIDER_WALLET_ID;
  let providerAddress = process.env.CIRCLE_PROVIDER_WALLET_ADDRESS;
  if (!providerId || !providerAddress) {
    const w = await createWallet(walletSetId, "arctrust-provider");
    providerId = w.id;
    providerAddress = w.address;
    setEnvKey("CIRCLE_PROVIDER_WALLET_ID", providerId);
    setEnvKey("CIRCLE_PROVIDER_WALLET_ADDRESS", providerAddress);
  }

  console.log("");
  console.log("==================== ArcTrust bootstrap done ====================");
  console.log(`CIRCLE_WALLET_SET_ID=${walletSetId}`);
  console.log(`CIRCLE_SENDER_WALLET_ID=${senderId}`);
  console.log(`CIRCLE_SENDER_WALLET_ADDRESS=${senderAddress}`);
  console.log(`CIRCLE_PROVIDER_WALLET_ID=${providerId}`);
  console.log(`CIRCLE_PROVIDER_WALLET_ADDRESS=${providerAddress}`);
  console.log(`CIRCLE_ARC_BLOCKCHAIN=${blockchain}`);
  console.log("");
  console.log(">>> FUND THE SENDER WALLET <<<");
  console.log(`    Visit https://faucet.circle.com → select Arc Testnet → paste:`);
  console.log(`    ${senderAddress}`);
  console.log("=================================================================");
}

main().catch((err) => {
  console.error("FATAL", err?.response?.data ?? err);
  process.exit(1);
});
