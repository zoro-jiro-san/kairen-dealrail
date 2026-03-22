export type HealthCheck = {
  status: string;
  timestamp: string;
  blockchain: {
    network?: string;
    chainId: number;
    escrowAddress: string;
    usdcAddress: string;
  };
  integrations?: {
    x402nMockMode?: boolean;
    x402nBaseUrl?: string;
    machinePaymentsPrimary?: string;
  };
};

export type ProviderCandidate = {
  providerAddress: string;
  evaluatorAddress: string;
  source: 'x402n' | 'virtuals' | 'near' | 'mock' | 'imported';
  serviceId: string | null;
  serviceName: string;
  description: string;
  endpoint: string | null;
  basePriceUsdc: string | null;
  reputationScore: number | null;
  erc8004AgentId: string | null;
  erc8004Registered: boolean;
};

export type DiscoveryProvidersResponse = {
  success: boolean;
  useCase: string;
  providers: ProviderCandidate[];
};

export type DiscoverySourcesResponse = {
  success: boolean;
  neutral: boolean;
  sources: Array<{ id: string; enabled: boolean }>;
};

export type ExecutionProvidersResponse = {
  success: boolean;
  neutral: boolean;
  providers: Array<{ id: string; mode: string; useCase: string }>;
};

export type LocusToolsResponse = {
  success: boolean;
  tools:
    | {
        mode?: 'mock' | 'live' | 'fallback';
        tools?: Array<{ name?: string; description?: string }>;
        error?: string;
      }
    | Array<{ name?: string; description?: string }>;
};

export type MachinePaymentsStatusResponse = {
  success: boolean;
  primaryProvider: string;
  providers: Array<{
    id: string;
    mode: string;
    settlementModel: string;
    useCase: string;
  }>;
  useCase: string;
  endpoints: string[];
};

export type JobsListResponse = {
  jobs: Job[];
  pagination?: {
    limit: number;
    totalOnchain: number;
  };
};

export type Job = {
  jobId: number;
  client: string;
  provider: string;
  evaluator: string;
  budget: string;
  budgetRaw: string;
  expiry: string;
  state: string;
  stateCode: number;
  deliverable: string;
  hook: string;
  explorerUrl: string;
};

export type NegotiationOffer = {
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
};

export type NegotiationActivity = {
  id: string;
  timestamp: string;
  type: string;
  message: string;
};

export type NegotiationBatch = {
  batchId: string;
  offerIds: string[];
  createdAt: string;
  status: 'open' | 'confirmed';
};

export type DealConfirmation = {
  confirmationId: string;
  negotiationId: string;
  batchId: string;
  selectedOfferId: string;
  provider: string;
  evaluator: string;
  confirmedAt: string;
  expectedDeliveryHours: number;
};

export type SavingsReceipt = {
  receiptId: string;
  negotiationId: string;
  generatedAt: string;
  baselinePriceUsdc: number;
  settledPriceUsdc: number;
  savedUsdc: number;
  savedPct: number;
  networkMode: 'demo' | 'testnet' | 'mainnet';
};

export type NegotiationSession = {
  negotiationId: string;
  createdAt: string;
  mode: 'mock' | 'live';
  auctionMode: 'ranked' | 'reverse_auction';
  roundsCompleted: number;
  maxRounds: number;
  batchSize: number;
  offers: NegotiationOffer[];
  activities: NegotiationActivity[];
  batches: NegotiationBatch[];
  confirmation: DealConfirmation | null;
  receipt: SavingsReceipt | null;
  baselineBestPriceUsdc: number | null;
  acceptedOfferId: string | null;
};

export type CreateNegotiationPayload = {
  serviceRequirement: string;
  maxBudgetUsdc: number;
  maxDeliveryHours: number;
  minReputationScore: number;
  auctionMode?: 'ranked' | 'reverse_auction';
  maxRounds?: number;
  batchSize?: number;
  autoCounterStepBps?: number;
  networkMode?: 'demo' | 'testnet' | 'mainnet';
};

export type Opportunity = {
  id: string;
  createdAt: string;
  status: 'open' | 'matched' | 'archived';
  source: 'terminal' | 'api';
  requestText: string;
  normalizedQuery: string;
  maxBudgetUsdc: number | null;
  maxDeliveryHours: number | null;
  matchesAtCreate: number;
};

export type VendResult = {
  request: {
    query: string;
    budgetUsdc: number;
    maxDeliveryHours: number;
    minReputationScore: number;
  };
  negotiation: NegotiationSession;
  bestOffer: NegotiationOffer | null;
  queuedOpportunity?: Opportunity | null;
};
