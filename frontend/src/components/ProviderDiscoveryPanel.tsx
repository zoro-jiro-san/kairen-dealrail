'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage, integrationsApi, ProviderCandidate } from '@/lib/api';

const INITIAL_MIN_REPUTATION = '700';
const INITIAL_MAX_BASE_PRICE = '0.2';
const INITIAL_SOURCES = ['x402n', 'mock'];

export function ProviderDiscoveryPanel() {
  const [providers, setProviders] = useState<ProviderCandidate[]>([]);
  const [query, setQuery] = useState('');
  const [minReputation, setMinReputation] = useState(INITIAL_MIN_REPUTATION);
  const [maxBasePrice, setMaxBasePrice] = useState(INITIAL_MAX_BASE_PRICE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>(INITIAL_SOURCES);
  const [availableSources, setAvailableSources] = useState<Array<{ id: string; enabled: boolean }>>([]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const [providersRes, sourcesRes] = await Promise.all([
          integrationsApi.listProviders({
            query: undefined,
            minReputation: Number(INITIAL_MIN_REPUTATION),
            maxBasePriceUsdc: Number(INITIAL_MAX_BASE_PRICE),
            sources: INITIAL_SOURCES.join(','),
          }),
          integrationsApi.listDiscoverySources(),
        ]);

        setProviders(providersRes.providers);
        setAvailableSources(sourcesRes.sources);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadProviders() {
    setLoading(true);
    setError(null);
    try {
      const res = await integrationsApi.listProviders({
        query: query || undefined,
        minReputation: Number(minReputation),
        maxBasePriceUsdc: Number(maxBasePrice),
        sources: sources.join(','),
      });
      setProviders(res.providers);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function toggleSource(sourceId: string) {
    setSources((prev) =>
      prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]
    );
  }

  function selectProvider(provider: ProviderCandidate) {
    localStorage.setItem('dealrail.prefProvider', provider.providerAddress);
    localStorage.setItem('dealrail.prefEvaluator', provider.evaluatorAddress);
  }

  return (
    <section className="terminal-panel rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Find Providers (Discovery Layer)</h2>
        <p className="mt-1 text-sm text-[var(--terminal-muted)]">
          Use this before negotiation. It sources candidates from x402n and ERC-8004-compatible reputation signals.
        </p>
        <p className="mt-1 text-xs text-[var(--terminal-muted)]">
          Use when you need counterparties. Do not use as final trust decision without evaluator checks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="text-xs text-[var(--terminal-muted)]">
          Capability query
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. benchmark report, ML eval" className="terminal-input mt-1" />
        </label>
        <label className="text-xs text-[var(--terminal-muted)]">
          Minimum reputation score
          <input value={minReputation} onChange={(e) => setMinReputation(e.target.value)} placeholder="700" className="terminal-input mt-1" />
        </label>
        <label className="text-xs text-[var(--terminal-muted)]">
          Max base price (USDC)
          <input value={maxBasePrice} onChange={(e) => setMaxBasePrice(e.target.value)} placeholder="0.20" className="terminal-input mt-1" />
        </label>
        <button onClick={loadProviders} disabled={loading} className="terminal-btn terminal-btn-accent mt-5">
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {availableSources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSources.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleSource(s.id)}
              disabled={!s.enabled}
              className={`terminal-mono text-xs px-2 py-1 rounded border ${
                sources.includes(s.id)
                  ? 'border-[var(--terminal-accent)] bg-[var(--terminal-accent)]/15 text-[var(--terminal-accent)]'
                  : 'border-[var(--terminal-border)] bg-black/20 text-[var(--terminal-muted)]'
              } disabled:opacity-40`}
            >
              {s.id}
            </button>
          ))}
        </div>
      )}

      {error && <div className="rounded border p-3 text-sm text-[var(--terminal-danger)]" style={{ borderColor: 'color-mix(in srgb, var(--terminal-danger) 50%, transparent)', background: 'color-mix(in srgb, var(--terminal-danger) 10%, transparent)' }}>{error}</div>}

      <div className="space-y-2">
        {providers.map((p) => (
          <div key={`${p.source}-${p.providerAddress}-${p.serviceId || 'none'}`} className="rounded border border-[var(--terminal-border)] bg-black/15 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <div className="font-medium">{p.serviceName}</div>
              <div className="text-xs text-[var(--terminal-muted)]">{p.description || 'No description'}</div>
              <div className="terminal-mono text-xs text-[var(--terminal-muted)]">
                Provider: {p.providerAddress} | Eval: {p.evaluatorAddress}
              </div>
              <div className="text-xs text-[var(--terminal-muted)]">
                Source: {p.source} | Reputation: {p.reputationScore ?? 'n/a'} | Base Price: {p.basePriceUsdc ?? 'n/a'} USDC
              </div>
              <div className="text-xs text-[var(--terminal-muted)]">
                ERC-8004: {p.erc8004Registered ? `registered (agentId: ${p.erc8004AgentId})` : 'not found'}
              </div>
            </div>
            <button
              onClick={() => selectProvider(p)}
              className="terminal-btn terminal-btn-good"
            >
              Set For Create Job
            </button>
          </div>
        ))}
        {!loading && providers.length === 0 && (
          <div className="text-sm text-[var(--terminal-muted)]">No providers matched current filters.</div>
        )}
      </div>
    </section>
  );
}
