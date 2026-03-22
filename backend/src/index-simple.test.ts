import test from 'node:test';
import assert from 'node:assert/strict';
import { contractService } from './services/contract.service';
import { buildRawPrivateKeyRejection } from './index-simple';
import { discoveryService } from './services/discovery.service';
import { x402nService } from './services/x402n.service';

test('public chain summaries omit rpc URLs', () => {
  const chains = contractService.listSupportedChains();
  assert.ok(chains.length >= 2);

  for (const chain of chains) {
    assert.equal(Object.prototype.hasOwnProperty.call(chain, 'rpcUrl'), false);
    assert.ok(chain.chain === 'baseSepolia' || chain.chain === 'celoSepolia');
    assert.ok(typeof chain.escrowAddress === 'string' && chain.escrowAddress.startsWith('0x'));
  }
});

test('raw private key fields are explicitly rejected', () => {
  const rejection = buildRawPrivateKeyRejection('providerPrivateKey');
  assert.match(String(rejection.error), /providerPrivateKey/);
  assert.equal(rejection.executionMode, 'managed_demo_signer');
  assert.match(String(rejection.guidance), /browser wallet path|agent wallet path/i);
});

test('discovery returns curated demo supply for automation benchmark queries', async () => {
  const providers = await discoveryService.listProviderCandidates({
    query: 'automation benchmark report',
    sources: ['mock', 'imported'],
  });

  assert.ok(providers.length >= 2);
  assert.ok(providers.some((provider) => /benchmark/i.test(provider.serviceName)));
  assert.ok(providers.every((provider) => provider.source === 'mock' || provider.source === 'imported'));
});

test('mock negotiations are ranked from the same discovery catalog', async () => {
  const providers = await discoveryService.listProviderCandidates({
    query: 'automation benchmark report',
    sources: ['mock', 'imported'],
  });
  const providerAddresses = new Set(providers.map((provider) => provider.providerAddress.toLowerCase()));

  const session = await x402nService.createNegotiation({
    serviceRequirement: 'automation benchmark report',
    maxBudgetUsdc: 0.2,
    maxDeliveryHours: 24,
    minReputationScore: 700,
    networkMode: 'testnet',
  });

  assert.ok(session.offers.length >= 1);
  for (const offer of session.offers) {
    assert.ok(providerAddresses.has(offer.provider.toLowerCase()));
  }
});
