#!/usr/bin/env node

import { animateDemo, renderHelp, renderJob, renderJobs, renderProviders, renderRails, renderStatus, renderVend } from './ascii.js';
import { DealRailClient } from './client.js';
import type { VendResult } from './types.js';

type FlagMap = Record<string, string | boolean>;

function parseArgs(argv: string[]): { command: string; flags: FlagMap; positionals: string[] } {
  const [command = 'help', ...rest] = argv;
  const flags: FlagMap = {};
  const positionals: string[] = [];

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token?.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith('--')) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    i += 1;
  }

  return { command, flags, positionals };
}

function readString(flags: FlagMap, key: string): string | undefined {
  const value = flags[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(flags: FlagMap, key: string): number | undefined {
  const value = readString(flags, key);
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`--${key} must be a number`);
  }
  return parsed;
}

function readBoolean(flags: FlagMap, key: string): boolean {
  const value = flags[key];
  return value === true || value === 'true';
}

function stringify(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function resolveApiBase(flags: FlagMap): string {
  return readString(flags, 'api') || process.env.DEALRAIL_API_URL || 'http://localhost:3001';
}

function queryFrom(positionals: string[], fallback?: string): string {
  return positionals.join(' ').trim() || fallback || '';
}

async function run(): Promise<void> {
  const { command, flags, positionals } = parseArgs(process.argv.slice(2));
  const json = readBoolean(flags, 'json');
  const client = new DealRailClient(resolveApiBase(flags));

  switch (command) {
    case 'help':
      process.stdout.write(`${renderHelp()}\n`);
      return;

    case 'demo':
      await animateDemo(readNumber(flags, 'loops') ?? 2, readNumber(flags, 'delay') ?? 700);
      return;

    case 'status': {
      const status = await client.health();
      process.stdout.write(json ? stringify(status) : `${renderStatus(status)}\n`);
      return;
    }

    case 'scan':
    case 'providers': {
      const query = queryFrom(positionals, readString(flags, 'query'));
      const result = await client.listProviders({
        query: query || undefined,
        minReputation: readNumber(flags, 'min-reputation'),
        maxBasePriceUsdc: readNumber(flags, 'max-price'),
        sources: readString(flags, 'sources'),
      });
      process.stdout.write(json ? stringify(result) : `${renderProviders(result, query)}\n`);
      return;
    }

    case 'vend': {
      const query = queryFrom(positionals, readString(flags, 'query'));
      const budget = readNumber(flags, 'budget');

      if (!query) throw new Error('vend requires a query');
      if (typeof budget !== 'number') throw new Error('vend requires --budget');

      const negotiation = await client.createNegotiation({
        serviceRequirement: query,
        maxBudgetUsdc: budget,
        maxDeliveryHours: readNumber(flags, 'hours') ?? 24,
        minReputationScore: readNumber(flags, 'min-reputation') ?? 700,
        auctionMode: (readString(flags, 'auction') as 'ranked' | 'reverse_auction' | undefined) ?? 'reverse_auction',
        maxRounds: readNumber(flags, 'rounds') ?? 3,
        batchSize: readNumber(flags, 'batch-size') ?? 2,
        autoCounterStepBps: readNumber(flags, 'counter-step-bps') ?? 500,
        networkMode: (readString(flags, 'network') as 'demo' | 'testnet' | 'mainnet' | undefined) ?? 'demo',
      });

      let queuedOpportunity = null;
      if (negotiation.offers.length === 0 && readBoolean(flags, 'queue')) {
        const queued = await client.createOpportunity({
          requestText: query,
          normalizedQuery: query,
          maxBudgetUsdc: budget,
          maxDeliveryHours: readNumber(flags, 'hours') ?? 24,
          matchesAtCreate: 0,
          source: 'api',
        });
        queuedOpportunity = queued.opportunity;
      }

      const result: VendResult = {
        request: {
          query,
          budgetUsdc: budget,
          maxDeliveryHours: readNumber(flags, 'hours') ?? 24,
          minReputationScore: readNumber(flags, 'min-reputation') ?? 700,
        },
        negotiation,
        bestOffer: negotiation.offers[0] ?? null,
        queuedOpportunity,
      };

      process.stdout.write(json ? stringify(result) : `${renderVend(result)}\n`);
      return;
    }

    case 'rails': {
      const [execution, locus, payments] = await Promise.all([
        client.listExecutionProviders(),
        client.listLocusTools(),
        client.machinePaymentsStatus(),
      ]);
      process.stdout.write(json ? stringify({ execution, locus, payments }) : `${renderRails(execution, locus, payments)}\n`);
      return;
    }

    case 'jobs': {
      const result = await client.listJobs(readNumber(flags, 'limit') ?? 8);
      process.stdout.write(json ? stringify(result) : `${renderJobs(result.jobs)}\n`);
      return;
    }

    case 'job': {
      const raw = positionals[0] || readString(flags, 'id');
      const id = Number(raw);
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error('job requires a positive numeric id');
      }
      const job = await client.getJob(id);
      process.stdout.write(json ? stringify(job) : `${renderJob(job)}\n`);
      return;
    }

    default:
      process.stdout.write(`${renderHelp()}\n`);
  }
}

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
