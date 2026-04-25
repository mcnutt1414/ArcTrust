// Generates a Circle entity secret + ciphertext for registration.
// Follows: https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet#register-an-entity-secret-ciphertext
//
// Steps:
//   1. Generate a 32-byte random hex (the entity secret).
//   2. Fetch Circle's public RSA key for your account.
//   3. RSA-OAEP encrypt the entity secret with SHA-256, base64 encode.
//   4. You paste the ciphertext into Circle Console → Wallet API → Configure Entity Secret.
//   5. Save the raw entity secret as CIRCLE_ENTITY_SECRET in .env.local.
//
// Run: node scripts/generate-entity-secret.mjs

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(repoRoot, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const apiKey = process.env.CIRCLE_API_KEY;
if (!apiKey) {
  console.error("ERROR: CIRCLE_API_KEY missing from environment / .env.local");
  process.exit(1);
}

async function main() {
  const entitySecret = crypto.randomBytes(32).toString("hex");

  const res = await fetch(
    "https://api.circle.com/v1/w3s/config/entity/publicKey",
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (!res.ok) {
    console.error(
      `ERROR: failed to fetch Circle public key (HTTP ${res.status}): ${await res.text()}`
    );
    process.exit(1);
  }
  const body = await res.json();
  const publicKey = body?.data?.publicKey;
  if (!publicKey) {
    console.error("ERROR: response missing data.publicKey");
    console.error(JSON.stringify(body));
    process.exit(1);
  }

  const ciphertextBuf = crypto.publicEncrypt(
    {
      key: publicKey,
      oaepHash: "sha256",
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(entitySecret, "hex")
  );
  const ciphertext = ciphertextBuf.toString("base64");

  console.log("");
  console.log("================================================================");
  console.log(" ENTITY SECRET — save this as CIRCLE_ENTITY_SECRET in .env.local");
  console.log("================================================================");
  console.log(entitySecret);
  console.log("");
  console.log("================================================================");
  console.log(" CIPHERTEXT — paste into Circle Console → Configure Entity Secret");
  console.log("================================================================");
  console.log(ciphertext);
  console.log("");
  console.log(
    "Note: each call to this script generates a NEW key. Once registered in Console, do not regenerate."
  );
}

main().catch((err) => {
  console.error("FATAL", err);
  process.exit(1);
});
