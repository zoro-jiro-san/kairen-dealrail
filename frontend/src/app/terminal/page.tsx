'use client';

import { useState } from 'react';
import { HomeCommandTerminal, TerminalAction } from '@/components/HomeCommandTerminal';

const stepMap: Record<string, string[]> = {
  help: ['Read command map', 'Choose a role or rail'],
  doctor: ['Check backend reachability', 'Read discovery and rail posture', 'Choose the next human or agent path'],
  status: ['Check backend health', 'Confirm active chain and escrow'],
  wallet_send: ['Connect wallet if needed', 'Switch to the requested testnet', 'Submit the send transaction', 'Open explorer receipt'],
  swap_preview: ['Read the sample route', 'Keep it labeled as sample', 'Use live wallet sends as the stronger demo proof'],
  start_flow: ['Capture policy', 'Discover supply', 'Run reverse auction', 'Batch and confirm'],
  start_ops: ['Create job', 'Fund escrow', 'Submit deliverable', 'Resolve settlement'],
  open_integrations: ['Choose a settlement rail', 'Configure values', 'Execute or inspect output'],
  market_scan: ['Read discovery sources', 'Compare available agents', 'Choose counterparties'],
  role_buyer: ['Capture budget and delivery terms', 'Scan providers', 'Launch reverse auction'],
  role_provider: ['Prepare service listing', 'Join active auctions', 'Submit winning deliverable'],
  role_evaluator: ['Inspect deliverable', 'Complete or reject', 'Write outcome to reputation rail'],
  clear: ['Reset terminal output'],
  unknown: ['Refine command', 'Use help or role keywords'],
};

export default function TerminalPage() {
  const [lastAction, setLastAction] = useState<TerminalAction | null>(null);

  function handleAction(action: TerminalAction) {
    setLastAction(action);
  }

  const steps = lastAction ? stepMap[lastAction.kind] || ['Command received'] : ['Run your first command in terminal'];

  return (
    <div className="space-y-6">
      <section className="terminal-panel rounded-[1.5rem] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="terminal-kicker">Terminal</div>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Command desk</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--terminal-muted)]">
              Start with `doctor`. Then stay simple: use `services` for the demo path, `vend ...` for procurement, or
              `send ...` when you need a live testnet transaction.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-command">doctor</span>
            <span className="inline-command">services</span>
            <span className="inline-command">send 1 usdc to 0x...</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <HomeCommandTerminal onAction={handleAction} />
        </div>
        <div className="space-y-5 xl:col-span-4">
          <div className="terminal-panel rounded-[1.5rem] p-6">
            <div className="terminal-kicker">Starter Commands</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.1rem] border border-[var(--terminal-border)] bg-black/10 p-4">
                <div className="terminal-label">doctor</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
                  Check backend, chain, and wallet posture first.
                </div>
              </div>
              <div className="rounded-[1.1rem] border border-[var(--terminal-border)] bg-black/10 p-4">
                <div className="terminal-label">services</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
                  Cleanest demo path when you want simple guided supply.
                </div>
              </div>
              <div className="rounded-[1.1rem] border border-[var(--terminal-border)] bg-black/10 p-4">
                <div className="terminal-label">vend ...</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
                  Use when you want the procurement-style request flow.
                </div>
              </div>
              <div className="rounded-[1.1rem] border border-[var(--terminal-border)] bg-black/10 p-4">
                <div className="terminal-label">send ...</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">
                  Strongest live browser proof: a real testnet wallet send.
                </div>
              </div>
            </div>
          </div>

          <div className="terminal-panel rounded-[1.5rem] p-6">
            <div className="terminal-kicker">Last Command</div>
            <div className="mt-4 space-y-3">
              {steps.map((step, idx) => (
                <div key={`${step}-${idx}`} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--terminal-border)] bg-black/15 terminal-mono text-[10px] text-[var(--terminal-accent)]">
                    {idx + 1}
                  </div>
                  <div className="text-[var(--terminal-muted)]">{step}</div>
                </div>
              ))}
            </div>
            {lastAction && (
              <div className="mt-5 rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4 text-xs text-[var(--terminal-muted)]">
                <div className="terminal-label">Last command</div>
                <div className="mt-2 terminal-mono text-[var(--terminal-fg)]">{lastAction.command}</div>
                <div className="mt-1 text-[var(--terminal-good)]">{lastAction.note}</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
