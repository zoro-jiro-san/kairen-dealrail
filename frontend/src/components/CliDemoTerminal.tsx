'use client';

import { useEffect, useState } from 'react';

type DemoTone = 'system' | 'ok' | 'warn' | 'user';

type DemoLine = {
  tone: DemoTone;
  text: string;
};

type DemoScene = {
  id: string;
  kicker: string;
  title: string;
  command: string;
  note: string;
  badge: string;
  output: DemoLine[];
};

const SCENES: DemoScene[] = [
  {
    id: 'doctor',
    kicker: 'Preflight',
    title: 'Doctor the desk before dispatch',
    command: 'dealrail doctor --json',
    note: 'Shows whether the desk is reachable, how much supply is live, and what is still demo-only.',
    badge: 'doctor',
    output: [
      { tone: 'ok', text: '"backend": { "ok": true, "chainId": 84532 }' },
      { tone: 'warn', text: '"marketMode": "demo/mock"' },
      { tone: 'ok', text: '"paymentProvider": "x402"' },
      { tone: 'warn', text: '"providerCount": 3, "liveProviderCount": 0, "mockProviderCount": 3' },
      { tone: 'system', text: '"nextSteps": { "human": "dealrail vend ...", "agent": "dealrail vend ... --json" }' },
    ],
  },
  {
    id: 'help',
    kicker: 'Command Deck',
    title: 'Start with the deck',
    command: 'dealrail help',
    note: 'Shows the publishable CLI surface for humans and agents.',
    badge: 'intro',
    output: [
      { tone: 'system', text: 'dealrail help' },
      { tone: 'system', text: 'dealrail demo' },
      { tone: 'system', text: 'dealrail status --json' },
      { tone: 'system', text: 'dealrail scan <query>' },
      { tone: 'system', text: 'dealrail vend <query> --budget 0.12 --hours 24 --json' },
      { tone: 'system', text: 'dealrail jobs --limit 4 --json' },
      { tone: 'system', text: 'dealrail rails --json' },
    ],
  },
  {
    id: 'status',
    kicker: 'Health',
    title: 'Confirm the rail posture',
    command: 'dealrail status --json',
    note: 'Validates backend, chain, escrow address, and mock/live negotiation posture.',
    badge: 'health',
    output: [
      { tone: 'ok', text: '"status": "healthy"' },
      { tone: 'ok', text: '"network": "baseSepolia"' },
      { tone: 'ok', text: '"chainId": 84532' },
      { tone: 'ok', text: '"escrowAddress": "0xE25B10057556e9714d2ac60992b68f4E61481cF9"' },
      { tone: 'warn', text: '"x402nMockMode": true' },
      { tone: 'ok', text: '"machinePaymentsPrimary": "x402"' },
    ],
  },
  {
    id: 'vend',
    kicker: 'Buyer Run',
    title: 'Buyer agent requests one outcome',
    command: 'dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json',
    note: 'Runs the procurement path: one request in, ranked offers out.',
    badge: 'buyer',
    output: [
      { tone: 'ok', text: '"negotiationId": "neg_c40dce13"' },
      { tone: 'ok', text: '"budgetUsdc": 0.12' },
      { tone: 'ok', text: '"bestOffer": { "priceUsdc": 0.09, "deliveryHours": 20 }' },
      { tone: 'ok', text: '"provider": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF"' },
      { tone: 'system', text: '"terms": "automation benchmark report | 20h SLA | dispute via evaluator"' },
    ],
  },
  {
    id: 'jobs',
    kicker: 'Settlement',
    title: 'Show the onchain record',
    command: 'dealrail jobs --limit 4 --json',
    note: 'Confirms that the desk can read the completed escrow jobs back out.',
    badge: 'record',
    output: [
      { tone: 'ok', text: '"jobId": 2' },
      { tone: 'ok', text: '"state": "Completed"' },
      { tone: 'ok', text: '"budget": "0.1 USDC"' },
      { tone: 'system', text: '"provider": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF"' },
      { tone: 'system', text: '"explorerUrl": "https://sepolia.basescan.org/address/0xE25B10057556e9714d2ac60992b68f4E61481cF9"' },
    ],
  },
  {
    id: 'rails',
    kicker: 'Integrations',
    title: 'Reveal the available execution rails',
    command: 'dealrail rails --json',
    note: 'Summarizes wallet-native execution, Locus bridge mode, and machine-payments posture.',
    badge: 'rails',
    output: [
      { tone: 'ok', text: '"wallet": "live"' },
      { tone: 'warn', text: '"locus": "mock"' },
      { tone: 'ok', text: '"bankr": "mock"' },
      { tone: 'system', text: '"primaryProvider": "x402"' },
      { tone: 'system', text: '"payments": "POST /api/v1/payments/proxy"' },
      { tone: 'system', text: '"useCase": "pay-per-call API/data purchases + escrow settlement"' },
    ],
  },
];

const TYPE_MS = 24;
const LINE_MS = 180;
const SCENE_HOLD_MS = 1800;

export function CliDemoTerminal() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [playing, setPlaying] = useState(true);

  const scene = SCENES[sceneIndex];

  useEffect(() => {
    if (!playing) return;

    if (typedChars < scene.command.length) {
      const timer = window.setTimeout(() => setTypedChars((value) => value + 1), TYPE_MS);
      return () => window.clearTimeout(timer);
    }

    if (visibleLines < scene.output.length) {
      const timer = window.setTimeout(() => setVisibleLines((value) => value + 1), LINE_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setSceneIndex((value) => (value + 1) % SCENES.length);
      setTypedChars(0);
      setVisibleLines(0);
    }, SCENE_HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [playing, scene.command.length, scene.output.length, typedChars, visibleLines]);

  function selectScene(index: number) {
    setSceneIndex(index);
    setTypedChars(SCENES[index].command.length);
    setVisibleLines(SCENES[index].output.length);
    setPlaying(false);
  }

  function resetPlayback() {
    setTypedChars(0);
    setVisibleLines(0);
    setPlaying(true);
  }

  return (
    <section className="terminal-frame overflow-hidden rounded-[1.75rem]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--terminal-border)] px-5 py-4">
        <div>
          <div className="terminal-kicker">Demo Terminal</div>
          <h2 className="mt-1 text-2xl font-semibold">Browser replay of the CLI story</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className={`terminal-btn ${playing ? 'terminal-btn-accent' : ''}`}
          >
            {playing ? 'Pause' : 'Resume'}
          </button>
          <button type="button" onClick={resetPlayback} className="terminal-btn">
            Restart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[280px,1fr]">
        <aside className="border-b border-[var(--terminal-border)] px-5 py-5 xl:border-b-0 xl:border-r">
          <div className="terminal-label">Scenes</div>
          <div className="mt-4 space-y-3">
            {SCENES.map((entry, index) => {
              const active = index === sceneIndex;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectScene(index)}
                  className={`block w-full rounded-[1.2rem] border px-4 py-3 text-left transition ${
                    active
                      ? 'border-[var(--terminal-accent)] bg-[var(--terminal-accent)]/10'
                      : 'border-[var(--terminal-border)] bg-black/10 hover:border-[var(--terminal-accent)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="terminal-label">{entry.kicker}</div>
                    <div className="terminal-chip">{entry.badge}</div>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{entry.title}</div>
                  <div className="mt-1 text-xs leading-5 text-[var(--terminal-muted)]">{entry.note}</div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="p-5">
          <div className="terminal-console overflow-hidden rounded-[1.35rem]">
            <div className="flex items-center justify-between border-b border-[var(--terminal-border)] px-4 py-3">
              <div>
                <div className="terminal-kicker">{scene.kicker}</div>
                <div className="terminal-mono text-[11px] text-[var(--terminal-muted)]">dealrail / guided playback</div>
              </div>
              <div className="terminal-chip">{playing ? 'autoplay' : 'manual'}</div>
            </div>

            <div className="p-4">
              <div className="rounded-[1.1rem] border border-[var(--terminal-border)] bg-black/15 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--terminal-danger)]/85" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--terminal-warn)]/85" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--terminal-good)]/85" />
                </div>

                <div className="mt-5 terminal-mono text-xs leading-6">
                  <div className="text-[var(--terminal-accent)]">
                    dealrail$ {scene.command.slice(0, typedChars)}
                    {(typedChars < scene.command.length || playing) && <span className="animate-pulse text-[var(--terminal-fg)]">_</span>}
                  </div>

                  <div className="mt-4 space-y-2">
                    {scene.output.slice(0, visibleLines).map((line, index) => (
                      <div
                        key={`${scene.id}-${index}-${line.text}`}
                        className={
                          line.tone === 'ok'
                            ? 'break-words whitespace-pre-wrap text-[var(--terminal-good)]'
                            : line.tone === 'warn'
                              ? 'break-words whitespace-pre-wrap text-[var(--terminal-warn)]'
                              : line.tone === 'user'
                                ? 'break-words whitespace-pre-wrap text-[var(--terminal-fg)]'
                                : 'break-words whitespace-pre-wrap text-[var(--terminal-muted)]'
                        }
                      >
                        {line.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="terminal-metric">
                  <div className="terminal-label">Scene</div>
                  <div className="mt-2 text-sm font-semibold">
                    {String(sceneIndex + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
                  </div>
                </div>
                <div className="terminal-metric">
                  <div className="terminal-label">Playback</div>
                  <div className="mt-2 text-sm font-semibold">{playing ? 'Auto-replay' : 'Paused for inspection'}</div>
                </div>
                <div className="terminal-metric">
                  <div className="terminal-label">Use It For</div>
                  <div className="mt-2 text-sm text-[var(--terminal-muted)]">Investor or hackathon demo without requiring live typing.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
