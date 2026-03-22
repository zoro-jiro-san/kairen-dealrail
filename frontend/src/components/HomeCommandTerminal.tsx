'use client';

import Link from 'next/link';
import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { useAccount, useSendTransaction, useSwitchChain, useWriteContract } from 'wagmi';
import { Address, isAddress, keccak256, parseEther, parseUnits, toBytes } from 'viem';
import { healthCheck, integrationsApi, jobsApi } from '@/lib/api';
import { getChainLabel, getExplorerTxUrl, getUSDCAddress, USDC_ABI } from '@/lib/contracts';
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

type ParsedSendCommand = {
  amount: string;
  asset: 'usdc' | 'native';
  assetLabel: string;
  recipient: Address;
  chainId: 84532 | 11142220;
};

type ParsedSwapCommand = {
  amountIn: string;
  tokenIn: 'USDC' | 'WETH';
  tokenOut: 'USDC' | 'WETH';
  chainId: 84532;
};

const EXAMPLES = [
  'doctor',
  'services',
  'vend image generation under 0.08 usdc in 6h',
  'send 1 usdc to 0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF on base sepolia',
  'send 0.001 eth to 0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e on base sepolia',
  'swap 10 usdc to weth on base sepolia',
  'status',
];

const DEMO_SERVICES = [
  {
    id: 'image-generation',
    name: 'Image generation',
    description: 'Generate editorial product visuals, launch images, and prompt-tuned campaign assets.',
    startingPriceUsdc: 0.08,
    deliveryHours: 6,
    settlementRail: 'Base Sepolia USDC',
    providerAddress: '0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF',
  },
  {
    id: 'web-fetch',
    name: 'Fetch and extract',
    description: 'Fetch URLs, extract structured text, and normalize web data into machine-readable output.',
    startingPriceUsdc: 0.03,
    deliveryHours: 2,
    settlementRail: 'Base Sepolia USDC',
    providerAddress: '0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e',
  },
  {
    id: 'finding-agent',
    name: 'Finding and research',
    description: 'Search, shortlist, and summarize sources for procurement, diligence, or market discovery tasks.',
    startingPriceUsdc: 0.05,
    deliveryHours: 4,
    settlementRail: 'Celo Sepolia stablecoin',
    providerAddress: '0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2',
  },
  {
    id: 'benchmark-report',
    name: 'Automation benchmark report',
    description: 'Compare providers, summarize tradeoffs, and return a scored recommendation sheet.',
    startingPriceUsdc: 0.09,
    deliveryHours: 20,
    settlementRail: 'Base Sepolia USDC',
    providerAddress: '0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF',
  },
] as const;

const INITIAL_LINES: TerminalLine[] = [
  { tone: 'system', text: 'DEALRAIL READY' },
  { tone: 'system', text: 'start: doctor | services | vend <need> under <budget> usdc in <hours>h' },
  { tone: 'system', text: 'wallet sends are live: send <amount> usdc to <address> on base sepolia' },
  { tone: 'system', text: 'swaps are sample-only: swap <amount> usdc to weth on base sepolia' },
  { tone: 'system', text: 'agent path: npx @kairenxyz/dealrail doctor --json' },
];

export function HomeCommandTerminal({ compact = false, onAction }: Props) {
  const { address, chainId } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);

  const statusLabel = useMemo(() => (running ? 'RUNNING' : 'IDLE'), [running]);
  const walletLabel = useMemo(() => {
    if (!address) return 'wallet offline';
    return `${address.slice(0, 6)}...${address.slice(-4)} on ${getChainLabel(chainId)}`;
  }, [address, chainId]);
  const visibleExamples = compact ? EXAMPLES.slice(0, 3) : EXAMPLES;
  const visibleLines = compact ? lines.slice(-4) : lines;

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

  function findDemoServices(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [...DEMO_SERVICES];
    return DEMO_SERVICES.filter((service) =>
      `${service.name} ${service.description} ${service.id}`.toLowerCase().includes(normalized)
    );
  }

  function mockTxHash(seed: string) {
    return keccak256(toBytes(`${seed}:${Date.now()}:${Math.random().toString(36).slice(2)}`));
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
      const regex = new RegExp(`^${verb}\\s*:?\\s*`, 'i');
      next = next.replace(regex, '');
    }
    return next.trim();
  }

  function resolveChainId(command: string): 84532 | 11142220 {
    const normalized = command.toLowerCase();
    if (normalized.includes('celo')) return 11142220;
    if (normalized.includes('base')) return 84532;
    return chainId === 11142220 ? 11142220 : 84532;
  }

  function parseSendCommand(command: string): ParsedSendCommand | null {
    const match = command.match(/^send\s+(\d+(?:\.\d+)?)\s+([a-z]+)\s+to\s+(0x[a-fA-F0-9]{40})(?:\s+on\s+.+)?$/i);
    if (!match) return null;

    const [, amount, rawAsset, rawRecipient] = match;
    if (!isAddress(rawRecipient)) return null;

    const normalizedAsset = rawAsset.toLowerCase();
    const targetChainId = resolveChainId(command);

    if (normalizedAsset === 'usdc') {
      return {
        amount,
        asset: 'usdc',
        assetLabel: 'USDC',
        recipient: rawRecipient as Address,
        chainId: targetChainId,
      };
    }

    if (normalizedAsset === 'eth' || normalizedAsset === 'native' || normalizedAsset === 'celo') {
      return {
        amount,
        asset: 'native',
        assetLabel: targetChainId === 11142220 ? 'CELO' : 'ETH',
        recipient: rawRecipient as Address,
        chainId: targetChainId,
      };
    }

    return null;
  }

  function parseSwapCommand(command: string): ParsedSwapCommand | null {
    const match = command.match(/^swap\s+(\d+(?:\.\d+)?)\s+(usdc|weth)\s+to\s+(usdc|weth)(?:\s+on\s+.+)?$/i);
    if (!match) return null;

    const [, amountIn, rawTokenIn, rawTokenOut] = match;
    const tokenIn = rawTokenIn.toUpperCase() as 'USDC' | 'WETH';
    const tokenOut = rawTokenOut.toUpperCase() as 'USDC' | 'WETH';

    if (tokenIn === tokenOut) return null;

    return {
      amountIn,
      tokenIn,
      tokenOut,
      chainId: 84532,
    };
  }

  async function ensureWalletChain(targetChainId: number) {
    if (!address) {
      throw new Error(`Connect a wallet on ${getChainLabel(targetChainId)} before sending transactions from the terminal.`);
    }

    if (chainId !== targetChainId) {
      await switchChainAsync({ chainId: targetChainId });
    }
  }

  function appendSimulationReceipt(service: (typeof DEMO_SERVICES)[number], command: string) {
    const approveTx = mockTxHash(`${command}:approve:${service.id}`);
    const fundTx = mockTxHash(`${command}:fund:${service.id}`);
    const receiptId = `sim_${service.id}_${Date.now().toString(36)}`;

    appendMany([
      { tone: 'ok', text: `demo service=${service.name} | price=${service.startingPriceUsdc.toFixed(2)} USDC | eta=${service.deliveryHours}h` },
      { tone: 'ok', text: `settlement rail=${service.settlementRail} | provider=${service.providerAddress}` },
      { tone: 'system', text: `sim approve tx=${approveTx}` },
      { tone: 'system', text: `sim settle tx=${fundTx}` },
      { tone: 'ok', text: `receipt=${receiptId} | mode=frontend simulation | wallet=${address ? address : 'optional'}` },
      { tone: 'system', text: address ? 'wallet is connected, so this can graduate to a live client/provider path later.' : 'wallet is optional for demo mode; connect it only when you want real client/provider execution.' },
    ]);
  }

  async function showHelp(command: string) {
    appendMany([
      { tone: 'system', text: 'GRAMMAR' },
      { tone: 'system', text: 'doctor' },
      { tone: 'system', text: 'services' },
      { tone: 'system', text: 'vend image generation under 0.08 usdc in 6h' },
      { tone: 'system', text: 'providers benchmark report' },
      { tone: 'system', text: 'send 1 usdc to 0x... on base sepolia' },
      { tone: 'system', text: 'send 0.001 eth to 0x... on base sepolia' },
      { tone: 'system', text: 'swap 10 usdc to weth on base sepolia' },
      { tone: 'system', text: 'status' },
      { tone: 'system', text: 'wallet sends are live on testnet when your wallet is connected' },
      { tone: 'system', text: 'swaps are shown as sample-only so the desk does not overclaim execution' },
      { tone: 'system', text: 'agent lane: use the CLI with --json after doctor confirms posture' },
    ]);
    emit('help', command, 'Command map loaded');
  }

  async function showServices(command: string) {
    try {
      const directory = await integrationsApi.getBaseAgentServices();
      const note =
        directory.catalogMode === 'curated_demo'
          ? 'Base service directory loaded with curated demo supply'
          : 'Base service directory loaded';

      appendMany([
        { tone: directory.catalogMode === 'curated_demo' ? 'warn' : 'ok', text: `base service directory | chain=${directory.chainId} | mode=${directory.catalogMode}` },
        { tone: 'ok', text: `public surfaces=${directory.publicSurfaces.length} | visible supply=${directory.discovery.providerCount}` },
        ...directory.publicSurfaces.slice(0, 4).map((surface) => ({
          tone: 'system' as LineTone,
          text: `${surface.name} | ${surface.method} ${surface.endpoint} | ${surface.access}`,
        })),
        { tone: 'system', text: 'curated examples' },
        ...DEMO_SERVICES.slice(0, 4).map((service) => ({
          tone: 'system' as LineTone,
          text: `${service.name} | ${service.startingPriceUsdc.toFixed(2)} USDC | ${service.deliveryHours}h | ${service.settlementRail}`,
        })),
      ]);
      emit('market_scan', command, note);
      return;
    } catch {
      appendMany([
        { tone: 'warn', text: 'base service directory is unavailable; showing fallback demo catalog' },
        ...DEMO_SERVICES.map((service) => ({
          tone: 'system' as LineTone,
          text: `${service.name} | ${service.startingPriceUsdc.toFixed(2)} USDC | ${service.deliveryHours}h | ${service.settlementRail}`,
        })),
        { tone: 'system', text: 'try: vend image generation under 0.08 usdc in 6h' },
      ]);
      emit('market_scan', command, 'Fallback service catalog loaded');
    }
  }

  async function runDoctor(command: string) {
    try {
      const [health, sources, providers, execution, jobs] = await Promise.all([
        healthCheck(),
        integrationsApi.listDiscoverySources().catch(() => ({ sources: [] })),
        integrationsApi.listProviders().catch(() => ({ providers: [] })),
        integrationsApi.listExecutionProviders().catch(() => ({ providers: [] })),
        jobsApi.list({ limit: 4 }).catch(() => ({ jobs: [], pagination: { limit: 4, totalOnchain: 0 } })),
      ]);

      const enabledSources = sources.sources.filter((source) => source.enabled).map((source) => source.id);
      const providerCount = providers.providers.length;
      const liveProviderCount = providers.providers.filter((provider) => provider.source !== 'mock').length;
      const note = health.integrations?.x402nMockMode
        ? 'Doctor complete: desk is reachable and the demo catalog is active'
        : 'Doctor complete: desk is reachable and routing is live';

      appendMany([
        { tone: 'ok', text: `api=reachable | chain=${health.blockchain.chainId} | escrow=${health.blockchain.escrowAddress}` },
        { tone: health.integrations?.x402nMockMode ? 'warn' : 'ok', text: `market posture=${health.integrations?.x402nMockMode ? 'curated demo' : 'live routing'}` },
        { tone: 'ok', text: `machine payments=${health.integrations?.machinePaymentsPrimary ?? 'x402'}` },
        { tone: enabledSources.length > 0 ? 'ok' : 'warn', text: `enabled discovery=${enabledSources.join(', ') || 'none'}` },
        { tone: liveProviderCount > 0 ? 'ok' : 'warn', text: `provider supply=${providerCount} total | ${liveProviderCount} live | ${providerCount - liveProviderCount} mock` },
        { tone: 'ok', text: `execution adapters=${execution.providers.length} | onchain jobs=${jobs.pagination?.totalOnchain ?? jobs.jobs.length}` },
        { tone: address ? 'ok' : 'warn', text: `wallet=${address ? `${address.slice(0, 6)}...${address.slice(-4)} on ${getChainLabel(chainId)}` : 'not connected'}` },
        { tone: 'system', text: 'next demo: services or vend image generation under 0.08 usdc in 6h' },
        { tone: 'system', text: 'next wallet: send 1 usdc to 0x... on base sepolia' },
      ]);

      emit('doctor', command, note);
    } catch {
      appendMany([
        { tone: 'warn', text: 'Doctor failed: backend is unreachable' },
        { tone: 'warn', text: 'check NEXT_PUBLIC_API_URL and backend deployment before recording flows' },
      ]);
      emit('doctor', command, 'Doctor failed: backend is unreachable');
    }
  }

  async function runStatus(command: string) {
    try {
      const health = await healthCheck();
      appendMany([
        { tone: 'ok', text: `backend online on ${getChainLabel(health.blockchain.chainId)}` },
        { tone: 'ok', text: `escrow=${health.blockchain.escrowAddress}` },
        { tone: health.integrations?.x402nMockMode ? 'warn' : 'ok', text: `market posture=${health.integrations?.x402nMockMode ? 'curated demo' : 'live routing'}` },
        { tone: 'ok', text: `machine payments=${health.integrations?.machinePaymentsPrimary ?? 'x402'}` },
      ]);
      emit('status', command, `Backend online on chain ${health.blockchain.chainId}`);
    } catch {
      append('warn', 'Backend offline or miswired. Check NEXT_PUBLIC_API_URL and redeploy the frontend if needed.');
      emit('status', command, 'Backend offline or miswired');
    }
  }

  async function runScan(command: string) {
    const query = stripVerb(command, ['scan', 'market', 'find providers', 'providers']);
    const demoMatches = findDemoServices(query);

    if (demoMatches.length > 0) {
      appendMany([
        { tone: 'ok', text: `scan query=${query || 'all demo services'}` },
        { tone: 'ok', text: 'source posture=frontend demo catalog' },
        ...demoMatches.slice(0, 4).map((service) => ({
          tone: 'system' as LineTone,
          text: `${service.name} | ${service.startingPriceUsdc.toFixed(2)} USDC | ${service.deliveryHours}h | ${service.settlementRail}`,
        })),
      ]);
      emit('market_scan', command, `Demo service scan returned ${demoMatches.length} catalog entries`);
      return;
    }

    try {
      const result = await integrationsApi.listProviders({ query: query || undefined });
      const top = result.providers.slice(0, 4);
      const allMock = result.providers.length > 0 && result.providers.every((provider) => provider.source === 'mock');

      appendMany([
        { tone: 'ok', text: `scan query=${query || 'all supply'}` },
        { tone: allMock ? 'warn' : 'ok', text: `source posture=${allMock ? 'curated demo only' : 'mixed/live'}` },
        ...top.map((provider) => ({
          tone: (provider.source === 'mock' ? 'warn' : 'ok') as LineTone,
          text: `${provider.serviceName} | ${provider.basePriceUsdc ?? 'n/a'} USDC | rep ${provider.reputationScore ?? 'n/a'} | ${provider.source}`,
        })),
      ]);

      if (top.length === 0) {
        append('warn', 'No provider supply matched. Keep the demo on the hardcoded catalog unless a live feed is available.');
      }

      emit('market_scan', command, `Supply scan returned ${result.providers.length} providers`);
    } catch {
      append('warn', 'Supply scan failed. Discovery endpoint did not respond.');
      emit('market_scan', command, 'Supply scan failed');
    }
  }

  async function runBuy(command: string) {
    const query = normalizeBuyerQuery(command);
    const maxBasePriceUsdc = parseBudget(command);
    const maxDeliveryHours = parseDeliveryHours(command);
    const demoMatches = findDemoServices(query);

    prefillFlow(query || command);

    if (demoMatches.length > 0) {
      const service = demoMatches[0];
      appendMany([
        { tone: 'ok', text: 'role=buyer' },
        { tone: 'ok', text: `objective=${query || service.name}` },
        ...(typeof maxBasePriceUsdc === 'number' ? [{ tone: 'ok' as LineTone, text: `budget ceiling=${maxBasePriceUsdc} USDC` }] : []),
        ...(typeof maxDeliveryHours === 'number' ? [{ tone: 'ok' as LineTone, text: `delivery target=${maxDeliveryHours}h` }] : []),
        { tone: 'ok', text: 'supply posture=frontend demo simulation' },
        { tone: 'ok', text: `candidate=${service.name} | price=${service.startingPriceUsdc.toFixed(2)} | eta=${service.deliveryHours}h | demo catalog` },
      ]);
      appendSimulationReceipt(service, command);
      emit('role_buyer', command, `Frontend simulation staged for ${service.name}`);
      return;
    }

    try {
      const result = await integrationsApi.listProviders({
        query: query || undefined,
        maxBasePriceUsdc,
      });
      const shortlist = result.providers.slice(0, 3);
      const allMock = result.providers.length > 0 && result.providers.every((provider) => provider.source === 'mock');

      appendMany([
        { tone: 'ok', text: 'role=buyer' },
        { tone: 'ok', text: `objective=${query || 'service request'}` },
        ...(typeof maxBasePriceUsdc === 'number' ? [{ tone: 'ok' as LineTone, text: `budget ceiling=${maxBasePriceUsdc} USDC` }] : []),
        ...(typeof maxDeliveryHours === 'number' ? [{ tone: 'ok' as LineTone, text: `delivery target=${maxDeliveryHours}h` }] : []),
        { tone: allMock ? 'warn' : 'ok', text: `supply posture=${allMock ? 'curated demo' : 'mixed/live'}` },
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
        append('ok', 'next: compare the shortlist, then choose sample demo or a real settlement path');
      }

      emit('role_buyer', command, `Buyer flow staged with ${result.providers.length} candidate providers`);
    } catch {
      appendMany([
        { tone: 'ok', text: 'role=buyer' },
        { tone: 'warn', text: 'Buyer flow staged but supply lookup failed' },
      ]);
      emit('role_buyer', command, 'Buyer flow staged but supply lookup failed');
    }
  }

  async function runSell(command: string) {
    const query = stripVerb(command, ['sell', 'provider', 'offer']);
    appendMany([
      { tone: 'ok', text: 'role=provider' },
      { tone: 'ok', text: `service=${query || 'unspecified service'}` },
      { tone: 'ok', text: 'to appear in scans: publish to a market adapter or import your provider feed into DealRail discovery' },
      { tone: 'ok', text: 'next: expose endpoint + base price + evaluator path, then respond to active demand' },
    ]);
    emit('role_provider', command, 'Provider onboarding guidance loaded');
  }

  async function runRails(command: string) {
    try {
      const [health, execution, discovery] = await Promise.all([
        healthCheck().catch(() => null),
        integrationsApi.listExecutionProviders().catch(() => ({ providers: [] })),
        integrationsApi.listProviders().catch(() => ({ providers: [] })),
      ]);

      const discoveryMode = discovery.providers.every((provider) => provider.source === 'mock') ? 'curated demo' : 'mixed/live';

      appendMany([
        { tone: 'ok', text: 'desk capabilities loaded' },
        { tone: health?.integrations?.x402nMockMode ? 'warn' : 'ok', text: `market competition=${health?.integrations?.x402nMockMode ? 'curated demo' : 'live'}` },
        { tone: 'ok', text: `machine payments=${health?.integrations?.machinePaymentsPrimary ?? 'x402'}` },
        { tone: discoveryMode === 'curated demo' ? 'warn' : 'ok', text: `provider market=${discoveryMode}` },
        { tone: execution.providers.some((provider) => provider.id === 'wallet') ? 'ok' : 'warn', text: 'wallet tx terminal=ready' },
        { tone: 'warn', text: 'swap terminal=sample only' },
      ]);

      emit('open_integrations', command, 'Rail status loaded');
    } catch {
      append('warn', 'Rail status failed to load');
      emit('open_integrations', command, 'Rail status failed to load');
    }
  }

  async function runWalletSend(command: string) {
    const parsed = parseSendCommand(command);

    if (!parsed) {
      append('warn', 'Send syntax: send <amount> usdc|eth|native to 0x... on base sepolia');
      emit('wallet_send', command, 'Wallet send syntax error');
      return;
    }

    try {
      await ensureWalletChain(parsed.chainId);

      const hash = parsed.asset === 'usdc'
        ? await writeContractAsync({
            address: getUSDCAddress(parsed.chainId),
            abi: USDC_ABI,
            functionName: 'transfer',
            args: [parsed.recipient, parseUnits(parsed.amount, 6)],
            chainId: parsed.chainId,
          })
        : await sendTransactionAsync({
            to: parsed.recipient,
            value: parseEther(parsed.amount),
            chainId: parsed.chainId,
          });

      appendMany([
        { tone: 'ok', text: `wallet send submitted | asset=${parsed.assetLabel} | amount=${parsed.amount} | chain=${getChainLabel(parsed.chainId)}` },
        { tone: 'ok', text: `to=${parsed.recipient}` },
        { tone: 'system', text: `tx=${hash}` },
        { tone: 'system', text: `explorer=${getExplorerTxUrl(parsed.chainId, hash)}` },
      ]);
      emit('wallet_send', command, `${parsed.assetLabel} send submitted on ${getChainLabel(parsed.chainId)}`);
    } catch (error) {
      append('warn', error instanceof Error ? error.message : 'Wallet send failed.');
      emit('wallet_send', command, 'Wallet send failed');
    }
  }

  async function runSwapPreview(command: string) {
    const parsed = parseSwapCommand(command);

    if (!parsed) {
      append('warn', 'Swap syntax: swap <amount> usdc|weth to usdc|weth on base sepolia');
      emit('swap_preview', command, 'Swap syntax error');
      return;
    }

    appendMany([
      { tone: 'ok', text: `swap sample | chain=${getChainLabel(parsed.chainId)} | route=${parsed.tokenIn} -> ${parsed.tokenOut}` },
      { tone: 'ok', text: `amount in=${parsed.amountIn} ${parsed.tokenIn}` },
      { tone: 'system', text: `sample route id=${mockTxHash(`swap:${command}`)}` },
      { tone: 'warn', text: 'This is a terminal sample, not a live desk-executed swap proof yet.' },
      { tone: 'system', text: 'Keep wallet sends live in the demo. Keep swap clearly labeled as sample.' },
    ]);
    emit('swap_preview', command, 'Base Sepolia swap sample loaded');
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

      if (normalized === 'services' || normalized === 'catalog') {
        await showServices(command);
        return;
      }

      if (normalized === 'clear') {
        setLines(INITIAL_LINES);
        emit('clear', command, 'Terminal output cleared');
        return;
      }

      if (normalized === 'doctor' || normalized === 'preflight' || normalized === 'check') {
        await runDoctor(command);
        return;
      }

      if (normalized === 'status') {
        await runStatus(command);
        return;
      }

      if (/^send\b/i.test(command)) {
        await runWalletSend(command);
        return;
      }

      if (/^swap\b/i.test(command)) {
        await runSwapPreview(command);
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

      if (/^(rails|integrations)\b/i.test(command) || normalized.includes('x402')) {
        await runRails(command);
        return;
      }

      if (/^(auction|flow)\b/i.test(command)) {
        prefillFlow(command);
        append('ok', 'Auction path staged. Use `buy ...` first so the desk knows what supply it is comparing.');
        emit('start_flow', command, 'Auction path staged');
        return;
      }

      append('warn', 'Unknown command. Use `help`, `services`, `send`, `swap`, `scan`, `providers`, `buy`, `vend`, or `status`.');
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
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--terminal-border)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[color:color-mix(in_srgb,var(--terminal-muted)_45%,transparent)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[color:color-mix(in_srgb,var(--terminal-muted)_72%,transparent)]" />
          </div>
          <div>
            <div className="terminal-kicker">{compact ? 'Quick Terminal' : 'Command Desk'}</div>
            <div className="terminal-mono text-[11px] text-[var(--terminal-muted)]">
              {compact ? 'doctor / services / send' : 'doctor / services / vend / send / swap / status'}
            </div>
          </div>
        </div>
        <div className="terminal-mono text-[11px] text-[var(--terminal-muted)]">{statusLabel}</div>
      </div>

      <div className="p-4">
        <div className="terminal-console terminal-screen overflow-hidden rounded-[1.2rem]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--terminal-border)] px-4 py-3">
            <div className="terminal-mono text-[11px] uppercase tracking-[0.24em] text-[var(--terminal-muted)]">
              {compact ? 'DealRail / preview' : 'DealRail / operator terminal'}
            </div>
            <div className="terminal-mono text-[10px] text-[var(--terminal-muted)]">
              {walletLabel}
            </div>
          </div>

          <div className="p-4">
            <div className={`terminal-mono overflow-auto space-y-2 text-xs leading-6 ${compact ? 'h-36' : 'h-[25rem]'}`}>
              {visibleLines.map((line, idx) => (
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
              <span className="terminal-mono text-xs text-[var(--terminal-muted)]">dealrail$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="terminal-input terminal-mono"
                placeholder={compact ? 'Try: doctor or services' : 'Try: send 1 usdc to 0x... on base sepolia'}
              />
              <button type="submit" className="terminal-btn" disabled={running}>
                Run
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {visibleExamples.map((example) => (
                <button key={example} type="button" onClick={() => setInput(example)} className="terminal-command">
                  {example}
                </button>
              ))}
            </div>

            {compact ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-[var(--terminal-border)] bg-black/10 px-4 py-3">
                <div className="text-sm text-[var(--terminal-muted)]">
                  Use this as a quick prompt. Open the full terminal for the full command surface.
                </div>
                <Link href="/terminal" className="terminal-command">
                  open /terminal
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-[1rem] border border-[var(--terminal-border)] bg-black/10 px-4 py-3">
                  <div className="terminal-label">Live now</div>
                  <div className="mt-2 text-sm text-[var(--terminal-muted)]">
                    `doctor`, `services`, `vend`, and `send` are the clean browser demo path. Wallet sends are real testnet transactions when the wallet is connected.
                  </div>
                </div>
                <div className="rounded-[1rem] border border-[var(--terminal-border)] bg-black/10 px-4 py-3">
                  <div className="terminal-label">Sample only</div>
                  <div className="mt-2 text-sm text-[var(--terminal-muted)]">
                    Negotiation and swap stay clearly labeled as sample or agent-oriented flows until the live market and Base testnet swap path are stronger.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
