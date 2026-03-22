/**
 * API client for DealRail backend (Simplified Mode)
 *
 * This client connects to the simplified backend that reads directly from blockchain.
 * No database - all data comes from on-chain state.
 */
import axios from 'axios';

const COMPILED_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();
const PRODUCTION_API_URL = 'https://kairen-dealrail-production.up.railway.app';

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getApiOrigin() {
  if (typeof window !== 'undefined') {
    const browserDefault = `${window.location.protocol}//${window.location.hostname}:3001`;
    const productionDefault = PRODUCTION_API_URL;

    if (!COMPILED_API_URL) {
      return isLocalHostname(window.location.hostname) ? browserDefault : productionDefault;
    }

    try {
      const parsed = new URL(COMPILED_API_URL, window.location.origin);
      if (
        isLocalHostname(window.location.hostname) &&
        parsed.hostname === window.location.hostname &&
        parsed.port === window.location.port
      ) {
        return browserDefault;
      }
      return parsed.toString().replace(/\/$/, '');
    } catch {
      return isLocalHostname(window.location.hostname) ? browserDefault : productionDefault;
    }
  }

  return COMPILED_API_URL || PRODUCTION_API_URL;
}

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = `${getApiOrigin()}/api/v1`;
  return config;
});

// ============ Types (matching simplified API response) ============

export interface Job {
  jobId: number;
  chain: 'baseSepolia' | 'celoSepolia';
  chainId: number;
  client: string;
  provider: string;
  evaluator: string;
  budget: string; // Formatted string like "0.1 USDC"
  budgetRaw: string; // Raw value as string
  expiry: string; // ISO datetime string
  state: string; // "Open", "Funded", "Submitted", "Completed", "Rejected", "Expired"
  stateCode: number; // 0-5
  deliverable: string; // Bytes32 hash
  hook: string; // Address
  stablecoinAddress: string;
  explorerBaseUrl: string;
  explorerUrl: string; // BaseScan URL
}

export interface JobsListResponse {
  jobs: Job[];
  pagination: {
    limit: number;
    totalOnchain: number;
  };
}

export interface NegotiationPolicy {
  serviceRequirement: string;
  maxBudgetUsdc: number;
  maxDeliveryHours: number;
  minReputationScore: number;
  auctionMode?: 'ranked' | 'reverse_auction';
  maxRounds?: number;
  batchSize?: number;
  autoCounterStepBps?: number;
  networkMode?: 'demo' | 'testnet' | 'mainnet';
}

export interface NegotiationOffer {
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
  networkMode: 'demo' | 'testnet' | 'mainnet';
}

export interface NegotiationActivity {
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

export interface NegotiationSession {
  negotiationId: string;
  createdAt: string;
  mode: 'mock' | 'live';
  policy: NegotiationPolicy;
  offers: NegotiationOffer[];
  acceptedOfferId: string | null;
  auctionMode: 'ranked' | 'reverse_auction';
  roundsCompleted: number;
  maxRounds: number;
  batchSize: number;
  activities: NegotiationActivity[];
  batches: NegotiationBatch[];
  confirmation: DealConfirmation | null;
  receipt: SavingsReceipt | null;
  baselineBestPriceUsdc: number | null;
}

export interface ProviderCandidate {
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
}

export interface DemandOpportunity {
  id: string;
  createdAt: string;
  status: 'open' | 'matched' | 'archived';
  source: 'terminal' | 'api';
  requestText: string;
  normalizedQuery: string;
  maxBudgetUsdc: number | null;
  maxDeliveryHours: number | null;
  matchesAtCreate: number;
}

export interface CreateJobRequest {
  provider: string;
  evaluator: string;
  expiryDays: number;
}

export interface FundJobRequest {
  amount: string; // In USDC (e.g., "0.1")
}

export interface SubmitDeliverableRequest {
  deliverable: string; // Bytes32 hash
}

export interface CompleteJobRequest {
  reason: string; // Bytes32 hash or string
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  blockchain: {
    network: 'baseSepolia' | 'celoSepolia';
    chainId: number;
    escrowAddress: string;
    usdcAddress: string;
  };
  supportedChains?: Array<{
    chain: 'baseSepolia' | 'celoSepolia';
    chainId: number;
    escrowAddress: string;
    stablecoinAddress: string;
    stablecoinSymbol: string;
    explorerBaseUrl: string;
  }>;
  integrations?: {
    x402nMockMode?: boolean;
    x402nBaseUrl?: string;
    machinePaymentsPrimary?: string;
  };
}

export interface JobSimulationResponse {
  success: boolean;
  action: 'createJob' | 'fundJob' | 'submitDeliverable' | 'completeJob' | 'rejectJob' | 'claimRefund';
  simulation: {
    chain: 'baseSepolia' | 'celoSepolia';
    chainId: number;
    escrowAddress: string;
    stablecoinAddress: string;
    stablecoinSymbol: string;
    explorerBaseUrl: string;
    ok: boolean;
    warnings: string[];
    transactions: Array<{
      kind: string;
      to: string;
      data: string;
      value: string;
      from?: string;
      gasEstimate: string | null;
      explorerUrl: string;
    }>;
  };
}

export interface MachinePaymentsStatusResponse {
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
}

export interface BaseAgentServiceSurface {
  id: 'provider_directory' | 'opportunity_board' | 'x402_proxy' | 'job_board' | 'post_settlement_routing';
  name: string;
  method: 'GET' | 'POST' | 'GET/POST';
  endpoint: string;
  access: 'public' | 'preview';
  settlementModel: string;
  useCase: string;
}

export interface BaseAgentServicePreview {
  serviceName: string;
  description: string;
  source: 'x402n' | 'virtuals' | 'near' | 'mock' | 'imported';
  endpoint: string | null;
  basePriceUsdc: string | null;
  providerAddress: string;
  reputationScore: number | null;
  erc8004Registered: boolean;
  erc8004AgentId: string | null;
}

export interface BaseAgentServicesResponse {
  success: true;
  track: 'base-agent-services';
  generatedAt: string;
  catalogMode: 'curated_demo' | 'live_blended';
  chain: 'baseSepolia';
  chainId: number;
  settlementRail: {
    escrowAddress: string;
    stablecoinAddress: string;
    stablecoinSymbol: string;
    explorerBaseUrl: string;
    explorerUrl: string;
  };
  discovery: {
    providerCount: number;
    liveProviderCount: number;
    mockProviderCount: number;
  };
  paymentModels: string[];
  publicSurfaces: BaseAgentServiceSurface[];
  supplyPreview: BaseAgentServicePreview[];
  executionProviders: Array<{ id: string; mode: string; useCase: string }>;
  notes: string[];
}

// ============ API Functions ============

export const jobsApi = {
  /**
   * List recent jobs from chain
   */
  list: async (params?: { limit?: number; chain?: 'baseSepolia' | 'celoSepolia' }): Promise<JobsListResponse> => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  /**
   * Get job details by on-chain job ID
   * Reads directly from blockchain via backend
   */
  getByJobId: async (jobId: number, params?: { chain?: 'baseSepolia' | 'celoSepolia' }): Promise<Job> => {
    try {
      const response = await api.get(`/jobs/${jobId}`, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Job #${jobId} not found on chain`);
      }
      throw error;
    }
  },

  /**
   * Get multiple jobs by their IDs
   * Helper function to batch fetch jobs
   */
  getMultipleJobs: async (jobIds: number[], params?: { chain?: 'baseSepolia' | 'celoSepolia' }): Promise<Job[]> => {
    const promises = jobIds.map((id) => jobsApi.getByJobId(id, params).catch(() => null));
    const results = await Promise.all(promises);
    return results.filter((job): job is Job => job !== null);
  },

  /**
   * Create a new job (via backend proxy)
   * Backend will sign and submit the transaction
   */
  createJob: async (data: CreateJobRequest): Promise<{ jobId: number; txHash: string }> => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  /**
   * Fund a job (via backend proxy)
   * Backend will handle USDC approval and transfer
   */
  fundJob: async (jobId: number, data: FundJobRequest): Promise<{ txHash: string }> => {
    const response = await api.post(`/jobs/${jobId}/fund`, data);
    return response.data;
  },

  /**
   * Submit deliverable (via backend proxy)
   */
  submitDeliverable: async (jobId: number, data: SubmitDeliverableRequest): Promise<{ txHash: string }> => {
    const response = await api.post(`/jobs/${jobId}/submit`, data);
    return response.data;
  },

  /**
   * Complete job (via backend proxy)
   */
  completeJob: async (jobId: number, data: CompleteJobRequest): Promise<{ txHash: string }> => {
    const response = await api.post(`/jobs/${jobId}/complete`, data);
    return response.data;
  },

  simulateAction: async (
    payload:
      | {
          action: 'createJob';
          chain?: 'baseSepolia' | 'celoSepolia';
          from?: string;
          provider: string;
          evaluator: string;
          expiryUnix: number;
          hook?: string;
        }
      | {
          action: 'fundJob';
          chain?: 'baseSepolia' | 'celoSepolia';
          from?: string;
          jobId: number;
          amountUsdc: string;
        }
      | {
          action: 'submitDeliverable';
          chain?: 'baseSepolia' | 'celoSepolia';
          from?: string;
          jobId: number;
          deliverable: string;
        }
      | {
          action: 'completeJob' | 'rejectJob';
          chain?: 'baseSepolia' | 'celoSepolia';
          from?: string;
          jobId: number;
          reason?: string;
        }
      | {
          action: 'claimRefund';
          chain?: 'baseSepolia' | 'celoSepolia';
          from?: string;
          jobId: number;
        }
  ): Promise<JobSimulationResponse> => {
    const response = await api.post('/jobs/simulate', payload);
    return response.data;
  },
};

export const x402nApi = {
  createRfo: async (policy: NegotiationPolicy): Promise<NegotiationSession> => {
    const response = await api.post('/x402n/rfos', policy);
    return response.data;
  },
  getRfo: async (negotiationId: string): Promise<NegotiationSession> => {
    const response = await api.get(`/x402n/rfos/${negotiationId}`);
    return response.data;
  },
  acceptOffer: async (
    negotiationId: string,
    offerId: string
  ): Promise<{
    negotiation: NegotiationSession;
    acceptedOffer: NegotiationOffer | null;
    dealBlueprint: {
      provider: string;
      evaluator: string;
      budgetUsdc: number;
      expectedDeliveryHours: number;
    } | null;
  }> => {
    const response = await api.post(`/x402n/offers/${offerId}/accept`, { negotiationId });
    return response.data;
  },
  runCounterRound: async (negotiationId: string): Promise<{
    success: boolean;
    roundsCompleted: number;
    maxRounds: number;
    bestOffer: NegotiationOffer | null;
    negotiation: NegotiationSession;
  }> => {
    const response = await api.post(`/x402n/rfos/${negotiationId}/counter`);
    return response.data;
  },
  createBatch: async (
    negotiationId: string,
    offerIds?: string[]
  ): Promise<{ success: boolean; batch: NegotiationBatch; negotiation: NegotiationSession }> => {
    const response = await api.post(`/x402n/rfos/${negotiationId}/batch`, { offerIds });
    return response.data;
  },
  confirmBatch: async (
    negotiationId: string,
    batchId: string,
    selectedOfferId?: string
  ): Promise<{
    success: boolean;
    confirmation: DealConfirmation;
    selectedOffer: NegotiationOffer;
    receipt: SavingsReceipt;
    negotiation: NegotiationSession;
  }> => {
    const response = await api.post(`/x402n/rfos/${negotiationId}/confirm`, { batchId, selectedOfferId });
    return response.data;
  },
  getReceipt: async (negotiationId: string): Promise<{ success: boolean; receipt: SavingsReceipt }> => {
    const response = await api.get(`/x402n/rfos/${negotiationId}/receipt`);
    return response.data;
  },
  getActivities: async (
    negotiationId: string,
    limit = 50
  ): Promise<{ success: boolean; negotiationId: string; activities: NegotiationActivity[] }> => {
    const response = await api.get(`/x402n/rfos/${negotiationId}/activities`, { params: { limit } });
    return response.data;
  },
};

export const integrationsApi = {
  getBaseAgentServices: async (): Promise<BaseAgentServicesResponse> => {
    const response = await api.get('/base/agent-services');
    return response.data;
  },
  buildUniswapApproveTx: async (payload: { token: 'USDC' | 'WETH'; amount: string }) => {
    const response = await api.post('/integrations/uniswap/build-approve-tx', payload);
    return response.data;
  },
  buildUniswapSwapTx: async (payload: {
    tokenIn: 'USDC' | 'WETH';
    tokenOut: 'USDC' | 'WETH';
    amountIn: string;
    amountOutMinimum: string;
    fee: number;
    recipient: string;
  }) => {
    const response = await api.post('/integrations/uniswap/build-swap-tx', payload);
    return response.data;
  },
  buildPostSettlementSwapTxs: async (
    jobId: number,
    params?: { chain?: 'baseSepolia' | 'celoSepolia'; tokenOut?: 'USDC' | 'WETH'; fee?: number; slippageBps?: number }
  ) => {
    const response = await api.get(`/integrations/uniswap/post-settlement/${jobId}`, { params });
    return response.data;
  },
  sendLocusUsdc: async (payload: {
    fromAgentId: string;
    toAddress: string;
    amountUsdc: string;
    chain: 'base' | 'base-sepolia' | 'celo' | 'celo-sepolia';
    memo?: string;
  }) => {
    const response = await api.post('/integrations/locus/send-usdc', payload);
    return response.data;
  },
  listLocusTools: async (): Promise<{
    success: boolean;
    tools:
      | {
          mode?: 'mock' | 'live' | 'fallback';
          tools?: Array<{ name?: string; description?: string }>;
          error?: string;
        }
      | Array<{ name?: string; description?: string }>;
  }> => {
    const response = await api.get('/integrations/locus/tools');
    return response.data;
  },
  buildDelegation: async (payload: {
    delegator: string;
    delegate: string;
    escrowTarget: string;
    maxUsdc: string;
    expiryUnix: number;
    allowedMethods: string[];
  }) => {
    const response = await api.post('/integrations/metamask/delegation/build', payload);
    return response.data;
  },
  listProviders: async (params?: {
    query?: string;
    minReputation?: number;
    maxBasePriceUsdc?: number;
    sources?: string;
  }): Promise<{ success: boolean; useCase: string; catalogMode?: string; providers: ProviderCandidate[] }> => {
    const response = await api.get('/discovery/providers', { params });
    return response.data;
  },
  listDiscoverySources: async (): Promise<{ success: boolean; neutral: boolean; sources: Array<{ id: string; enabled: boolean }> }> => {
    const response = await api.get('/discovery/sources');
    return response.data;
  },
  listOpportunities: async (params?: {
    status?: 'open' | 'matched' | 'archived';
    limit?: number;
  }): Promise<{ success: boolean; useCase: string; opportunities: DemandOpportunity[] }> => {
    const response = await api.get('/discovery/opportunities', { params });
    return response.data;
  },
  createOpportunity: async (payload: {
    requestText: string;
    normalizedQuery: string;
    maxBudgetUsdc?: number | null;
    maxDeliveryHours?: number | null;
    matchesAtCreate?: number;
    source?: 'terminal' | 'api';
  }): Promise<{ success: boolean; opportunity: DemandOpportunity }> => {
    const response = await api.post('/discovery/opportunities', payload);
    return response.data;
  },
  listExecutionProviders: async (): Promise<{ success: boolean; neutral: boolean; providers: Array<{ id: string; mode: string; useCase: string }> }> => {
    const response = await api.get('/execution/providers');
    return response.data;
  },
  getMachinePaymentsStatus: async (): Promise<MachinePaymentsStatusResponse> => {
    const response = await api.get('/payments/status');
    return response.data;
  },
  proxyMachinePayment: async (payload: {
    provider?: 'x402';
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    paymentHeader?: string;
  }) => {
    const response = await api.post('/payments/proxy', payload);
    return response.data;
  },
  getX402Status: async (): Promise<MachinePaymentsStatusResponse> => integrationsApi.getMachinePaymentsStatus(),
  proxyX402: async (payload: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    paymentHeader?: string;
  }) => integrationsApi.proxyMachinePayment({ ...payload, provider: 'x402' }),
};

/**
 * Health check endpoint
 * Verifies backend connectivity and blockchain status
 */
export const healthCheck = async (params?: { chain?: 'baseSepolia' | 'celoSepolia' }): Promise<HealthCheckResponse> => {
  const response = await axios.get(`${getApiOrigin()}/health`, { params });
  return response.data;
};

/**
 * Error handler utility
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
