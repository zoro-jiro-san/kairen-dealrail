import assert from 'node:assert/strict';
import test from 'node:test';
import { contractService } from './services/contract.service';
import { discoveryService } from './services/discovery.service';
import { x402nService } from './services/x402n.service';
import { buildRawPrivateKeyRejection } from './index-simple';

test('public chain summaries omit rpc URLs', () => {
  const supportedChains = contractService.listSupportedChains();

  assert.ok(supportedChains.length >= 2);
  for (const chain of supportedChains) {
    assert.equal('rpcUrl' in chain, false);
  }
});

test('raw private key rejection guidance is explicit', () => {
  const rejection = buildRawPrivateKeyRejection('providerPrivateKey');

  assert.match(rejection.error, /Raw private keys are not accepted/i);
  assert.equal(rejection.details.field, 'providerPrivateKey');
  assert.match(rejection.details.guidance, /wallet-based writes/i);
});

test('discovery query returns the mock catalog for the demo automation scenario', async () => {
  const providers = await discoveryService.listProviderCandidates({
    query: 'automation benchmark report',
    minReputation: 700,
    maxBasePriceUsdc: 0.15,
    sources: ['mock'],
  });

  assert.ok(providers.length >= 2);
  const providerAddresses = providers.map((provider) => provider.providerAddress.toLowerCase());
  assert.ok(providerAddresses.includes('0xef9c7e3fea4f54cb3c6c8fa0978a0c8ab8f28fcf'));
  assert.ok(providerAddresses.includes('0x9f2b0f8d8a3f52f8444a9fc4b6c67aaa4a84f26a'));
});

test('mock negotiations are derived from the same discovery catalog', async () => {
  const providers = await discoveryService.listProviderCandidates({
    query: 'automation benchmark report',
    minReputation: 700,
    maxBasePriceUsdc: 0.15,
    sources: ['mock'],
  });
  const providerAddresses = new Set(providers.map((provider) => provider.providerAddress.toLowerCase()));

  const session = await x402nService.createNegotiation({
    serviceRequirement: 'automation benchmark report',
    maxBudgetUsdc: 0.15,
    maxDeliveryHours: 24,
    minReputationScore: 700,
  });

  assert.equal(session.mode, 'mock');
  assert.ok(session.offers.length >= 2);

  for (const offer of session.offers) {
    assert.ok(providerAddresses.has(offer.provider.toLowerCase()));
  }
});
