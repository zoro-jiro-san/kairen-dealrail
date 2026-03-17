'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage, integrationsApi, ProviderCandidate } from '@/lib/api';

export function ProviderDiscoveryPanel() {
  const [providers, setProviders] = useState<ProviderCandidate[]>([]);
  const [query, setQuery] = useState('');
  const [minReputation, setMinReputation] = useState('700');
  const [maxBasePrice, setMaxBasePrice] = useState('0.2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    setLoading(true);
    setError(null);
    try {
      const res = await integrationsApi.listProviders({
        query: query || undefined,
        minReputation: Number(minReputation),
        maxBasePriceUsdc: Number(maxBasePrice),
      });
      setProviders(res.providers);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function selectProvider(provider: ProviderCandidate) {
    localStorage.setItem('dealrail.prefProvider', provider.providerAddress);
    localStorage.setItem('dealrail.prefEvaluator', provider.evaluatorAddress);
  }

  return (
    <section className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Find Providers (Discovery Layer)</h2>
        <p className="text-sm text-gray-400 mt-1">
          Use this before negotiation. It sources candidates from x402n and ERC-8004-compatible reputation signals.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Use when you need counterparties. Do not use as final trust decision without evaluator checks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Capability query" className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white" />
        <input value={minReputation} onChange={(e) => setMinReputation(e.target.value)} placeholder="Min reputation" className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white" />
        <input value={maxBasePrice} onChange={(e) => setMaxBasePrice(e.target.value)} placeholder="Max base price USDC" className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white" />
        <button onClick={loadProviders} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded px-3 py-2">
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <div className="space-y-2">
        {providers.map((p) => (
          <div key={`${p.source}-${p.providerAddress}-${p.serviceId || 'none'}`} className="bg-gray-900/40 border border-gray-700 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <div className="text-white font-medium">{p.serviceName}</div>
              <div className="text-xs text-gray-400">{p.description || 'No description'}</div>
              <div className="text-xs text-gray-300 font-mono">
                Provider: {p.providerAddress} | Eval: {p.evaluatorAddress}
              </div>
              <div className="text-xs text-gray-400">
                Source: {p.source} | Reputation: {p.reputationScore ?? 'n/a'} | Base Price: {p.basePriceUsdc ?? 'n/a'} USDC
              </div>
              <div className="text-xs text-gray-500">
                ERC-8004: {p.erc8004Registered ? `registered (agentId: ${p.erc8004AgentId})` : 'not found'}
              </div>
            </div>
            <button
              onClick={() => selectProvider(p)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-2 text-sm"
            >
              Set For Create Job
            </button>
          </div>
        ))}
        {!loading && providers.length === 0 && (
          <div className="text-sm text-gray-400">No providers matched current filters.</div>
        )}
      </div>
    </section>
  );
}
