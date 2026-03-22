'use client';

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { healthCheck, integrationsApi } from '@/lib/api';
import { pushTerminalRun, TerminalActionKind } from '@/lib/terminalLedger';

type LineTone = 'system' | 'user' | 'ok' | 'warn';

type TerminalLine = {
  tone: LineTone;
  text: string;
};

export type TerminalAction = {
  kind: TerminalActionKind;
  command: string;
  note: string;
};

type Props = {
  compact?: boolean;
  onAction?: (action: TerminalAction) => void;
};

const EXAMPLES = [
  'scan automation',
  'vend benchmark report under 0.12 usdc in 24h',
  'buy api integration sprint under 0.10 usdc in 24h',
  'providers compliance checks',
  'sell workflow automation from 0.12 usdc',
  'rails',
  'status',
];

export function HomeCommandTerminal({ compact = false, onAction }: Props) {
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    { tone: 'system', text: 'DEALRAIL DESK READY' },
    { tone: 'system', text: 'verbs: scan/providers <need> | buy/vend <need> under <budget> usdc in <hours>h | sell <service> from <price> usdc | rails | status' },
    { tone: 'system', text: 'goal: route one Ethereum machine-commerce request from supply discovery to payment, escrow, and receipt' },
  ]);

  const statusLabel = useMemo(() => (running ? 'RUNNING' : 'IDLE'), [running]);

  function append(tone: LineTone, text: string) {
    setLines((prev) => [...prev, { tone, text }]);
  }

  function appendMany(entries: TerminalLine[]) {
    setLines((prev) => [...prev, ...entries]);
  }

  function emit(kind: TerminalActionKind, command: string, note: string) {
    const action: TerminalAction = { kind, command, note };
    pushTerminalRun({ action: kind, command, note });
    onAction?.(action);
  }

  function prefillFlow(text: string) {
    const lower = text.toLowerCase();
    const budgetMatch = lower.match(/(\d+(?:\.\d+)?)\s*usdc/);
    const hoursMatch = lower.match(/(\d+)\s*(?:h|hr|hrs|hour|hours)/);
    window.localStorage.setItem('dealrail.prefill.serviceRequirement', text);
    if (budgetMatch?.[1]) window.localStorage.setItem('dealrail.prefill.maxBudgetUsdc', budgetMatch[1]);
    if (hoursMatch?.[1]) window.localStorage.setItem('dealrail.prefill.maxDeliveryHours', hoursMatch[1]);
  }

  function parseBudget(command: string) {
    const match = command.toLowerCase().match(/(\d+(?:\.\d+)?)\s*usdc/);
    return match ? Number(match[1]) : undefined;
  }

  function parseDeliveryHours(command: string) {
    const match = command.toLowerCase().match(/(\d+)\s*(?:h|hr|hrs|hour|hours)/);
    return match ? Number(match[1]) : undefined;
  }

  function normalizeBuyerQuery(command: string) {
    return stripVerb(command, ['buy', 'buyer', 'vend', 'procure'])
      .replace(/\bunder\s+\d+(?:\.\d+)?\s*usdc\b/gi, '')
      .replace(/\bin\s+\d+\s*(?:h|hr|hrs|hour|hours)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripVerb(command: string, verbs: string[]) {
    let next = command.trim();
    for (const verb of verbs) {
      const regex = new RegExp(`^${verb}\\s*:?\s*`, 'i');
      next = next.replace(regex, '');
    }
    return next.trim();
  }

  async function showHelp(command: string) {
    const note = 'Command map loaded';
    appendMany([
      { tone: 'system', text: 'GRAMMAR' },
      { tone: 'system', text: 'scan automation' },
      { tone: 'system', text: 'providers benchmark report' },
      { tone: 'system', text: 'vend benchmark report under 0.12 usdc in 24h' },
      { tone: 'system', text: 'sell workflow automation from 0.12 usdc' },
      { tone: 'system', text: 'rails' },
      { tone: 'system', text: 'status' },
    ]);
    emit('help', command, note);
  }

  async function runStatus(command: string) {
    try {
      const health = await healthCheck();
      const note = `Backend online on chain ${health.blockchain.chainId}`;
      appendMany([
        { tone: 'ok', text: note },
        { tone: 'ok', text: `escrow=${health.blockchain.escrowAddress}` },
        { tone: health.integrations?.x402nMockMode ? 'warn' : 'ok', text: `market competition=${health.integrations?.x402nMockMode ? 'demo/mock' : 'live'}` },
        { tone: 'ok', text: `machine payments=${health.integrations?.machinePaymentsPrimary ?? 'x402'}` },
      ]);
      emit('status', command, note);
    } catch {
      const note = 'Backend offline or miswired';
      append('warn', `${note}. Check NEXT_PUBLIC_API_URL and restart the frontend after env changes.`);
      emit('status', command, note);
    }
  }

  async function runScan(command: string) {
    const query = stripVerb(command, ['scan', 'market', 'find providers', 'providers']);
    try {
      const result = await integrationsApi.listProviders({ query: query || undefined });
      const top = result.providers.slice(0, 4);
      const allMock = result.providers.length > 0 && result.providers.every((provider) => provider.source === 'mock');
      const note = `Supply scan returned ${result.providers.length} providers`;

      appendMany([
        { tone: 'ok', text: `scan query=${query || 'all supply'}` },
        { tone: allMock ? 'warn' : 'ok', text: `source posture=${allMock ? 'demo/mock only' : 'mixed/live'}` },
        ...top.map((provider) => ({
          tone: (provider.source === 'mock' ? 'warn' : 'ok') as LineTone,
          text: `${provider.serviceName} | ${provider.basePriceUsdc ?? 'n/a'} USDC | rep ${provider.reputationScore ?? 'n/a'} | ${provider.source}`,
        })),
      ]);

      if (top.length === 0) {
        append('warn', 'No provider supply matched. Add imported providers or point discovery to a live marketplace feed.');
      }

      emit('market_scan', command, note);
    } catch {
      const note = 'Supply scan failed';
      append('warn', `${note}. Discovery endpoint did not respond.`);
      emit('market_scan', command, note);
    }
  }

  async function runBuy(command: string) {
    const query = normalizeBuyerQuery(command);
    const maxBasePriceUsdc = parseBudget(command);
    const maxDeliveryHours = parseDeliveryHours(command);

    prefillFlow(query || command);

    try {
      const result = await integrationsApi.listProviders({
        query: query || undefined,
        maxBasePriceUsdc,
      });
      const shortlist = result.providers.slice(0, 3);
      const allMock = result.providers.length > 0 && result.providers.every((provider) => provider.source === 'mock');
      const note = `Buyer flow staged with ${result.providers.length} candidate providers`;

      appendMany([
        { tone: 'ok', text: 'role=buyer' },
        { tone: 'ok', text: `objective=${query || 'service request'}` },
        ...(typeof maxBasePriceUsdc === 'number' ? [{ tone: 'ok' as LineTone, text: `budget ceiling=${maxBasePriceUsdc} USDC` }] : []),
        ...(typeof maxDeliveryHours === 'number' ? [{ tone: 'ok' as LineTone, text: `delivery target=${maxDeliveryHours}h` }] : []),
        { tone: allMock ? 'warn' : 'ok', text: `supply posture=${allMock ? 'demo/mock' : 'mixed/live'}` },
        ...shortlist.map((provider) => ({
          tone: (provider.source === 'mock' ? 'warn' : 'ok') as LineTone,
          text: `candidate=${provider.serviceName} | price=${provider.basePriceUsdc ?? 'n/a'} | rep=${provider.reputationScore ?? 'n/a'} | ${provider.source}`,
        })),
      ]);

      if (shortlist.length === 0) {
        const queued = await integrationsApi.createOpportunity({
          requestText: command,
          normalizedQuery: query || command,
          maxBudgetUsdc: typeof maxBasePriceUsdc === 'number' ? maxBasePriceUsdc : null,
          maxDeliveryHours: typeof maxDeliveryHours === 'number' ? maxDeliveryHours : null,
          matchesAtCreate: result.providers.length,
          source: 'terminal',
        });
        append('warn', 'No matching supply yet. Demand was stored in the opportunity book instead of being dropped.');
        append('ok', `opportunity=${queued.opportunity.id} | providers can pick this up later from the dashboard`);
      } else {
        append('ok', 'next: compare the shortlist, run competition if needed, then choose machine payment or escrow commit');
      }

      emit('role_buyer', command, note);
    } catch {
      const note = 'Buyer flow staged but supply lookup failed';
      appendMany([
        { tone: 'ok', text: 'role=buyer' },
        { tone: 'warn', text: note },
      ]);
      emit('role_buyer', command, note);
    }
  }

  async function runSell(command: string) {
    const query = stripVerb(command, ['sell', 'provider', 'offer']);
    const note = 'Provider onboarding guidance loaded';

    appendMany([
      { tone: 'ok', text: 'role=provider' },
      { tone: 'ok', text: `service=${query || 'unspecified service'}` },
      { tone: 'ok', text: 'to appear in scans: publish to a market adapter or import your provider feed into DealRail discovery' },
      { tone: 'ok', text: 'next: expose endpoint + base price + evaluator path, then respond to active demand' },
    ]);

    emit('role_provider', command, note);
  }

  async function runRails(command: string) {
    try {
      const [health, execution, locus, discovery] = await Promise.all([
        healthCheck().catch(() => null),
        integrationsApi.listExecutionProviders().catch(() => ({ providers: [] })),
        integrationsApi.listLocusTools().catch(() => ({ tools: { mode: 'fallback' as const } })),
        integrationsApi.listProviders().catch(() => ({ providers: [] })),
      ]);

      const locusMode = Array.isArray(locus.tools) ? 'live' : locus.tools?.mode || 'fallback';
      const discoveryMode = discovery.providers.every((provider) => provider.source === 'mock') ? 'demo/mock' : 'mixed/live';
      const note = 'Rail status loaded';

      appendMany([
        { tone: 'ok', text: note },
        { tone: health?.integrations?.x402nMockMode ? 'warn' : 'ok', text: `market competition=${health?.integrations?.x402nMockMode ? 'demo/mock' : 'live'}` },
        { tone: 'ok', text: `machine payments=${health?.integrations?.machinePaymentsPrimary ?? 'x402'}` },
        { tone: discoveryMode === 'demo/mock' ? 'warn' : 'ok', text: `provider market=${discoveryMode}` },
        { tone: locusMode === 'live' ? 'ok' : 'warn', text: `locus payout=${locusMode}` },
        { tone: execution.providers.some((provider) => provider.id === 'wallet') ? 'ok' : 'warn', text: 'delegation builder=ready' },
        { tone: 'ok', text: 'uniswap tx builder=ready' },
      ]);

      emit('open_integrations', command, note);
    } catch {
      const note = 'Rail status failed to load';
      append('warn', note);
      emit('open_integrations', command, note);
    }
  }

  async function runCommand(raw: string) {
    const command = raw.trim();
    if (!command) return;

    setRunning(true);
    append('user', `dealrail$ ${command}`);

    const normalized = command.toLowerCase();

    try {
      if (normalized === 'help' || normalized === '?') {
        await showHelp(command);
        return;
      }

      if (normalized === 'clear') {
        setLines([
          { tone: 'system', text: 'DEALRAIL DESK READY' },
          { tone: 'system', text: 'verbs: scan/providers <need> | buy/vend <need> under <budget> usdc in <hours>h | sell <service> from <price> usdc | rails | status' },
          { tone: 'system', text: 'goal: route one machine-payable request from supply discovery to escrow and receipt' },
        ]);
        emit('clear', command, 'Terminal output cleared');
        return;
      }

      if (normalized === 'status') {
        await runStatus(command);
        return;
      }

      if (/^(scan|market|providers)\b/i.test(command) || normalized.includes('find providers')) {
        await runScan(command);
        return;
      }

      if (/^(buy|buyer|vend|procure)\b/i.test(command) || /^need\b/i.test(command)) {
        await runBuy(command);
        return;
      }

      if (/^(sell|provider|offer)\b/i.test(command)) {
        await runSell(command);
        return;
      }

      if (/^(rails|integrations)\b/i.test(command) || normalized.includes('x402') || normalized.includes('locus')) {
        await runRails(command);
        return;
      }

      if (/^(auction|flow)\b/i.test(command)) {
        prefillFlow(command);
        append('ok', 'Auction path staged. Use `buy ...` first so the desk knows what supply it is comparing.');
        emit('start_flow', command, 'Auction path staged');
        return;
      }

      append('warn', 'Unknown command. Use `help`, `scan`, `providers`, `buy`, `vend`, `sell`, `rails`, or `status`.');
      emit('unknown', command, 'Command not mapped');
    } finally {
      setRunning(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const current = input.trim();
    setHistory((prev) => [...prev, current]);
    setHistoryIndex(-1);
    setInput('');
    await runCommand(current);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!history.length) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex < 0 ? -1 : Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(nextIndex);
      setInput(nextIndex < 0 ? '' : history[nextIndex] || '');
    }
  }

  return (
    <section className="terminal-frame overflow-hidden rounded-[1.6rem]">
      <div className="flex items-center justify-between border-b border-[var(--terminal-border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--terminal-danger)]/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--terminal-warn)]/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--terminal-good)]/85" />
          </div>
          <div>
            <div className="terminal-kicker">Terminal Desk</div>
            <div className="terminal-mono text-[11px] text-[var(--terminal-muted)]">scan / providers / buy / vend / rails / status</div>
          </div>
        </div>
        <div className="terminal-mono text-[11px] text-[var(--terminal-muted)]">{statusLabel}</div>
      </div>

      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-[148px,1fr]'}`}>
        {!compact && (
          <aside className="hidden border-r border-[var(--terminal-border)] px-4 py-5 xl:block">
            <div className="terminal-label">Desk Modes</div>
            <div className="mt-4 space-y-3 text-xs text-[var(--terminal-muted)]">
              <div>01 Route request</div>
              <div>02 Scan providers</div>
              <div>03 Lock escrow</div>
              <div>04 Emit receipt</div>
            </div>
            <div className="mt-6 terminal-label">Examples</div>
            <div className="mt-3 space-y-2">
              {EXAMPLES.slice(0, 4).map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setInput(example)}
                  className="block w-full text-left text-[11px] text-[var(--terminal-muted)] transition hover:text-[var(--terminal-fg)]"
                >
                  {example}
                </button>
              ))}
            </div>
          </aside>
        )}

        <div className="p-4">
          <div className="terminal-console terminal-screen overflow-hidden rounded-[1.2rem]">
            <div className="flex items-center justify-between border-b border-[var(--terminal-border)] px-4 py-3">
              <div className="terminal-mono text-[11px] uppercase tracking-[0.24em] text-[var(--terminal-accent)]">
                DealRail / Procurement Console
              </div>
              <div className="terminal-mono text-[10px] text-[var(--terminal-muted)]">ESC to clear mentally, `clear` to clear literally</div>
            </div>

            <div className="p-4">
              <div className={`terminal-mono overflow-auto space-y-2 text-xs leading-6 ${compact ? 'h-56' : 'h-[26rem]'}`}>
                {lines.map((line, idx) => (
                  <div
                    key={`${line.text}-${idx}`}
                    className={
                      line.tone === 'system'
                        ? 'break-words whitespace-pre-wrap text-[var(--terminal-muted)]'
                        : line.tone === 'ok'
                          ? 'break-words whitespace-pre-wrap text-[var(--terminal-good)]'
                          : line.tone === 'warn'
                            ? 'break-words whitespace-pre-wrap text-[var(--terminal-warn)]'
                            : 'break-words whitespace-pre-wrap text-[var(--terminal-fg)]'
                    }
                  >
                    {line.text}
                  </div>
                ))}
              </div>

              <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
                <span className="terminal-mono text-xs text-[var(--terminal-accent)]">dealrail$</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="terminal-input terminal-mono"
                  placeholder='Try: vend benchmark report under 0.12 usdc in 24h'
                />
                <button type="submit" className="terminal-btn terminal-btn-accent" disabled={running}>
                  Run
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button key={example} type="button" onClick={() => setInput(example)} className="terminal-command">
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
