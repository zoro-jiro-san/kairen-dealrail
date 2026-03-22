'use client';

import Link from 'next/link';
import { useState } from 'react';

const OPERATOR_MODE_KEY = 'dealrail.operatorMode';

const operatorGuides = [
  {
    role: 'Human Operator',
    summary: 'Use the browser desk or CLI when you want guided discovery, visible workflow, and a clean receipt trail for a real service deal.',
    steps: ['Open the browser desk or run `dealrail help`', 'Run `doctor` to confirm backend and rails', 'Type the task, budget, and deadline', 'Scan providers and compare offers', 'Choose machine payment or escrow posture', 'Review evaluator outcome and receipt'],
  },
  {
    role: 'Agent Runtime',
    summary: 'Use the npm package when you need stable JSON, lightweight install, and an operator surface that another service can call directly.',
    steps: ['Install `@kairenxyz/dealrail` or run it with `npx`', 'Run `doctor --json`', 'Use `status --json`, `vend --json`, and `jobs --json`', 'Parse receipt and settlement payloads', 'Escalate to browser desk only when a human review is needed'],
  },
  {
    role: 'Evaluator / Reviewer',
    summary: 'Use DealRail when the service needs an explicit verification step before payout and a rejection path must stay visible.',
    steps: ['Inspect scope and submitted output', 'Confirm whether the result matches the task', 'Approve or reject the job', 'Write the outcome into the receipt trail', 'Let the next operator reuse the recorded evidence'],
  },
];

const lifecycle = [
  { title: '1. Intent', desc: 'The first step defines role, budget, deadline, and the outcome the desk should purchase.' },
  { title: '2. Scan', desc: 'Discovery and competition rails surface providers, pricing posture, and trust context.' },
  { title: '3. Offer', desc: 'One or more candidate offers are formed, ranked, and narrowed into a committed posture.' },
  { title: '4. Execution Choice', desc: 'The system chooses immediate machine payment or an escrow-backed service workflow.' },
  { title: '5. Settlement', desc: 'Escrow tracks fund, submit, complete, and reject states onchain when the deal is committed.' },
  { title: '6. Receipt', desc: 'The CLI and browser desk preserve payout, reject, and trust outcomes as reusable evidence.' },
];

const architectureColumns = [
  {
    title: 'Entry Surfaces',
    kicker: 'Human + agent',
    points: ['Browser desk for guided operation', 'Published npm CLI for terminal-native use', 'Stable `--json` mode for agents', 'One product, multiple entry paths'],
  },
  {
    title: 'Coordination Layer',
    kicker: 'Frontend + backend',
    points: ['UI captures intent and role', 'Backend ranks offers and tracks lifecycle', 'Discovery and competition shape the shortlist', 'Integrations workbench prepares downstream rails'],
  },
  {
    title: 'Payment Layer',
    kicker: 'Immediate or committed',
    points: ['Machine payments for immediate calls', 'EscrowRail for scoped service deals', 'Backend chooses the right posture', 'Receipts stay consistent across both'],
  },
  {
    title: 'Settlement Layer',
    kicker: 'Onchain execution',
    points: ['EscrowRail creates jobs', 'Stable tokens fund escrow', 'Deliverables move state forward', 'Completion or rejection resolves value flow'],
  },
  {
    title: 'Trust Layer',
    kicker: 'ERC-8004 loop',
    points: ['Verifier resolves identity', 'Hook can block unsafe actions', 'Settlement can update reputation', 'Trust data becomes reusable for the next deal'],
  },
];

const rails = [
  { label: 'Competition', detail: 'ranked offers, counter rounds, and provider selection' },
  { label: 'Operator Package', detail: 'published npm package `@kairenxyz/dealrail` with human and agent modes' },
  { label: 'Machine Payments', detail: 'Ethereum-native adapter surface for immediate paid calls, currently x402-first' },
  { label: 'Escrow', detail: 'ERC-8183-style lifecycle on Base Sepolia and Celo Sepolia' },
  { label: 'Trust', detail: 'ERC-8004 verifier plus reputation hook callbacks' },
  { label: 'Extensions', detail: 'Machine payments, delegation, Uniswap, and payout adapter surfaces' },
];

const signalFlow = [
  { title: 'Signal 01', body: 'Intent becomes a structured request with budget, deadline, role model, and execution constraints.' },
  { title: 'Signal 02', body: 'Discovery and competition narrow the market to providers that can actually execute.' },
  { title: 'Signal 03', body: 'The backend decides whether the deal should stay as a machine-paid call or move into escrow.' },
  { title: 'Signal 04', body: 'Evaluation finalizes the deal and lets receipt and trust data feed back into the next coordination loop.' },
];

const installLanes = [
  {
    title: 'Browser Path',
    kicker: 'Guided',
    command: 'frontend desk',
    body: 'Open the docs and terminal pages when you want the visual explanation, terminal replay, and guided actions in one place.',
  },
  {
    title: 'Human CLI Path',
    kicker: 'Terminal',
    command: 'npx @kairenxyz/dealrail doctor',
    body: 'Use the ASCII deck when you want a short terminal workflow without wiring custom code.',
  },
  {
    title: 'Agent Path',
    kicker: 'JSON',
    command: 'npx @kairenxyz/dealrail doctor --json',
    body: 'Use JSON mode when another agent or service needs a stable preflight and settlement surface.',
  },
];

const packageCommands = [
  'npx @kairenxyz/dealrail help',
  'npx @kairenxyz/dealrail doctor --json',
  'npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json',
  'npm install -g @kairenxyz/dealrail',
];

const truthStatus = [
  { label: 'Live now', detail: 'npm package, browser desk, CLI, backend lifecycle API, Base Sepolia and Celo Sepolia escrow flows' },
  { label: 'Partial', detail: 'competition posture, discovery supply, x402 paid proof, and Locus payout proof remain mock-first or under-evidenced' },
];

const modeSwitch = {
  human: {
    label: 'Human Mode',
    kicker: 'Guided',
    command: 'Open /docs or /terminal',
    summary: 'Use this when a person wants guided navigation, visible state, and explicit wallet review before settlement steps.',
    steps: [
      'Start in the browser desk or docs surface.',
      'Run `doctor`, then `services`, then the deal or job flow.',
      'Use `/base` only when the Base-facing public service surface matters.',
      'Escalate to wallet signing only for the exact chain and role that owns the action.',
    ],
  },
  agent: {
    label: 'Agent Mode',
    kicker: 'Deterministic',
    command: 'npx @kairenxyz/dealrail services --json',
    summary: 'Use this when another runtime needs stable JSON, feature-specific skills, and an explicit map of what DealRail can do.',
    steps: [
      'Read `/SKILL.md` first for routing.',
      'Run `doctor --json`, `services --json`, and only then move into `vend --json` or job reads.',
      'Pick the matching local skill before acting on discovery, negotiation, escrow, x402, Base, routing, or delegation.',
      'Use the browser only for human review, public Base inspection, or client-side signing.',
    ],
  },
} as const;

const featureSkills = [
  {
    title: 'Provider Discovery',
    file: 'skills/provider-discovery/SKILL.md',
    command: './skills.sh discovery',
    detail: 'Use when the agent needs visible supply, source mix, and an honest read on whether the market is live or mock.',
  },
  {
    title: 'Negotiation + Auction',
    file: 'skills/negotiation-auction/SKILL.md',
    command: './skills.sh negotiation',
    detail: 'Use for `vend`, RFO creation, ranked offers, counter rounds, batching, and negotiation receipts.',
  },
  {
    title: 'Escrow Lifecycle',
    file: 'skills/escrow-lifecycle/SKILL.md',
    command: './skills.sh escrow',
    detail: 'Use for create, fund, submit, complete, reject, refund, and chain-safe job progression.',
  },
  {
    title: 'Machine Payments',
    file: 'skills/machine-payments-x402/SKILL.md',
    command: './skills.sh x402',
    detail: 'Use when the agent must decide between immediate x402 payment and a negotiated escrowed workflow.',
  },
  {
    title: 'Base Service Directory',
    file: 'skills/base-service-directory/SKILL.md',
    command: './skills.sh base',
    detail: 'Use for `/base`, `GET /api/v1/base/agent-services`, and the Base-facing public service surface.',
  },
  {
    title: 'Treasury Routing Preview',
    file: 'skills/treasury-routing-preview/SKILL.md',
    command: './skills.sh routing',
    detail: 'Use only after a completed Base job when the agent needs the Uniswap preview payload path.',
  },
  {
    title: 'Delegation Builder',
    file: 'skills/delegation-builder/SKILL.md',
    command: './skills.sh delegation',
    detail: 'Use for bounded MetaMask / ERC-7710 payload construction, not for claimed delegated execution proof.',
  },
];

export default function DocsPage() {
  const [guideMode, setGuideMode] = useState<keyof typeof modeSwitch>(() => {
    if (typeof window === 'undefined') {
      return 'human';
    }

    return window.localStorage.getItem(OPERATOR_MODE_KEY) === 'agent' ? 'agent' : 'human';
  });

  function selectGuideMode(mode: keyof typeof modeSwitch) {
    setGuideMode(mode);
    window.localStorage.setItem(OPERATOR_MODE_KEY, mode);
  }

  const activeMode = modeSwitch[guideMode];

  return (
    <div className="space-y-8">
      <section className="hero-grid terminal-panel rounded-[1.75rem] p-6 md:p-8">
        <div className="relative z-10">
          <div className="terminal-kicker">Docs</div>
          <h1 className="mt-2 text-3xl font-semibold">Detailed overview for humans and agents</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--terminal-muted)]">
            This page explains what DealRail is, which entry surface to use, how the workflow moves from intent to
            receipt, and what is live versus partial today.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.92fr,1.08fr]">
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">Mode Guide</div>
          <h2 className="mt-2 text-2xl font-semibold">Choose the operating lane first</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">
            Human and agent paths should not be mixed casually. The separate entry card under the nav keeps the same toggle visible across the product, and this section expands the run order behind each lane.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {(['human', 'agent'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => selectGuideMode(mode)}
                className={`terminal-btn ${guideMode === mode ? 'terminal-btn-accent' : ''}`}
              >
                {modeSwitch[mode].label}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-[1.4rem] border border-[var(--terminal-border)] bg-black/10 p-5">
            <div className="terminal-label">{activeMode.kicker}</div>
            <div className="mt-2 text-lg font-semibold">{activeMode.label}</div>
            <div className="mt-3 terminal-mono text-[11px] text-[var(--terminal-accent)]">{activeMode.command}</div>
            <p className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">{activeMode.summary}</p>
            <div className="mt-5 space-y-3">
              {activeMode.steps.map((step, idx) => (
                <div key={step} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--terminal-border)] terminal-mono text-[10px] text-[var(--terminal-accent)]">
                    {idx + 1}
                  </div>
                  <div className="text-[var(--terminal-muted)]">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">Agent Index</div>
          <h2 className="mt-2 text-2xl font-semibold">Public skill entrypoint plus local helpers</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="terminal-metric">
              <div className="terminal-label">Public Index</div>
              <div className="mt-2 terminal-mono text-[11px] text-[var(--terminal-accent)]">/SKILL.md</div>
              <div className="mt-3 text-sm text-[var(--terminal-muted)]">
                The public operating index for agents. Use this before loading deeper repo-local skills.
              </div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Local Command</div>
              <div className="mt-2 terminal-mono text-[11px] text-[var(--terminal-accent)]">./skills.sh features</div>
              <div className="mt-3 text-sm text-[var(--terminal-muted)]">
                Prints the feature skill map so agents can route themselves without guessing.
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/SKILL.md" className="terminal-btn terminal-btn-accent">
              Open SKILL.md
            </a>
            <Link href="/base" className="terminal-btn">
              Open /base
            </Link>
            <Link href="/terminal" className="terminal-btn">
              Open Terminal
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-5">
          <div className="terminal-kicker">What It Is</div>
          <h2 className="mt-2 text-2xl font-semibold">An Ethereum machine-commerce desk, not a chat UI</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--terminal-muted)]">
            <p>DealRail is for agent-driven or human-assisted service deals where both sides need structured price discovery.</p>
            <p>The main value is not messaging. The main value is turning intent into a market scan, an offer, a payment posture, an escrow path, and a receipt.</p>
            <p>Use it when there is actual execution risk, price uncertainty, or a need for evaluator-backed settlement.</p>
          </div>
        </div>

        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-7">
          <div className="terminal-kicker">Entry Surfaces</div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {installLanes.map((lane) => (
              <div key={lane.title} className="terminal-metric">
                <div className="terminal-label">{lane.kicker}</div>
                <div className="mt-2 text-base font-medium">{lane.title}</div>
                <div className="mt-2 terminal-mono text-[11px] text-[var(--terminal-accent)]">{lane.command}</div>
                <div className="mt-3 text-sm text-[var(--terminal-muted)]">{lane.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="terminal-panel rounded-[1.5rem] p-6">
        <div className="terminal-kicker">Feature Skill Pack</div>
        <h2 className="mt-2 text-2xl font-semibold">Skills mapped to the product surfaces we actually ship</h2>
        <p className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">
          Paths below are repo-local references for collaborators and agents running inside the repo. They are not frontend-served public URLs.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureSkills.map((skill) => (
            <div key={skill.title} className="rounded-[1.35rem] border border-[var(--terminal-border)] bg-black/10 p-5">
              <div className="font-semibold">{skill.title}</div>
              <div className="mt-2 terminal-mono text-[11px] text-[var(--terminal-accent)]">{skill.command}</div>
              <div className="mt-3 text-sm leading-6 text-[var(--terminal-muted)]">{skill.detail}</div>
              <div className="mt-4 break-all terminal-mono text-[11px] text-[var(--terminal-muted)]">{skill.file}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-7">
          <div className="terminal-kicker">Package + Command Path</div>
          <h2 className="mt-2 text-2xl font-semibold">Published npm surface for agents and terminal-native humans</h2>
          <div className="mt-5 rounded-[1.35rem] border border-[var(--terminal-border)] bg-black/15 p-4">
            <div className="terminal-label">Package</div>
            <div className="mt-2 terminal-mono text-sm text-[var(--terminal-accent)]">@kairenxyz/dealrail</div>
            <div className="mt-4 space-y-2">
              {packageCommands.map((command) => (
                <div key={command} className="rounded-xl border border-[var(--terminal-border)] bg-black/20 px-3 py-2 terminal-mono text-[11px] text-[var(--terminal-fg)]">
                  {command}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-5">
          <div className="terminal-kicker">Page Map</div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="terminal-metric">
              <div className="terminal-label">Home</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Explains the model and shows the signal animation.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Terminal</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Primary operating surface for commands and role guidance.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Dashboard</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Live market board, command tape, and recent jobs.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Integrations</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Choose the correct rail for payment, delegation, or routing.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Docs</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Explains operator lanes, architecture, and current live posture.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">SKILL.md</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Public agent index that routes runtimes into the right local skill or product surface.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="terminal-panel rounded-[1.5rem] p-6">
        <div className="terminal-kicker">How It Works</div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-6">
          {lifecycle.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5">
              <div className="font-semibold">{item.title}</div>
              <div className="mt-3 text-sm leading-6 text-[var(--terminal-muted)]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="terminal-panel rounded-[1.5rem] p-6 md:p-7">
        <div className="terminal-kicker">Visual Architecture</div>
        <div className="mt-2 max-w-3xl text-sm leading-7 text-[var(--terminal-muted)]">
          Read DealRail as a five-layer system: operator surfaces create demand, the coordination layer turns that into
          an offer, machine payments or escrow make it executable, and the trust layer closes the loop with
          reputation-aware settlement.
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
          {architectureColumns.map((column) => (
            <div key={column.title} className="rounded-[1.4rem] border border-[var(--terminal-border)] bg-black/10 p-5">
              <div className="terminal-kicker">{column.kicker}</div>
              <h3 className="mt-2 text-lg font-semibold">{column.title}</h3>
              <div className="mt-4 space-y-3">
                {column.points.map((point) => (
                  <div key={point} className="rounded-xl border border-[var(--terminal-border)] bg-black/20 px-3 py-2 text-sm leading-6 text-[var(--terminal-muted)]">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-8">
          <div className="terminal-kicker">Signal Flow</div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            {signalFlow.map((step) => (
              <div key={step.title} className="rounded-[1.35rem] border border-[var(--terminal-border)] bg-black/10 p-5">
                <div className="terminal-label">{step.title}</div>
                <div className="mt-3 text-sm leading-6 text-[var(--terminal-muted)]">{step.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-4">
          <div className="terminal-kicker">Core Rails</div>
          <div className="mt-5 space-y-3">
            {rails.map((rail) => (
              <div key={rail.label} className="rounded-[1.1rem] border border-[var(--terminal-border)] bg-black/10 px-4 py-3">
                <div className="terminal-label">{rail.label}</div>
                <div className="mt-2 text-sm leading-6 text-[var(--terminal-muted)]">{rail.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {operatorGuides.map((guide) => (
          <div key={guide.role} className="terminal-panel rounded-[1.5rem] p-6">
            <div className="terminal-kicker">{guide.role}</div>
            <p className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">{guide.summary}</p>
            <div className="mt-5 space-y-3">
              {guide.steps.map((step, idx) => (
                <div key={step} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--terminal-border)] terminal-mono text-[10px] text-[var(--terminal-accent)]">
                    {idx + 1}
                  </div>
                  <div className="text-[var(--terminal-muted)]">{step}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {truthStatus.map((item) => (
          <div key={item.label} className="terminal-panel rounded-[1.5rem] p-6">
            <div className="terminal-kicker">{item.label}</div>
            <div className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">{item.detail}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">When To Use</div>
          <div className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">
            Use DealRail when negotiation matters, when agents need a structured deal loop, and when a final receipt is
            part of the product value.
          </div>
        </div>
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">When Not To Use</div>
          <div className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">
            Do not use DealRail for simple fixed-price one-click purchases where there is no real market scan, no evaluator,
            and no need for a deal receipt.
          </div>
        </div>
      </section>
    </div>
  );
}
