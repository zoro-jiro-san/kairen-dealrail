'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
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
  'buyer: need api integration sprint under 0.10 usdc in 24h',
  'market: show provider supply for automation',
  'integrations: show live rails',
  'provider: offer workflow automation with 24h delivery',
  'status',
];

export function HomeCommandTerminal({ compact = false, onAction }: Props) {
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    { tone: 'system', text: 'DealRail Terminal OS / command surface online' },
    { tone: 'system', text: 'Type a request in plain language. The terminal will classify the role and guide the next steps.' },
    { tone: 'system', text: `Examples: ${EXAMPLES.join(' | ')}` },
  ]);

  function append(tone: LineTone, text: string) {
    setLines((prev) => [...prev, { tone, text }]);
  }

  function appendMany(entries: TerminalLine[]) {
    setLines((prev) => [...prev, ...entries]);
  }

  function prefillFlow(text: string) {
    const lower = text.toLowerCase();
    const budgetMatch = lower.match(/(\d+(?:\.\d+)?)\s*usdc/);
    const hoursMatch = lower.match(/(\d+)\s*(?:h|hr|hrs|hour|hours)/);
    window.localStorage.setItem('dealrail.prefill.serviceRequirement', text);
    if (budgetMatch?.[1]) window.localStorage.setItem('dealrail.prefill.maxBudgetUsdc', budgetMatch[1]);
    if (hoursMatch?.[1]) window.localStorage.setItem('dealrail.prefill.maxDeliveryHours', hoursMatch[1]);
  }

  function emit(kind: TerminalActionKind, command: string, note: string) {
    const action: TerminalAction = { kind, command, note };
    pushTerminalRun({ action: kind, command, note });
    onAction?.(action);
  }

  async function runCommand(raw: string) {
    const command = raw.trim();
    if (!command) return;

    setRunning(true);
    append('user', `dealrail$ ${command}`);
    const normalized = command.toLowerCase();

    if (normalized === 'help') {
      const note = 'Commands: help | status | clear | market | buyer | provider | evaluator | integrations';
      appendMany([
        { tone: 'system', text: note },
        { tone: 'system', text: 'Examples:' },
        { tone: 'system', text: 'buyer: need API integration sprint under 0.10 usdc in 24h' },
        { tone: 'system', text: 'market: show provider supply for automation' },
        { tone: 'system', text: 'integrations: show live rails' },
      ]);
      emit('help', command, note);
      setRunning(false);
      return;
    }

    if (normalized === 'clear') {
      setLines([
        { tone: 'system', text: 'DealRail Command Terminal v2' },
        { tone: 'system', text: 'Terminal cleared. Type "help" for command list.' },
      ]);
      emit('clear', command, 'Terminal output cleared');
      setRunning(false);
      return;
    }

    if (normalized === 'status') {
      try {
        const health = await healthCheck();
        const note = `Backend ONLINE | chainId=${health.blockchain.chainId}`;
        appendMany([
          { tone: 'ok', text: note },
          {
            tone: 'ok',
            text: `escrow=${health.blockchain.escrowAddress.slice(0, 8)}...${health.blockchain.escrowAddress.slice(-6)}`,
          },
          {
            tone: health.integrations?.x402nMockMode ? 'warn' : 'ok',
            text: `x402n mode=${health.integrations?.x402nMockMode ? 'mock' : 'live'}`,
          },
        ]);
        emit('status', command, note);
      } catch {
        const note = 'Backend OFFLINE or unreachable';
        append('warn', `${note}. Check NEXT_PUBLIC_API_URL and backend process.`);
        emit('status', command, note);
      }
      setRunning(false);
      return;
    }

    if (normalized === 'market' || normalized.includes('find providers') || normalized.includes('scan market')) {
      try {
        const query = command.includes(':') ? command.split(':').slice(1).join(':').trim() : command.replace(/market/i, '').trim();
        const result = await integrationsApi.listProviders({ query: query || undefined });
        const top = result.providers.slice(0, 3);
        const note = `Market scan complete: ${result.providers.length} providers returned`;
        appendMany([
          { tone: 'ok', text: 'scanning discovery rails...' },
          { tone: 'ok', text: `query=${query || 'all providers'}` },
          { tone: 'ok', text: note },
          ...top.map((provider) => ({
            tone: (provider.source === 'mock' ? 'warn' : 'ok') as LineTone,
            text: `${provider.serviceName} | ${provider.basePriceUsdc ?? 'n/a'} USDC | rep ${provider.reputationScore ?? 'n/a'} | source=${provider.source}`,
          })),
        ]);
        if (top.length === 0) {
          append('warn', 'No providers matched that request.');
        }
        emit('market_scan', command, note);
      } catch {
        const note = 'Market scan failed';
        append('warn', `${note}. Discovery endpoint did not respond.`);
        emit('market_scan', command, note);
      }
      setRunning(false);
      return;
    }

    if (normalized === 'buyer' || normalized.includes('need') || normalized.includes('want') || normalized.includes('service')) {
      prefillFlow(command);
      try {
        const query = command.replace(/^buyer:/i, '').trim();
        const result = await integrationsApi.listProviders({ query: query || undefined });
        const top = result.providers.slice(0, 2);
        const note = `Buyer flow staged: ${result.providers.length} matching providers available for ranking`;
        appendMany([
          { tone: 'ok', text: 'classifying role: buyer / operator' },
          { tone: 'ok', text: 'saving service policy...' },
          { tone: 'ok', text: note },
          ...top.map((provider) => ({
            tone: (provider.source === 'mock' ? 'warn' : 'ok') as LineTone,
            text: `candidate=${provider.serviceName} | price=${provider.basePriceUsdc ?? 'n/a'} | source=${provider.source}`,
          })),
          { tone: 'ok', text: 'next: scan market -> start reverse auction -> confirm settlement path' },
        ]);
        emit('role_buyer', command, note);
      } catch {
        const note = 'Buyer flow staged, but provider lookup failed';
        appendMany([
          { tone: 'ok', text: 'classifying role: buyer / operator' },
          { tone: 'warn', text: note },
        ]);
        emit('role_buyer', command, note);
      }
      setRunning(false);
      return;
    }

    if (normalized === 'flow' || normalized.includes('auction')) {
      prefillFlow(command);
      const note = 'Auction flow staged: discovery + reverse auction queue updated.';
      appendMany([
        { tone: 'ok', text: 'loading auction path...' },
        { tone: 'ok', text: 'next: compare offers, batch top quotes, confirm a deal' },
      ]);
      emit('start_flow', command, note);
      setRunning(false);
      return;
    }

    if (normalized === 'provider' || normalized.includes('list my service') || normalized.includes('offer service')) {
      const note = 'Provider flow staged: service listing / quote path ready.';
      appendMany([
        { tone: 'ok', text: 'classifying role: provider' },
        { tone: 'ok', text: 'next: publish capability -> respond to auction -> submit deliverable' },
      ]);
      emit('role_provider', command, note);
      setRunning(false);
      return;
    }

    if (normalized === 'evaluator' || normalized.includes('verify delivery') || normalized.includes('review output')) {
      const note = 'Evaluator flow staged: verification and settlement decision path ready.';
      appendMany([
        { tone: 'ok', text: 'classifying role: evaluator' },
        { tone: 'ok', text: 'next: inspect submission -> complete or reject -> write reputation' },
      ]);
      emit('role_evaluator', command, note);
      setRunning(false);
      return;
    }

    if (normalized === 'ops' || normalized.includes('create job') || normalized.includes('fund')) {
      const note = 'Ops path staged: onchain lifecycle queue updated.';
      appendMany([
        { tone: 'ok', text: 'preparing escrow lifecycle...' },
        { tone: 'ok', text: 'next: create job -> fund -> submit -> settle' },
      ]);
      emit('start_ops', command, note);
      setRunning(false);
      return;
    }

    if (normalized === 'integrations' || normalized.includes('delegation') || normalized.includes('x402') || normalized.includes('locus') || normalized.includes('uniswap')) {
      try {
        const [health, execution, locus, discovery] = await Promise.all([
          healthCheck().catch(() => null),
          integrationsApi.listExecutionProviders().catch(() => ({ providers: [] })),
          integrationsApi.listLocusTools().catch(() => ({ tools: { mode: 'fallback' as const, error: 'unavailable' } })),
          integrationsApi.listProviders().catch(() => ({ providers: [] })),
        ]);
        const locusMode = Array.isArray(locus.tools) ? 'live' : locus.tools?.mode || 'fallback';
        const discoveryMode = discovery.providers.every((provider) => provider.source === 'mock') ? 'mock' : 'live';
        const note = 'Integration status loaded';
        appendMany([
          { tone: 'ok', text: note },
          { tone: health?.integrations?.x402nMockMode ? 'warn' : 'ok', text: `x402n negotiation=${health?.integrations?.x402nMockMode ? 'mock' : 'live'}` },
          { tone: discoveryMode === 'mock' ? 'warn' : 'ok', text: `provider market=${discoveryMode} (${discovery.providers.length} providers)` },
          { tone: locusMode === 'live' ? 'ok' : 'warn', text: `locus payout=${locusMode}` },
          { tone: 'ok', text: `delegation builder=live (${execution.providers.some((provider) => provider.id === 'wallet') ? 'wallet path ready' : 'check config'})` },
          { tone: 'ok', text: 'uniswap tx builder=live on Base Mainnet' },
          { tone: 'ok', text: 'next: open Integrations page to use a specific rail with guided inputs' },
        ]);
        emit('open_integrations', command, note);
      } catch {
        const note = 'Integration status failed to load';
        append('warn', note);
        emit('open_integrations', command, note);
      }
      setRunning(false);
      return;
    }

    const note = 'Command not mapped. Use help/examples.';
    append('warn', note);
    emit('unknown', command, note);
    setRunning(false);
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
    <section className="terminal-panel rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="terminal-kicker">Command Entry</div>
          <p className="mt-1 text-sm text-[var(--terminal-muted)]">
            {compact ? 'Widget mode for quick intent capture.' : 'Full mode. Trade through discovery, negotiation, and settlement guidance from one surface.'}
          </p>
        </div>
        <div className="terminal-mono text-xs text-[var(--terminal-muted)]">{running ? 'RUNNING' : 'IDLE'}</div>
      </div>

      <div className="terminal-screen overflow-hidden rounded-[1.25rem] border border-[var(--terminal-border)] bg-black/35">
        <div className="flex items-center justify-between border-b border-[var(--terminal-border)] bg-[var(--terminal-accent)]/10 px-3 py-2">
          <div className="terminal-mono text-[11px] uppercase tracking-widest text-[var(--terminal-accent)]">
            DealRail / Cypherpunk Desk
          </div>
          <div className="terminal-mono text-[10px] text-[var(--terminal-muted)]">F1 HELP | F2 STATUS | F3 MARKET | F4 BUYER</div>
        </div>
        <div className="border-b border-[var(--terminal-border)] bg-black/15 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="terminal-chip">Buyer: need benchmark report under 0.12 usdc</span>
            <span className="terminal-chip">Provider: offer service</span>
            <span className="terminal-chip">Evaluator: verify delivery</span>
          </div>
        </div>
        <div className="p-3">
          <div className={`terminal-mono overflow-auto space-y-1.5 text-xs ${compact ? 'h-44' : 'h-72'}`}>
            {lines.map((line, idx) => (
              <div
                key={`${line.text}-${idx}`}
                className={
                  line.tone === 'system'
                    ? 'text-[var(--terminal-muted)]'
                    : line.tone === 'ok'
                      ? 'text-[var(--terminal-good)]'
                      : line.tone === 'warn'
                        ? 'text-[var(--terminal-warn)]'
                        : 'text-[var(--terminal-fg)]'
                }
              >
                {line.text}
              </div>
            ))}
          </div>
          <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
            <span className="terminal-mono text-xs text-[var(--terminal-accent)]">dealrail$</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="terminal-input terminal-mono"
              placeholder='Try: "need benchmark report under 0.12 usdc in 24h"'
            />
            <button type="submit" className="terminal-btn terminal-btn-accent" disabled={running}>
              Run
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
