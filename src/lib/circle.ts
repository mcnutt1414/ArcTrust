/**
 * Circle Developer Controlled Wallets wrapper for ArcTrust.
 *
 * All functions read credentials from process.env at call time so the app
 * boots even when env vars are not yet filled in (the parent fills them
 * after running the bootstrap flow). Functions throw a clear error if
 * required env vars are missing.
 *
 * Sources verified at build time:
 * - https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet
 * - https://community.arc.network/public/blogs/quickstart-spotlight-transfer-usdc-or-eurc-on-arc-using-dev-controlled-wallets
 *
 * Settled values:
 * - Blockchain identifier for Arc testnet: "ARC-TESTNET"
 *   (Arc is newer than the SDK's TypeScript Blockchain enum at v7.1.0,
 *    so we cast through the SDK's string-keyed type. The Circle API
 *    accepts the string at runtime.)
 * - USDC token address on Arc testnet: 0x3600000000000000000000000000000000000000
 * - Block explorer base: https://testnet.arcscan.app
 */

import {
  initiateDeveloperControlledWalletsClient,
  type Blockchain,
  type CircleDeveloperControlledWalletsClient,
  type TokenBlockchain,
} from "@circle-fin/developer-controlled-wallets";

/** Default blockchain id for Arc testnet. Override via CIRCLE_ARC_BLOCKCHAIN. */
export const DEFAULT_ARC_BLOCKCHAIN = "ARC-TESTNET";

/** USDC contract address on Arc testnet (verified from Circle quickstart). */
export const ARC_TESTNET_USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000";

/** Block explorer base for Arc testnet (Blockscout-hosted at arcscan). */
export const ARC_TESTNET_EXPLORER_BASE = "https://testnet.arcscan.app";

/** Build an explorer URL for a given tx hash. */
export function buildExplorerUrl(txHash: string): string {
  return `${ARC_TESTNET_EXPLORER_BASE}/tx/${txHash}`;
}

/** Read the Arc blockchain id from env, falling back to ARC-TESTNET. */
export function getArcBlockchain(): Blockchain {
  const raw = process.env.CIRCLE_ARC_BLOCKCHAIN?.trim();
  const value = raw && raw.length > 0 ? raw : DEFAULT_ARC_BLOCKCHAIN;
  // Cast through unknown — the SDK's Blockchain union doesn't yet list ARC,
  // but the Circle API accepts the string at runtime.
  return value as unknown as Blockchain;
}

/** Initialize a Circle client. Throws if creds are missing. */
export function getCircleClient(): CircleDeveloperControlledWalletsClient {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey) {
    throw new Error(
      "CIRCLE_API_KEY is not set. Add it to .env.local before calling Circle.",
    );
  }
  if (!entitySecret) {
    throw new Error(
      "CIRCLE_ENTITY_SECRET is not set. Add it to .env.local before calling Circle.",
    );
  }
  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

/** Result of a successful bootstrap. */
export type BootstrapResult = {
  walletSetId: string;
  senderWalletId: string;
  senderAddress: string;
  providerWalletId: string;
  providerAddress: string;
  blockchain: string;
  faucetInstructions: string;
};

type CreatedWallet = {
  id: string;
  address: string;
};

/**
 * Create the wallet set + sender + provider wallets for ArcTrust.
 * Idempotent-ish: if env already lists a walletSetId, it is reused.
 */
export async function bootstrapArcTrustWallets(): Promise<BootstrapResult> {
  const client = getCircleClient();
  const blockchain = getArcBlockchain();

  let walletSetId = process.env.CIRCLE_WALLET_SET_ID?.trim() || "";

  if (!walletSetId) {
    const setRes = await client.createWalletSet({ name: "ArcTrust" });
    const id = setRes.data?.walletSet?.id;
    if (!id) {
      throw new Error("Circle createWalletSet returned no id");
    }
    walletSetId = id;
  }

  const senderEnvId = process.env.CIRCLE_SENDER_WALLET_ID?.trim() || "";
  const senderEnvAddr = process.env.CIRCLE_SENDER_WALLET_ADDRESS?.trim() || "";
  const sender =
    senderEnvId && senderEnvAddr
      ? { id: senderEnvId, address: senderEnvAddr }
      : await createEoaWallet(client, walletSetId, blockchain, "sender");

  const providerEnvId = process.env.CIRCLE_PROVIDER_WALLET_ID?.trim() || "";
  const providerEnvAddr =
    process.env.CIRCLE_PROVIDER_WALLET_ADDRESS?.trim() || "";
  const provider =
    providerEnvId && providerEnvAddr
      ? { id: providerEnvId, address: providerEnvAddr }
      : await createEoaWallet(
          client,
          walletSetId,
          blockchain,
          "arctrust-provider",
        );

  const faucetInstructions = `Visit https://faucet.circle.com, select Arc Testnet, paste this sender address: ${sender.address}`;

  return {
    walletSetId,
    senderWalletId: sender.id,
    senderAddress: sender.address,
    providerWalletId: provider.id,
    providerAddress: provider.address,
    blockchain: String(blockchain),
    faucetInstructions,
  };
}

async function createEoaWallet(
  client: CircleDeveloperControlledWalletsClient,
  walletSetId: string,
  blockchain: Blockchain,
  name: string,
): Promise<CreatedWallet> {
  const res = await client.createWallets({
    walletSetId,
    blockchains: [blockchain],
    count: 1,
    accountType: "EOA",
    metadata: [{ name }],
  });
  const wallet = res.data?.wallets?.[0];
  if (!wallet?.id || !wallet?.address) {
    throw new Error(
      `Circle createWallets returned no wallet for ${name} on ${String(blockchain)}`,
    );
  }
  return { id: wallet.id, address: wallet.address };
}

/** Result of a successful USDC transfer. */
export type TransferResult = {
  transactionId: string;
  txHash: string | null;
  state: string;
  explorerUrl: string;
};

/** Terminal states from the Circle docs polling pattern. */
const TERMINAL_STATES = new Set([
  "COMPLETE",
  "CONFIRMED",
  "FAILED",
  "CANCELLED",
  "DENIED",
]);

/**
 * Send USDC on Arc testnet from CIRCLE_SENDER_WALLET_ID to a destination.
 * Polls for up to ~30s waiting for the tx hash to appear and a terminal
 * state to be reached. Returns as soon as a tx hash is available even if
 * the tx is not yet finalised.
 */
export async function sendUsdcTransfer(params: {
  destinationAddress: string;
  amountUsdc: number;
  refId?: string;
}): Promise<TransferResult> {
  const senderWalletId = process.env.CIRCLE_SENDER_WALLET_ID?.trim();
  if (!senderWalletId) {
    throw new Error(
      "CIRCLE_SENDER_WALLET_ID is not set. Run /api/wallet/bootstrap first.",
    );
  }
  if (!params.destinationAddress) {
    throw new Error("destinationAddress is required for USDC transfer");
  }
  if (!Number.isFinite(params.amountUsdc) || params.amountUsdc <= 0) {
    throw new Error("amountUsdc must be a positive number");
  }

  const client = getCircleClient();
  const blockchain = getArcBlockchain();

  // Use tokenAddress + blockchain (the SDK supports either tokenId or
  // tokenAddress+blockchain). Arc testnet USDC is at the well-known address.
  const createRes = await client.createTransaction({
    walletId: senderWalletId,
    destinationAddress: params.destinationAddress,
    amount: [params.amountUsdc.toString()],
    tokenAddress: ARC_TESTNET_USDC_ADDRESS,
    // The SDK's TokenBlockchain union doesn't yet include ARC-TESTNET in
    // v7.1.0, so we cast through unknown. The Circle API accepts the
    // string at runtime.
    blockchain: blockchain as unknown as TokenBlockchain,
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    refId: params.refId,
  });

  const transactionId = createRes.data?.id;
  if (!transactionId) {
    throw new Error("Circle createTransaction returned no transaction id");
  }

  // Poll for tx hash + terminal state. We poll every 2s up to ~30s.
  const maxAttempts = 15;
  const intervalMs = 2000;
  let txHash: string | null = null;
  let state: string = createRes.data?.state ?? "INITIATED";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(intervalMs);
    const poll = await client.getTransaction({ id: transactionId });
    const tx = poll.data?.transaction;
    if (!tx) continue;
    state = tx.state ?? state;
    if (tx.txHash) {
      txHash = tx.txHash;
    }
    // Bail out as soon as we have BOTH a tx hash and a terminal state, OR
    // simply on terminal state. A tx hash without terminal state is also
    // good enough for the UI to render the explorer link, so we return
    // early on (txHash && attempt >= 2) to keep the UX snappy.
    if (TERMINAL_STATES.has(state)) {
      break;
    }
    if (txHash && attempt >= 2) {
      break;
    }
  }

  if (state === "FAILED" || state === "DENIED" || state === "CANCELLED") {
    throw new Error(`Circle transfer entered terminal state ${state}`);
  }

  return {
    transactionId,
    txHash,
    state,
    explorerUrl: txHash ? buildExplorerUrl(txHash) : "",
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
