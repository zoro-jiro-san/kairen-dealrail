'use client';

import { useEffect, useState } from 'react';

type FlowRow = {
  from: string;
  to: string;
  label: string;
  tag: string;
};

const phases: Array<{
  title: string;
  phase: string;
  headline: string;
  desc: string;
  rows: FlowRow[];
}> = [
  {
    title: 'Negotiate',
    phase: 'Discovery',
    headline: 'The desk scans supply before it locks a counterparty.',
    desc: 'A buyer states the job, discovery rails return provider supply, and the desk decides whether there is enough competition to run an auction.',
    rows: [
      { from: 'Buyer', to: 'Desk', label: 'Post outcome, budget, deadline', tag: 'INTENT' },
      { from: 'Desk', to: 'Market', label: 'Scan x402n, imports, live feeds', tag: 'SCAN' },
      { from: 'Market', to: 'Desk', label: 'Return ranked provider supply', tag: 'SUPPLY' },
      { from: 'Desk', to: 'Buyer', label: 'Shortlist + auction posture', tag: 'QUOTE' },
    ],
  },
  {
    title: 'Offer',
    phase: 'Execution',
    headline: 'The winning quote becomes an executable deal, not a chat log.',
    desc: 'Selected terms move into escrow assumptions, evaluator policy, and an explicit settlement rail.',
    rows: [
      { from: 'Buyer', to: 'Desk', label: 'Accept ranked offer or batch', tag: 'SELECT' },
      { from: 'Desk', to: 'Provider', label: 'Lock price and delivery terms', tag: 'LOCK' },
      { from: 'Desk', to: 'Escrow', label: 'Create job + fund settlement path', tag: 'ESCROW' },
      { from: 'Provider', to: 'Desk', label: 'Submit deliverable and proof', tag: 'SUBMIT' },
    ],
  },
  {
    title: 'Receipt',
    phase: 'Verification',
    headline: 'Verification produces a receipt, payout, or refund.',
    desc: 'The evaluator decides whether the output clears. Settlement and reputation writes become visible evidence for agents and operators.',
    rows: [
      { from: 'Evaluator', to: 'Desk', label: 'Verify output against the scope', tag: 'REVIEW' },
      { from: 'Desk', to: 'Escrow', label: 'Release payout or trigger refund', tag: 'SETTLE' },
      { from: 'Escrow', to: 'Desk', label: 'Emit onchain status and tx hash', tag: 'CHAIN' },
      { from: 'Desk', to: 'Buyer', label: 'Return receipt and final record', tag: 'RECEIPT' },
    ],
  },
];

const lanes = [
  { role: 'Buyer', sub: 'Demand', color: 'var(--terminal-accent)' },
  { role: 'Market', sub: 'Supply', color: 'var(--terminal-ice)' },
  { role: 'Provider', sub: 'Offer', color: 'var(--terminal-warn)' },
  { role: 'Escrow', sub: 'Settlement', color: 'var(--terminal-good)' },
  { role: 'Evaluator', sub: 'Receipt', color: 'var(--terminal-danger)' },
];

export function HeroFlowArchitecture() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhaseIndex((current) => (current + 1) % phases.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const phase = phases[phaseIndex];

  return (
    <section className="hero-grid terminal-panel rounded-[1.75rem] p-6 md:p-8">
      <div className="relative z-10 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="terminal-kicker">Protocol Flow</div>
          <h2 className="mt-2 text-2xl font-semibold">One desk from scan to receipt</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--terminal-muted)]">
            Referenced from the local `x402n` protocol flow pattern, but adapted for DealRail: discover supply, lock an
            offer, settle with escrow, and emit a receipt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {phases.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setPhaseIndex(idx)}
              className={`terminal-chip transition ${
                idx === phaseIndex ? 'border-[var(--terminal-accent)] text-[var(--terminal-accent)]' : ''
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="terminal-frame relative z-10 overflow-hidden rounded-[1.5rem]">
        <div className="h-[2px] bg-[color:var(--terminal-border)]">
          <div
            className="h-full bg-[linear-gradient(90deg,var(--terminal-accent),var(--terminal-ice))] transition-all duration-700"
            style={{ width: `${((phaseIndex + 1) / phases.length) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-light text-[color:color-mix(in_srgb,var(--terminal-accent)_24%,transparent)]">
                  0{phaseIndex + 1}
                </div>
                <div>
                  <div className="text-lg font-semibold text-[var(--terminal-accent)]">{phase.title}</div>
                  <div className="terminal-label mt-1">{phase.phase}</div>
                </div>
              </div>
              <div className="mt-4 max-w-3xl text-lg font-medium">{phase.headline}</div>
              <div className="mt-2 max-w-3xl text-sm leading-6 text-[var(--terminal-muted)]">{phase.desc}</div>
            </div>

            <div className="terminal-chip">{phaseIndex === phases.length - 1 ? 'Receipt live' : 'Flow live'}</div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-5">
            {lanes.map((lane) => {
              const active = phase.rows.some((row) => row.from === lane.role || row.to === lane.role);
              return (
                <div
                  key={lane.role}
                  className={`rounded-xl border px-3 py-3 transition ${
                    active ? 'border-[var(--terminal-accent)]/45 bg-[var(--terminal-accent)]/8' : 'border-[var(--terminal-border)] bg-black/10'
                  }`}
                >
                  <div className="text-xs font-medium" style={{ color: active ? lane.color : 'var(--terminal-muted)' }}>
                    {lane.role}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--terminal-muted)]">{lane.sub}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 min-h-[228px] space-y-2">
            {phase.rows.map((row, index) => (
              <div
                key={`${phase.title}-${row.label}`}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
                  index <= phaseIndex + 1
                    ? 'border-[var(--terminal-accent)]/25 bg-[var(--terminal-accent)]/6 opacity-100'
                    : 'border-[var(--terminal-border)] bg-black/8 opacity-50'
                }`}
              >
                <div className="terminal-mono min-w-[50px] text-[11px] text-[var(--terminal-muted)]">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="min-w-[64px] text-xs text-[var(--terminal-accent)]">{row.from}</div>
                <div className="text-xs text-[var(--terminal-muted)]">→</div>
                <div className="min-w-[70px] text-xs text-[var(--terminal-ice)]">{row.to}</div>
                <div className="flex-1 text-sm text-[var(--terminal-fg)]">{row.label}</div>
                <div className="terminal-chip">{row.tag}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--terminal-border)] pt-4">
            <div className="flex gap-2">
              {phases.map((item, idx) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setPhaseIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === phaseIndex
                      ? 'w-9 bg-[linear-gradient(90deg,var(--terminal-accent),var(--terminal-ice))]'
                      : idx < phaseIndex
                        ? 'w-4 bg-[var(--terminal-accent)]/45'
                        : 'w-4 bg-[var(--terminal-border)]'
                  }`}
                  aria-label={`Show ${item.title}`}
                />
              ))}
            </div>
            <div className="terminal-label">Auto-rotating flow map</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="terminal-panel rounded-[1.35rem] p-5">
          <div className="terminal-kicker">Client Side</div>
          <div className="mt-3 text-sm leading-6 text-[var(--terminal-muted)]">
            State the outcome and let the desk test whether there is enough market depth to negotiate.
          </div>
        </div>
        <div className="terminal-panel rounded-[1.35rem] p-5">
          <div className="terminal-kicker">Provider Side</div>
          <div className="mt-3 text-sm leading-6 text-[var(--terminal-muted)]">
            Bring supply into the desk, quote against live demand, and only settle after terms are locked.
          </div>
        </div>
        <div className="terminal-panel rounded-[1.35rem] p-5">
          <div className="terminal-kicker">Receipt Side</div>
          <div className="mt-3 text-sm leading-6 text-[var(--terminal-muted)]">
            Evaluator output closes the loop: payout if valid, refund if not, and a receipt either way.
          </div>
        </div>
      </div>
    </section>
  );
}
