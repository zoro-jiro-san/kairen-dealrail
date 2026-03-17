'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { healthCheck, HealthCheckResponse } from '@/lib/api';
import { HeroFlowArchitecture } from '@/components/HeroFlowArchitecture';
import { HomeCommandTerminal } from '@/components/HomeCommandTerminal';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const heroWords = ['agent buyers', 'provider supply', 'live offers', 'escrow receipts', 'autonomous deals'];

  useEffect(() => {
    void (async () => {
      try {
        setHealth(await healthCheck());
      } catch {
        setHealth(null);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroWordIndex((current) => (current + 1) % heroWords.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [heroWords.length]);

  const chainLabel = health?.blockchain.chainId === 11142220
    ? 'Celo Sepolia'
    : health?.blockchain.chainId === 84532
      ? 'Base Sepolia'
      : health?.blockchain.chainId
        ? `Chain ${health.blockchain.chainId}`
        : 'Unknown';

  return (
    <div className="space-y-8">
      <section className="hero-grid terminal-panel rounded-[2rem] px-6 py-8 md:px-8 md:py-10">
        <div className="relative z-10 grid grid-cols-1 gap-10 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="terminal-kicker">Home</div>
            <h1 className="mt-4 max-w-5xl text-4xl font-semibold leading-[0.98] md:text-6xl">
              <span className="text-[var(--terminal-muted)]">Service commerce for</span>
              <br />
              <span className="hero-word-window mt-3 inline-flex min-h-[1.15em] items-center">
                <span key={heroWords[heroWordIndex]} className="hero-word-item text-[var(--terminal-accent)]">
                  {heroWords[heroWordIndex].toUpperCase()}
                </span>
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--terminal-muted)]">
              DealRail is the desk between service marketplaces and escrow. Buyers scan provider supply, providers
              respond with quotes, evaluators verify output, and the desk leaves a machine-readable receipt.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {heroWords.map((word, index) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => setHeroWordIndex(index)}
                  className={`terminal-chip transition ${
                    index === heroWordIndex ? 'border-[var(--terminal-accent)] text-[var(--terminal-accent)]' : ''
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/terminal" className="terminal-btn terminal-btn-accent">
                Open Terminal Desk
              </Link>
              <Link href="/dashboard" className="terminal-btn">
                Watch Market Board
              </Link>
              <Link href="/docs" className="terminal-btn">
                Read Docs
              </Link>
            </div>
            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-3">
              <div className="terminal-metric">
                <div className="terminal-label">Use It For</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
                  Multi-offer service buying where agents need price discovery and a refund path.
                </div>
              </div>
              <div className="terminal-metric">
                <div className="terminal-label">Supply Comes From</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
                  x402n listings, imported provider feeds, and demo fallback until live discovery is connected.
                </div>
              </div>
              <div className="terminal-metric">
                <div className="terminal-label">Outcome</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
                  Deal confirmation, escrow settlement, evaluator decision, and a saved receipt trail.
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-[1.5rem] border border-[var(--terminal-border)] bg-black/10 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="terminal-kicker">Session</div>
                  <div className="mt-2 text-lg font-semibold">Live posture</div>
                </div>
                <div className="terminal-chip">
                  {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Wallet offline'}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="terminal-metric">
                  <div className="terminal-label">Backend</div>
                  <div className={`mt-1 text-sm font-semibold ${health ? 'text-[var(--terminal-good)]' : 'text-[var(--terminal-danger)]'}`}>
                    {health ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div className="terminal-metric">
                  <div className="terminal-label">Chain</div>
                  <div className="mt-1 text-sm font-semibold">{chainLabel}</div>
                </div>
                <div className="terminal-metric">
                  <div className="terminal-label">Negotiation</div>
                  <div className="mt-1 text-sm font-semibold">
                    {health?.integrations?.x402nMockMode ? 'Demo feed' : 'Live feed'}
                  </div>
                </div>
                <div className="terminal-metric">
                  <div className="terminal-label">Flow</div>
                  <div className="mt-1 text-sm font-semibold">Scan {'->'} bid {'->'} settle</div>
                </div>
                <div className="terminal-metric col-span-2">
                  <div className="terminal-label">Escrow rail</div>
                  <div className="mt-1 terminal-mono text-xs text-[var(--terminal-muted)]">
                    {health?.blockchain.escrowAddress || 'Unavailable'}
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4">
                <div className="terminal-label">When To Use</div>
                <div className="mt-2 text-sm text-[var(--terminal-muted)]">
                  Use DealRail when you do not know the winning provider yet and need the market to tell you.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HeroFlowArchitecture />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <HomeCommandTerminal compact />
        </div>
        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-4">
          <div className="terminal-kicker">How To Start</div>
          <h2 className="mt-2 text-2xl font-semibold">Start with one verb</h2>
          <div className="mt-5 space-y-5 text-sm leading-6 text-[var(--terminal-muted)]">
            <div>
              <div className="terminal-label">`scan`</div>
              See what provider supply is available right now for a category or task.
            </div>
            <div>
              <div className="terminal-label">`buy`</div>
              Tell the desk the outcome, budget, and deadline. It shortlists offers and stages an auction.
            </div>
            <div>
              <div className="terminal-label">`sell`</div>
              Tell the desk what service you provide. It explains how to register or import your supply.
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/terminal" className="terminal-btn terminal-btn-accent">
              Full Terminal
            </Link>
            <Link href="/docs" className="terminal-btn">
              Usage Docs
            </Link>
            <Link href="/integrations" className="terminal-btn">
              Rails
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
