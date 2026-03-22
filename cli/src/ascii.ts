import type {
  DiscoveryProvidersResponse,
  ExecutionProvidersResponse,
  HealthCheck,
  Job,
  LocusToolsResponse,
  MachinePaymentsStatusResponse,
  NegotiationOffer,
  VendResult,
} from './types.js';

const WIDTH = 58;

function supportsColor(): boolean {
  return Boolean(process.stdout.isTTY && !process.env.NO_COLOR);
}

function tint(text: string, code: number): string {
  return supportsColor() ? `\x1b[${code}m${text}\x1b[0m` : text;
}

function pad(value: string, width: number): string {
  return value.length >= width ? value.slice(0, width) : `${value}${' '.repeat(width - value.length)}`;
}

function shorten(value: string, width: number): string {
  return value.length <= width ? value : `${value.slice(0, Math.max(0, width - 1))}~`;
}

function box(title: string, lines: string[]): string {
  return [
    `.${'-'.repeat(WIDTH + 2)}.`,
    `| ${pad(title, WIDTH)} |`,
    `|${'-'.repeat(WIDTH + 2)}|`,
    ...lines.map((line) => `| ${pad(shorten(line, WIDTH), WIDTH)} |`),
    `'${'-'.repeat(WIDTH + 2)}'`,
  ].join('\n');
}

function section(label: string, value: string): string {
  return `${pad(label, 18)} ${value}`;
}

function formatOffer(offer: NegotiationOffer, index: number): string {
  return `${index === 0 ? '>' : ' '} #${index + 1} ${shorten(offer.provider, 14)} ${pad(`${offer.priceUsdc.toFixed(3)}u`, 9)} ${pad(`${offer.deliveryHours}h`, 5)} rep ${offer.reputationScore}`;
}

export function renderBanner(): string {
  return tint(
    [
      '  ____             __ ____        _ __',
      ' / __ \\___  ____ _/ // __ \\____ _(_) /',
      '/ / / / _ \\/ __ `/ // /_/ / __ `/ / / ',
      '/ /_/ /  __/ /_/ / // _, _/ /_/ / / /  ',
      '\\____/\\___/\\__,_/_//_/ |_|\\__,_/_/_/   ',
      '',
      'machine procurement desk for agents and humans',
    ].join('\n'),
    36
  );
}

export function renderHelp(): string {
  return [
    renderBanner(),
    '',
    box('COMMAND DECK', [
      'dealrail help',
      'dealrail demo',
      'dealrail status [--json]',
      'dealrail scan <query> [--max-price 0.12] [--min-reputation 700]',
      'dealrail providers <query>',
      'dealrail vend <query> --budget 0.12 [--hours 24] [--queue]',
      'dealrail rails',
      'dealrail jobs [--limit 8]',
      'dealrail job <id>',
      '',
      'set DEALRAIL_API_URL or pass --api http://localhost:3001',
    ]),
  ].join('\n');
}

export function renderDemoFrame(step: number): string {
  const frames = [
    box('DEALRAIL / ROUTE REQUEST', [
      section('quest', 'benchmark report'),
      section('budget', '0.120 USDC'),
      section('deadline', '24h'),
      '',
      'demand posted to command deck',
      'provider radar spinning',
      '',
      'xp lane: route -> shortlist -> settle',
    ]),
    box('DEALRAIL / SHORTLIST', [
      section('market', '3 providers found'),
      section('best', '0.082 USDC'),
      section('mode', 'demo negotiation'),
      '',
      '> #1 provider alpha      0.082u   8h   rep 910',
      '  #2 provider beta       0.091u  12h   rep 860',
      '  #3 provider gamma      0.110u   6h   rep 790',
      '',
      'combo unlocked: price + reputation',
    ]),
    box('DEALRAIL / RECEIPT', [
      section('winner', 'provider alpha'),
      section('state', 'escrow-ready'),
      section('saved', '0.038 USDC'),
      '',
      'request routed',
      'settlement rail selected',
      '',
      'achievement: receipt-first procurement',
    ]),
  ];

  return `${renderBanner()}\n\n${frames[step % frames.length]}`;
}

export async function animateDemo(loops = 2, delayMs = 700): Promise<void> {
  process.stdout.write('\x1b[2J\x1b[?25l');

  try {
    for (let i = 0; i < loops; i += 1) {
      for (let step = 0; step < 3; step += 1) {
        process.stdout.write('\x1b[H');
        process.stdout.write(`${renderDemoFrame(step)}\n`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  } finally {
    process.stdout.write('\x1b[0m\x1b[?25h');
  }
}

export function renderStatus(status: HealthCheck): string {
  return [
    renderBanner(),
    '',
    box('SYSTEM STATUS', [
      section('backend', status.status),
      section('chain', `${status.blockchain.network ?? 'unknown'} (${status.blockchain.chainId})`),
      section('market', status.integrations?.x402nMockMode ? 'demo/mock' : 'live'),
      section('payments', status.integrations?.machinePaymentsPrimary ?? 'x402'),
      section('escrow', status.blockchain.escrowAddress),
      section('stablecoin', status.blockchain.usdcAddress),
    ]),
  ].join('\n');
}

export function renderProviders(result: DiscoveryProvidersResponse, query: string): string {
  const providers = result.providers.slice(0, 8);
  return [
    renderBanner(),
    '',
    box('PROVIDER RADAR', [
      section('query', query || 'all supply'),
      section('matches', String(result.providers.length)),
      '',
      ...providers.map((provider, index) =>
        `${index === 0 ? '>' : ' '} ${shorten(provider.serviceName, 20)} ${pad(`${provider.basePriceUsdc ?? 'n/a'}u`, 8)} rep ${pad(String(provider.reputationScore ?? 'n/a'), 4)} ${provider.source}`
      ),
      ...(providers.length === 0 ? ['no providers matched this request'] : []),
    ]),
  ].join('\n');
}

export function renderVend(result: VendResult): string {
  const best = result.bestOffer;
  const saved =
    best && result.request.budgetUsdc > best.priceUsdc ? (result.request.budgetUsdc - best.priceUsdc).toFixed(3) : null;

  return [
    renderBanner(),
    '',
    box('NEGOTIATION RUN', [
      section('query', result.request.query),
      section('budget', `${result.request.budgetUsdc.toFixed(3)} USDC`),
      section('delivery', `${result.request.maxDeliveryHours}h`),
      section('mode', result.negotiation.mode),
      section('offers', String(result.negotiation.offers.length)),
      section('winner', best ? shorten(best.provider, 24) : 'none'),
      ...(saved ? [section('saved', `${saved} USDC`)] : []),
      '',
      ...result.negotiation.offers.slice(0, 5).map(formatOffer),
      ...(result.queuedOpportunity ? ['', `queued opportunity ${result.queuedOpportunity.id}`] : []),
    ]),
  ].join('\n');
}

export function renderRails(
  execution: ExecutionProvidersResponse,
  locus: LocusToolsResponse,
  payments: MachinePaymentsStatusResponse
): string {
  const locusMode = Array.isArray(locus.tools) ? 'live' : locus.tools.mode ?? 'fallback';
  return [
    renderBanner(),
    '',
    box('RAIL BOARD', [
      section('payments', payments.primaryProvider),
      section('pay endpoints', String(payments.endpoints.length)),
      section('execution', String(execution.providers.length)),
      section('locus', locusMode),
      '',
      ...payments.providers.map((provider) => `${provider.id} :: ${provider.mode} :: ${provider.settlementModel}`),
      ...execution.providers.map((provider) => `${provider.id} :: ${provider.mode} :: ${provider.useCase}`),
    ]),
  ].join('\n');
}

export function renderJobs(jobs: Job[]): string {
  return [
    renderBanner(),
    '',
    box('JOB BOARD', [
      ...jobs.slice(0, 8).map((job) => `#${job.jobId} ${pad(job.state, 10)} ${pad(job.budget, 11)} ${shorten(job.provider, 18)}`),
      ...(jobs.length === 0 ? ['no jobs found'] : []),
    ]),
  ].join('\n');
}

export function renderJob(job: Job): string {
  return [
    renderBanner(),
    '',
    box(`JOB ${job.jobId}`, [
      section('state', job.state),
      section('budget', job.budget),
      section('provider', job.provider),
      section('evaluator', job.evaluator),
      section('expiry', job.expiry),
      section('explorer', job.explorerUrl),
    ]),
  ].join('\n');
}
