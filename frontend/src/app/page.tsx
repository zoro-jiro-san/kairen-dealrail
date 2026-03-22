'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { healthCheck, HealthCheckResponse } from '@/lib/api';
import { HomeCommandTerminal } from '@/components/HomeCommandTerminal';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setHealth(await healthCheck());
      } catch {
        setHealth(null);
      }
    })();
  }, []);

  const chainLabel = health?.blockchain.chainId === 11142220
    ? 'Celo Sepolia'
    : health?.blockchain.chainId === 84532
      ? 'Base Sepolia'
      : health?.blockchain.chainId
        ? `Chain ${health.blockchain.chainId}`
        : 'Unknown';
  const walletLabel = useMemo(() => {
    if (!isConnected || !address) return 'Wallet optional';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address, isConnected]);

  return (
    <div className="space-y-6">
      <section className="hero-grid editorial-card px-6 py-8 md:px-8 md:py-10">
        <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr,0.92fr]">
          <div className="flex flex-col justify-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="terminal-kicker">Kairen / DealRail</span>
                <span className="terminal-chip">Simple deal desk</span>
              </div>
              <h1 className="hero-display mt-5 max-w-4xl text-5xl md:text-6xl">
                Find a provider.
                <br />
                Lock terms.
                <br />
                Settle cleanly.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--terminal-muted)]">
                DealRail is for service deals that need clear steps: discover, agree, settle, and keep a visible
                receipt. Start guided in docs or jump straight into the full terminal when you already know the flow.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="terminal-chip">{health ? 'Backend online' : 'Backend offline'}</span>
                <span className="terminal-chip">{chainLabel}</span>
                <span className="terminal-chip">{walletLabel}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/docs" className="terminal-btn terminal-btn-accent">
                  Start Guided
                </Link>
                <Link href="/terminal" className="terminal-btn terminal-btn-accent">
                  Open Terminal
                </Link>
                <Link href="/dashboard" className="terminal-btn">
                  View Jobs
                </Link>
                <Link href="/base" className="terminal-btn">
                  Base Directory
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-command">doctor</span>
                <span className="inline-command">services</span>
                <span className="inline-command">send 1 usdc to 0x...</span>
              </div>
            </div>
          </div>

          <div className="xl:pl-4">
            <HomeCommandTerminal compact />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">Guided Start</div>
          <div className="mt-3 text-2xl font-semibold">Use docs first</div>
          <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
            Best for humans. Read the short operating path, choose the lane, then move into terminal or jobs only when needed.
          </div>
          <div className="mt-4">
            <Link href="/docs" className="terminal-command">
              open /docs
            </Link>
          </div>
        </div>
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">Terminal</div>
          <div className="mt-3 text-2xl font-semibold">Use the full desk</div>
          <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
            Best when you already know the commands. `doctor` first, then `services`, `vend`, or a live wallet send.
          </div>
          <div className="mt-4">
            <Link href="/terminal" className="terminal-command">
              open /terminal
            </Link>
          </div>
        </div>
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">Proof</div>
          <div className="mt-3 text-2xl font-semibold">Read the live record</div>
          <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
            Keep the proof layer narrow: live jobs, Base directory status, and the receipt surfaces that are already running.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard" className="terminal-command">
              open /dashboard
            </Link>
            <Link href="/base" className="terminal-command">
              open /base
            </Link>
          </div>
        </div>
      </section>

      <section className="terminal-panel rounded-[1.5rem] p-6">
        <div className="terminal-kicker">Simple Path</div>
        <h2 className="mt-3 text-3xl font-semibold">Start with one honest flow</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[1.2rem] border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">1. Check posture</div>
            <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
              Run `doctor` so you know the backend, chain, and wallet state before doing anything else.
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">2. Pick the path</div>
            <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
              Use `services` for the clean demo path or `vend ...` when you want the procurement-style flow.
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">3. Show proof</div>
            <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
              Use a live wallet send or the jobs board when you need a concrete transaction or receipt.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
