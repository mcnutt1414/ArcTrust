import assert from 'node:assert/strict';
import { test, mock } from 'node:test';

process.env.CIRCLE_API_KEY = 'security-test-fixture';
process.env.CIRCLE_ENTITY_SECRET = 'security-test-fixture';
process.env.CIRCLE_SENDER_WALLET_ID = 'wallet-fixture';
process.env.CIRCLE_ARC_BLOCKCHAIN = 'ARC-TESTNET';
let chain = 'ARC-TESTNET';
const writes = [];
globalThis.fetch = async () => { throw new Error('Network disabled in wallet regression test'); };
mock.module('@circle-fin/developer-controlled-wallets', { namedExports: {
  initiateDeveloperControlledWalletsClient: () => ({
    getWallet: async ({ id }) => { assert.equal(id, 'wallet-fixture'); return { data: { wallet: { blockchain: chain } } }; },
    createTransaction: async (input) => { writes.push(input); return { data: { id: 'tx-fixture', state: 'COMPLETE' } }; },
    getTransaction: async ({ id }) => { assert.equal(id, 'tx-fixture'); return { data: { transaction: { state: 'COMPLETE', txHash: 'hash-fixture' } } }; },
  }),
} });
const { sendUsdcTransfer } = await import('../src/lib/circle.ts');
test('matching-chain transfer retains wallet, token, amount and reference', async () => {
  const result = await sendUsdcTransfer({ destinationAddress: 'destination-fixture', amountUsdc: 1, refId: 'ref-fixture' });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].walletId, 'wallet-fixture');
  assert.deepEqual(writes[0].amount, ['1']);
  assert.equal(writes[0].destinationAddress, 'destination-fixture');
  assert.equal(writes[0].refId, 'ref-fixture');
  assert.equal(writes[0].tokenAddress, '0x3600000000000000000000000000000000000000');
  assert.equal(writes[0].blockchain, undefined);
  assert.equal(result.state, 'COMPLETE');
});
test('wrong-chain wallet is rejected before a transaction is created', async () => {
  chain = 'ETH'; const before = writes.length;
  await assert.rejects(sendUsdcTransfer({ destinationAddress: 'destination-fixture', amountUsdc: 1 }), /blockchain does not match/);
  assert.equal(writes.length, before);
});
