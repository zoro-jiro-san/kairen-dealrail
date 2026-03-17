'use client';

import { useEffect, useState } from 'react';
import { healthCheck, integrationsApi, jobsApi, ProviderCandidate } from '@/lib/api';

type MarketPulsePanelProps = {
  variant?: 'compact' | 'full';
};

type PulseState = {
  backendOnline: boolean;
  chainLabel: string;
  providers: ProviderCandidate[];
  discoverySources: Array<{ id: string; enabled: boolean }>;
  executionProviders: Array<{ id: string; mode: string; useCase: string }>;
  openJobs: number;
};

const initialState: PulseState = {
  backendOnline: false,
  chainLabel: 'Unknown',
  providers: [],
  discoverySources: [],
  executionProviders: [],
  openJobs: 0,
};

function chainName(chainId?: number) {
  if (chainId === 84532) return 'Base Sepolia';
  if (chainId === 11142220) return 'Celo Sepolia';
  return chainId ? `Chain ${chainId}` : 'Unknown';
}

export function MarketPulsePanel({ variant = 'full' }: MarketPulsePanelProps) {
  const [state, setState] = useState<PulseState>(initialState);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [health, providerRes, sourceRes, executionRes, jobsRes] = await Promise.all([
          healthCheck().catch(() => null),
          integrationsApi.listProviders().catch(() => ({ providers: [] })),
          integrationsApi.listDiscoverySources().catch(() => ({ sources: [] })),
          integrationsApi.listExecutionProviders().catch(() => ({ providers: [] })),
          jobsApi.list({ limit: 12 }).catch(() => ({ jobs: [] })),
        ]);

        if (!mounted) return;
        setState({
          backendOnline: !!health,
          chainLabel: chainName(health?.blockchain.chainId),
          providers: providerRes.providers || [],
          discoverySources: sourceRes.sources || [],
          executionProviders: executionRes.providers || [],
          openJobs: (jobsRes.jobs || []).length,
        });
      } catch {
        if (!mounted) return;
        setState(initialState);
      }
    }

    void load();
    const id = window.setInterval(load, 10000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const topProviders = state.providers.slice(0, variant === 'compact' ? 3 : 5);
  const enabledSources = state.discoverySources.filter((source) => source.enabled);
  const mockOnly = state.providers.length > 0 && state.providers.every((provider) => provider.source === 'mock');

  if (variant === 'compact') {
    return (
      <section className="terminal-panel rounded-[1.5rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="terminal-kicker">Supply Snapshot</div>
            <h3 className="mt-2 text-xl font-semibold">What the desk can see right now</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--terminal-muted)]">
              This is the missing piece for the use case: DealRail is useful only when it can see provider supply. This
              board shows whether discovery is live or still in demo/mock posture.
            </p>
          </div>
          <div className={`h-2.5 w-2.5 rounded-full ${state.backendOnline ? 'bg-[var(--terminal-good)]' : 'bg-[var(--terminal-danger)]'}`} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="terminal-metric">
            <div className="terminal-label">Chain</div>
            <div className="mt-1 text-sm font-semibold">{state.chainLabel}</div>
          </div>
          <div className="terminal-metric">
            <div className="terminal-label">Supply Count</div>
            <div className="mt-1 text-sm font-semibold">{state.providers.length}</div>
          </div>
          <div className="terminal-metric">
            <div className="terminal-label">Discovery</div>
            <div className={`mt-1 text-sm font-semibold ${mockOnly ? 'text-[var(--terminal-warn)]' : 'text-[var(--terminal-good)]'}`}>
              {mockOnly ? 'Demo / mock' : 'Mixed / live'}
            </div>
          </div>
          <div className="terminal-metric">
            <div className="terminal-label">Recent Jobs</div>
            <div className="mt-1 text-sm font-semibold">{state.openJobs}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr,0.75fr]">
          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">Visible Supply</div>
            <div className="mt-3 space-y-2">
              {topProviders.length > 0 ? topProviders.map((provider) => (
                <div key={`${provider.source}-${provider.providerAddress}`} className="rounded-xl border border-[var(--terminal-border)] bg-black/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{provider.serviceName}</div>
                    <div className="terminal-chip">{provider.source}</div>
                  </div>
                  <div className="mt-2 text-sm text-[var(--terminal-muted)]">{provider.description || 'No description yet'}</div>
                  <div className="mt-2 text-xs text-[var(--terminal-muted)]">
                    Base {provider.basePriceUsdc ?? 'n/a'} USDC • Rep {provider.reputationScore ?? 'n/a'}
                  </div>
                </div>
              )) : (
                <div className="text-sm text-[var(--terminal-muted)]">No discovery data returned yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">Sources</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {enabledSources.map((source) => (
                <span key={source.id} className="terminal-chip">{source.id}</span>
              ))}
            </div>
            <div className="mt-4 border-t border-[var(--terminal-border)] pt-4 text-sm leading-6 text-[var(--terminal-muted)]">
              If this section stays in `demo / mock`, the next task is not more UI. It is wiring real provider feeds.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="terminal-panel rounded-[1.5rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="terminal-kicker">Market Board</div>
          <h3 className="mt-2 text-xl font-semibold">Supply, sources, and execution posture</h3>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full ${state.backendOnline ? 'bg-[var(--terminal-good)]' : 'bg-[var(--terminal-danger)]'}`} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="terminal-metric">
          <div className="terminal-label">Chain</div>
          <div className="mt-1 text-sm font-semibold">{state.chainLabel}</div>
        </div>
        <div className="terminal-metric">
          <div className="terminal-label">Supply Count</div>
          <div className="mt-1 text-sm font-semibold">{state.providers.length}</div>
        </div>
        <div className="terminal-metric">
          <div className="terminal-label">Discovery</div>
          <div className={`mt-1 text-sm font-semibold ${mockOnly ? 'text-[var(--terminal-warn)]' : 'text-[var(--terminal-good)]'}`}>
            {mockOnly ? 'Demo / mock' : 'Mixed / live'}
          </div>
        </div>
        <div className="terminal-metric">
          <div className="terminal-label">Execution Rails</div>
          <div className="mt-1 text-sm font-semibold">{state.executionProviders.length}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4">
          <div className="terminal-label">Provider Supply</div>
          <div className="mt-3 space-y-2">
            {topProviders.length > 0 ? topProviders.map((provider) => (
              <div key={`${provider.source}-${provider.providerAddress}`} className="rounded-xl border border-[var(--terminal-border)] bg-black/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{provider.serviceName}</div>
                  <div className="terminal-chip">{provider.source}</div>
                </div>
                <div className="mt-2 text-sm text-[var(--terminal-muted)]">{provider.description || 'No description yet'}</div>
                <div className="mt-2 text-xs text-[var(--terminal-muted)]">
                  Base {provider.basePriceUsdc ?? 'n/a'} USDC • Rep {provider.reputationScore ?? 'n/a'} • {provider.erc8004Registered ? 'ERC-8004 verified' : 'Unverified'}
                </div>
              </div>
            )) : (
              <div className="text-sm text-[var(--terminal-muted)]">No provider data returned yet.</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">Discovery Sources</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {enabledSources.map((source) => (
                <span key={source.id} className="terminal-chip">{source.id}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">Execution Rails</div>
            <div className="mt-3 space-y-2">
              {state.executionProviders.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-[var(--terminal-border)] bg-black/10 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{provider.id}</div>
                    <div className="terminal-chip">{provider.mode}</div>
                  </div>
                  <div className="mt-1 text-xs text-[var(--terminal-muted)]">{provider.useCase}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
