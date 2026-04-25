# ArcTrust — Circle integration

This is the operator-facing runbook for the on-chain piece of ArcTrust:
real USDC nanopayments on Arc testnet via Circle's Developer Wallets API.

## 0. Prerequisites

In `.env.local` (already symlinked into this worktree):

```
CIRCLE_API_KEY=...           # from console.circle.com (sandbox key)
CIRCLE_ENTITY_SECRET=...     # 32-byte hex secret you registered with Circle

NEXT_PUBLIC_SUPABASE_URL=https://hexawkjtzoofwvjyujjg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The other `CIRCLE_*` variables are populated by the bootstrap step below.

If you have not yet registered an entity secret, generate and register one
once with the helpers exported by `@circle-fin/developer-controlled-wallets`
(`generateEntitySecret` + `registerEntitySecretCiphertext`). Save the
recovery file; it cannot be regenerated.

## 1. Bootstrap wallets

This creates a Circle wallet set named "ArcTrust", then two EOA wallets on
Arc testnet — `sender` (pays USDC) and `arctrust-provider` (receives USDC).

Two equivalent ways to run it:

### Option A — standalone script (recommended for first run)

```bash
npx tsx scripts/circle-bootstrap.ts
```

### Option B — HTTP endpoint (after `npm run dev`)

```bash
curl -X POST http://localhost:3000/api/wallet/bootstrap
```

Either way, the output looks like:

```
==== ArcTrust Circle Bootstrap ====
CIRCLE_WALLET_SET_ID=...
CIRCLE_SENDER_WALLET_ID=...
CIRCLE_SENDER_WALLET_ADDRESS=0x...
CIRCLE_PROVIDER_WALLET_ID=...
CIRCLE_PROVIDER_WALLET_ADDRESS=0x...
CIRCLE_ARC_BLOCKCHAIN=ARC-TESTNET
Faucet:
  Visit https://faucet.circle.com, select Arc Testnet, paste this sender address: 0x...
===================================
```

**Copy every line above (except the header/Faucet text) into `.env.local`.**
The bootstrap is idempotent on already-populated values — re-running will
reuse anything you have already set.

## 2. Fund the sender wallet from the faucet

1. Open https://faucet.circle.com
2. Select **Arc Testnet** as the network
3. Paste the `CIRCLE_SENDER_WALLET_ADDRESS` value
4. Request USDC (limit: 10 USDC/hour) **and** native ARC for gas
5. Wait ~30s, then check the balance via the explorer
   (`https://testnet.arcscan.app/address/0x...`)

A nanopayment of `0.0001` USDC requires both USDC balance and a tiny amount
of native gas; the faucet typically issues both.

## 3. Apply the Supabase migration

Either via the Supabase MCP / dashboard:

```sql
-- supabase/migrations/0001_purchases.sql
```

Or with `psql`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_purchases.sql
```

The migration creates `public.purchases`, indexes on `provider_id` and
`created_at`, and a permissive read-only RLS policy. Inserts are performed
by the Next.js server route using `SUPABASE_SERVICE_ROLE_KEY`, which
bypasses RLS.

## 4. Smoke-test the purchase flow

```bash
curl -X POST http://localhost:3000/api/purchase \
  -H 'content-type: application/json' \
  -d '{"providerId":"demo","tierUnits":1,"amountUsdc":0.0001}'
```

Expected response:

```json
{
  "txHash": "0x...",
  "explorerUrl": "https://testnet.arcscan.app/tx/0x...",
  "amountUsdc": 0.0001,
  "timestamp": "2026-...",
  "providerId": "demo",
  "tierUnits": 1
}
```

Click `explorerUrl` to confirm the transfer landed on Arc testnet.

## Reference values used

| Setting | Value | Notes |
| --- | --- | --- |
| Blockchain id | `ARC-TESTNET` | passed as a string; not yet present in the SDK's TS enum (v7.1.0) but accepted by the Circle API |
| USDC token address | `0x3600000000000000000000000000000000000000` | from Circle's Arc quickstart |
| Explorer base | `https://testnet.arcscan.app` | Blockscout-hosted; tx pages live at `/tx/<hash>` |
| Fee level | `MEDIUM` | configurable in `src/lib/circle.ts` |

## Troubleshooting

- **`CIRCLE_API_KEY is not set`** — fill it into `.env.local` and restart `next dev`.
- **`CIRCLE_SENDER_WALLET_ID is not set`** — re-run the bootstrap step.
- **`Transfer accepted ... but no tx hash within polling window`** — Arc was
  slow this round; rerun. The SDK created the transaction; you can also
  look it up by id in the Circle console.
- **`Circle transfer entered terminal state FAILED`** — check that the
  sender wallet has both USDC and native ARC for gas via the faucet.
