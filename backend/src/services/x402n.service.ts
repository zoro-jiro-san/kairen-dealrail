import { randomUUID } from 'crypto';
import { config } from '../config';

export type NetworkMode = 'demo' | 'testnet' | 'mainnet';

export interface NegotiationPolicy {
  serviceRequirement: string;
  maxBudgetUsdc: number;
  maxDeliveryHours: number;
  minReputationScore: number;
  auctionMode?: 'ranked' | 'reverse_auction';
  maxRounds?: number;
  batchSize?: number;
  autoCounterStepBps?: number;
  networkMode?: NetworkMode;
}

export interface ProviderOffer {
  offerId: string;
  provider: string;
  evaluator: string;
  priceUsdc: number;
  deliveryHours: number;
  reputationScore: number;
  confidence: number;
  score: number;
  terms: string;
  round: number;
  initialPriceUsdc: number;
}

export interface AuctionActivity {
  id: string;
  timestamp: string;
  type:
    | 'session_created'
    | 'offers_ranked'
    | 'counter_round'
    | 'offer_accepted'
    | 'batch_created'
    | 'deal_confirmed'
    | 'receipt_generated';
  message: string;
  data?: Record<string, unknown>;
}

export interface NegotiationBatch {
  batchId: string;
  offerIds: string[];
  createdAt: string;
  status: 'open' | 'confirmed';
}

export interface DealConfirmation {
  confirmationId: string;
  negotiationId: string;
  batchId: string;
  selectedOfferId: string;
  provider: string;
  evaluator: string;
  confirmedAt: string;
  expectedDeliveryHours: number;
}

export interface SavingsReceipt {
  receiptId: string;
  negotiationId: string;
  generatedAt: string;
  baselinePriceUsdc: number;
  settledPriceUsdc: number;
  savedUsdc: number;
  savedPct: number;
  networkMode: NetworkMode;
}

export interface NegotiationSession {
  negotiationId: string;
  createdAt: string;
  mode: 'mock' | 'live';
  policy: NegotiationPolicy;
  offers: ProviderOffer[];
  acceptedOfferId: string | null;
  auctionMode: 'ranked' | 'reverse_auction';
  roundsCompleted: number;
  maxRounds: number;
  batchSize: number;
  activities: AuctionActivity[];
  batches: NegotiationBatch[];
  confirmation: DealConfirmation | null;
  receipt: SavingsReceipt | null;
  baselineBestPriceUsdc: number | null;
}

const DEMO_PROVIDERS: Array<{
  provider: string;
  evaluator: string;
  basePrice: number;
  baseHours: number;
  reputation: number;
}> = [
  {
    provider: '0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF',
    evaluator: '0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2',
    basePrice: 0.09,
    baseHours: 20,
    reputation: 835,
  },
  {
    provider: '0x9f2B0f8d8A3f52f8444A9fc4b6c67Aaa4a84F26a',
    evaluator: '0x782D2a5fD77d001865fA425d995E7fd5Ce880332',
    basePrice: 0.11,
    baseHours: 14,
    reputation: 902,
  },
  {
    provider: '0x2365DBD6f08F3049f643F6385D0f0B6Ff14E0A1f',
    evaluator: '0xAc5E2f0E2E6f66F8f02E8A53b8D4d367a28d9f80',
    basePrice: 0.08,
    baseHours: 28,
    reputation: 768,
  },
];

class X402nService {
  private sessions = new Map<string, NegotiationSession>();

  async createNegotiation(policy: NegotiationPolicy): Promise<NegotiationSession> {
    const normalizedPolicy: NegotiationPolicy = {
      ...policy,
      auctionMode: policy.auctionMode ?? 'reverse_auction',
      maxRounds: Math.min(Math.max(policy.maxRounds ?? 3, 1), 10),
      batchSize: Math.min(Math.max(policy.batchSize ?? 2, 1), 8),
      autoCounterStepBps: Math.min(Math.max(policy.autoCounterStepBps ?? 500, 50), 2000),
      networkMode: policy.networkMode ?? 'testnet',
    };

    if (!config.x402n.mockMode) {
      const liveSession = await this.tryCreateLiveNegotiation(normalizedPolicy);
      if (liveSession) {
        const enriched = this.bootstrapSession(liveSession);
        this.sessions.set(enriched.negotiationId, enriched);
        return enriched;
      }
    }

    const mockSession = this.bootstrapSession(this.createMockNegotiation(normalizedPolicy));
    this.sessions.set(mockSession.negotiationId, mockSession);
    return mockSession;
  }

  getNegotiation(negotiationId: string): NegotiationSession | null {
    return this.sessions.get(negotiationId) ?? null;
  }

  getActivities(negotiationId: string, limit = 50): AuctionActivity[] {
    const session = this.sessions.get(negotiationId);
    if (!session) return [];
    return session.activities.slice(0, Math.max(1, Math.min(limit, 200)));
  }

  runCounterRound(negotiationId: string): NegotiationSession | null {
    const session = this.sessions.get(negotiationId);
    if (!session) return null;

    if (session.auctionMode !== 'reverse_auction' || session.roundsCompleted >= session.maxRounds) {
      return session;
    }

    const bps = session.policy.autoCounterStepBps ?? 500;
    const nextRound = session.roundsCompleted + 1;

    const updatedOffers = session.offers
      .map((offer, idx) => {
        const aggressivenessBps = bps + idx * 40;
        const nextPrice = Number((offer.priceUsdc * (1 - aggressivenessBps / 10_000)).toFixed(4));
        const priceUsdc = Math.max(0.0001, nextPrice);

        const budgetScore = Math.max(0, 1 - priceUsdc / Math.max(session.policy.maxBudgetUsdc, 0.01));
        const latencyScore = Math.max(0, 1 - offer.deliveryHours / Math.max(session.policy.maxDeliveryHours, 1));
        const reputationScore = Math.max(0, offer.reputationScore / 1000);

        return {
          ...offer,
          priceUsdc,
          round: nextRound,
          score: Number((budgetScore * 0.5 + latencyScore * 0.2 + reputationScore * 0.3).toFixed(3)),
        };
      })
      .sort((a, b) => b.score - a.score);

    const updated = {
      ...session,
      roundsCompleted: nextRound,
      offers: updatedOffers,
    };

    this.recordActivity(updated, 'counter_round', `Reverse auction round ${nextRound} executed`, {
      round: nextRound,
      offers: updatedOffers.length,
      lowestPriceUsdc: updatedOffers.length > 0 ? updatedOffers[updatedOffers.length - 1].priceUsdc : null,
      bestPriceUsdc: updatedOffers.length > 0 ? updatedOffers[0].priceUsdc : null,
    });

    this.sessions.set(negotiationId, updated);
    return updated;
  }

  acceptOffer(negotiationId: string, offerId: string): NegotiationSession | null {
    const session = this.sessions.get(negotiationId);
    if (!session) return null;

    const acceptedOffer = session.offers.find((offer) => offer.offerId === offerId);
    if (!acceptedOffer) return null;

    const updated: NegotiationSession = {
      ...session,
      acceptedOfferId: offerId,
    };

    this.recordActivity(updated, 'offer_accepted', `Offer ${offerId} accepted for batching`, {
      offerId,
      priceUsdc: acceptedOffer.priceUsdc,
      provider: acceptedOffer.provider,
    });

    this.sessions.set(negotiationId, updated);
    return updated;
  }

  createBatch(negotiationId: string, requestedOfferIds?: string[]): {
    session: NegotiationSession;
    batch: NegotiationBatch;
  } | null {
    const session = this.sessions.get(negotiationId);
    if (!session) return null;

    const set = new Set(requestedOfferIds ?? []);
    const chosen = session.offers
      .filter((offer) => (set.size > 0 ? set.has(offer.offerId) : true))
      .slice(0, session.batchSize)
      .map((offer) => offer.offerId);

    if (chosen.length === 0) return null;

    const batch: NegotiationBatch = {
      batchId: `batch_${randomUUID().slice(0, 8)}`,
      offerIds: chosen,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    const updated = {
      ...session,
      batches: [batch, ...session.batches],
    };

    this.recordActivity(updated, 'batch_created', `Offer batch ${batch.batchId} created`, {
      batchId: batch.batchId,
      offerCount: chosen.length,
      offerIds: chosen,
    });

    this.sessions.set(negotiationId, updated);
    return { session: updated, batch };
  }

  confirmBatch(
    negotiationId: string,
    batchId: string,
    selectedOfferId?: string
  ): {
    session: NegotiationSession;
    confirmation: DealConfirmation;
    receipt: SavingsReceipt;
    selectedOffer: ProviderOffer;
  } | null {
    const session = this.sessions.get(negotiationId);
    if (!session) return null;

    const batch = session.batches.find((row) => row.batchId === batchId);
    if (!batch) return null;

    const candidates = session.offers.filter((offer) => batch.offerIds.includes(offer.offerId));
    if (candidates.length === 0) return null;

    const selected =
      candidates.find((offer) => offer.offerId === selectedOfferId) ??
      candidates.find((offer) => offer.offerId === session.acceptedOfferId) ??
      [...candidates].sort((a, b) => b.score - a.score)[0];

    const confirmedAt = new Date().toISOString();
    const confirmation: DealConfirmation = {
      confirmationId: `cnf_${randomUUID().slice(0, 8)}`,
      negotiationId,
      batchId,
      selectedOfferId: selected.offerId,
      provider: selected.provider,
      evaluator: selected.evaluator,
      confirmedAt,
      expectedDeliveryHours: selected.deliveryHours,
    };

    const baseline = session.baselineBestPriceUsdc ?? selected.initialPriceUsdc;
    const settledPrice = selected.priceUsdc;
    const savedUsdc = Number(Math.max(0, baseline - settledPrice).toFixed(6));
    const savedPct = baseline > 0 ? Number(((savedUsdc / baseline) * 100).toFixed(2)) : 0;

    const receipt: SavingsReceipt = {
      receiptId: `rcpt_${randomUUID().slice(0, 8)}`,
      negotiationId,
      generatedAt: confirmedAt,
      baselinePriceUsdc: baseline,
      settledPriceUsdc: settledPrice,
      savedUsdc,
      savedPct,
      networkMode: session.policy.networkMode ?? 'testnet',
    };

    const updatedBatches = session.batches.map((row) =>
      row.batchId === batchId ? { ...row, status: 'confirmed' as const } : row
    );

    const updated: NegotiationSession = {
      ...session,
      acceptedOfferId: selected.offerId,
      batches: updatedBatches,
      confirmation,
      receipt,
    };

    this.recordActivity(updated, 'deal_confirmed', `Deal confirmed from batch ${batchId}`, {
      confirmationId: confirmation.confirmationId,
      selectedOfferId: selected.offerId,
      provider: selected.provider,
      priceUsdc: selected.priceUsdc,
    });

    this.recordActivity(updated, 'receipt_generated', 'Savings receipt generated', {
      receiptId: receipt.receiptId,
      savedUsdc: receipt.savedUsdc,
      savedPct: receipt.savedPct,
    });

    this.sessions.set(negotiationId, updated);
    return {
      session: updated,
      confirmation,
      receipt,
      selectedOffer: selected,
    };
  }

  getReceipt(negotiationId: string): SavingsReceipt | null {
    const session = this.sessions.get(negotiationId);
    return session?.receipt ?? null;
  }

  private createMockNegotiation(policy: NegotiationPolicy): NegotiationSession {
    const negotiationId = `neg_${randomUUID().slice(0, 8)}`;

    const offers = DEMO_PROVIDERS
      .map((provider, idx) => {
        const price = Number((provider.basePrice + idx * 0.005).toFixed(3));
        const delivery = provider.baseHours + idx * 2;
        const reputation = provider.reputation;
        const confidence = Number((0.78 + idx * 0.06).toFixed(2));

        const budgetScore = Math.max(0, 1 - price / Math.max(policy.maxBudgetUsdc, 0.01));
        const latencyScore = Math.max(0, 1 - delivery / Math.max(policy.maxDeliveryHours, 1));
        const reputationScore = Math.max(0, reputation / 1000);
        const composite = Number(
          (budgetScore * 0.45 + latencyScore * 0.25 + reputationScore * 0.3).toFixed(3)
        );

        return {
          offerId: `offer_${idx + 1}`,
          provider: provider.provider,
          evaluator: provider.evaluator,
          priceUsdc: price,
          deliveryHours: delivery,
          reputationScore: reputation,
          confidence,
          score: composite,
          terms: `${policy.serviceRequirement} | ${delivery}h SLA | dispute via evaluator`,
          round: 0,
          initialPriceUsdc: price,
        } satisfies ProviderOffer;
      })
      .filter((offer) => offer.reputationScore >= policy.minReputationScore)
      .sort((a, b) => b.score - a.score);

    return {
      negotiationId,
      createdAt: new Date().toISOString(),
      mode: 'mock',
      policy,
      offers,
      acceptedOfferId: null,
      auctionMode: policy.auctionMode ?? 'reverse_auction',
      roundsCompleted: 0,
      maxRounds: policy.maxRounds ?? 3,
      batchSize: policy.batchSize ?? 2,
      activities: [],
      batches: [],
      confirmation: null,
      receipt: null,
      baselineBestPriceUsdc: null,
    };
  }

  private async tryCreateLiveNegotiation(
    policy: NegotiationPolicy
  ): Promise<NegotiationSession | null> {
    if (!config.x402n.apiKey) {
      return null;
    }

    try {
      const response = await fetch(`${config.x402n.baseUrl}/rfos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `ApiKey ${config.x402n.apiKey}`,
        },
        body: JSON.stringify({
          title: `DealRail RFO: ${policy.serviceRequirement.slice(0, 40)}`,
          description: `${policy.serviceRequirement}. Generated by DealRail bridge.`,
          category_id: process.env.X402N_CATEGORY_ID,
          requirements: { summary: policy.serviceRequirement },
          expected_deliverables: { type: 'digital-deliverable' },
          max_price_usdc: policy.maxBudgetUsdc.toFixed(8),
          preferred_delivery_time: policy.maxDeliveryHours * 3600,
          deadline_hours: Math.min(Math.max(policy.maxDeliveryHours, 1), 168),
          preferred_chains: ['base'],
          allow_counter_offers: true,
          auto_accept_lowest: false,
          min_provider_reputation: (policy.minReputationScore / 1000).toFixed(8),
          metadata: { source: 'dealrail' },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as {
        id?: string;
      };
      if (!body.id) {
        return null;
      }

      const offersResponse = await fetch(`${config.x402n.baseUrl}/rfos/${body.id}/offers/ranked`, {
        headers: {
          Authorization: `ApiKey ${config.x402n.apiKey}`,
        },
      });

      if (!offersResponse.ok) {
        return null;
      }

      const offersBody = (await offersResponse.json()) as Array<{
        id: string;
        provider_name?: string;
        proposed_price_usdc?: string;
        proposed_delivery_time?: number;
        provider_reputation?: number;
        rank_score?: number;
      }>;

      const offers: ProviderOffer[] = offersBody.map((offer, idx) => {
        const price = Number(offer.proposed_price_usdc ?? '0');
        return {
          offerId: offer.id,
          provider: offer.provider_name ?? `provider-${idx + 1}`,
          evaluator: '0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2',
          priceUsdc: price,
          deliveryHours: Math.ceil((offer.proposed_delivery_time ?? 3600) / 3600),
          reputationScore: Math.round((offer.provider_reputation ?? 0.75) * 1000),
          confidence: 0.8,
          score: Number(offer.rank_score ?? 0),
          terms: 'Live offer from x402n ranked endpoint',
          round: 0,
          initialPriceUsdc: price,
        };
      });

      return {
        negotiationId: body.id,
        createdAt: new Date().toISOString(),
        mode: 'live',
        policy,
        offers,
        acceptedOfferId: null,
        auctionMode: policy.auctionMode ?? 'reverse_auction',
        roundsCompleted: 0,
        maxRounds: policy.maxRounds ?? 3,
        batchSize: policy.batchSize ?? 2,
        activities: [],
        batches: [],
        confirmation: null,
        receipt: null,
        baselineBestPriceUsdc: null,
      };
    } catch {
      return null;
    }
  }

  private bootstrapSession(session: NegotiationSession): NegotiationSession {
    const baselineBestPriceUsdc =
      session.offers.length > 0
        ? [...session.offers].sort((a, b) => a.priceUsdc - b.priceUsdc)[0].priceUsdc
        : null;

    const result = {
      ...session,
      baselineBestPriceUsdc,
      activities: [...session.activities],
    };

    this.recordActivity(result, 'session_created', 'Negotiation session created', {
      auctionMode: result.auctionMode,
      networkMode: result.policy.networkMode ?? 'testnet',
      offers: result.offers.length,
    });
    this.recordActivity(result, 'offers_ranked', 'Initial ranked offers ready', {
      topOfferId: result.offers[0]?.offerId ?? null,
      topScore: result.offers[0]?.score ?? null,
      topPriceUsdc: result.offers[0]?.priceUsdc ?? null,
    });

    return result;
  }

  private recordActivity(
    session: NegotiationSession,
    type: AuctionActivity['type'],
    message: string,
    data?: Record<string, unknown>
  ) {
    const event: AuctionActivity = {
      id: `evt_${randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
    };

    session.activities = [event, ...session.activities].slice(0, 200);
  }
}

export const x402nService = new X402nService();
