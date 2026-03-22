import { contractService } from './contract.service';
import { discoveryService } from './discovery.service';
import { executionService } from './execution.service';
import { machinePaymentsService } from './machine-payments.service';
import { config } from '../config';

type BaseAgentServiceSurface = {
  id:
    | 'provider_directory'
    | 'opportunity_board'
    | 'x402_proxy'
    | 'job_board'
    | 'post_settlement_routing';
  name: string;
  method: 'GET' | 'POST' | 'GET/POST';
  endpoint: string;
  access: 'public' | 'preview';
  settlementModel: string;
  useCase: string;
};

type BaseAgentServicePreview = {
  serviceName: string;
  description: string;
  source: 'x402n' | 'virtuals' | 'near' | 'mock' | 'imported';
  endpoint: string | null;
  basePriceUsdc: string | null;
  providerAddress: string;
  reputationScore: number | null;
  erc8004Registered: boolean;
  erc8004AgentId: string | null;
};

export type BaseAgentServicesDirectory = {
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
  executionProviders: Array<{ id: string; mode: 'live' | 'bridge' | 'mock'; useCase: string }>;
  notes: string[];
};

class BaseAgentServicesService {
  async getDirectory(): Promise<BaseAgentServicesDirectory> {
    const summary = contractService.getChainSummary('baseSepolia');
    const providers = await discoveryService.listProviderCandidates();
    const liveProviderCount = providers.filter((provider) => provider.source !== 'mock').length;
    const mockProviderCount = providers.filter((provider) => provider.source === 'mock').length;

    return {
      success: true,
      track: 'base-agent-services',
      generatedAt: new Date().toISOString(),
      catalogMode: config.x402n.mockMode ? 'curated_demo' : 'live_blended',
      chain: 'baseSepolia',
      chainId: summary.chainId,
      settlementRail: {
        escrowAddress: summary.escrowAddress,
        stablecoinAddress: summary.stablecoinAddress,
        stablecoinSymbol: summary.stablecoinSymbol,
        explorerBaseUrl: summary.explorerBaseUrl,
        explorerUrl: `${summary.explorerBaseUrl}/address/${summary.escrowAddress}`,
      },
      discovery: {
        providerCount: providers.length,
        liveProviderCount,
        mockProviderCount,
      },
      paymentModels: ['x402 pay-per-call', 'Base Sepolia USDC escrow'],
      publicSurfaces: [
        {
          id: 'provider_directory',
          name: 'Provider Directory',
          method: 'GET',
          endpoint: '/api/v1/discovery/providers',
          access: 'public',
          settlementModel: 'Provider discovery before payment or escrow',
          useCase: 'Expose visible agent supply and shortlist likely matches before deal formation.',
        },
        {
          id: 'opportunity_board',
          name: 'Opportunity Board',
          method: 'GET/POST',
          endpoint: '/api/v1/discovery/opportunities',
          access: 'public',
          settlementModel: 'Open demand capture for later provider pickup',
          useCase: 'Retain unmatched buyer demand so providers can discover it later.',
        },
        {
          id: 'x402_proxy',
          name: 'x402 Paid Request Proxy',
          method: 'POST',
          endpoint: '/api/v1/integrations/x402/proxy',
          access: 'public',
          settlementModel: 'Immediate pay-per-call on Base-facing machine payment rails',
          useCase: 'Proxy a request that may require an Ethereum-native x402 payment challenge.',
        },
        {
          id: 'job_board',
          name: 'Base Job Board',
          method: 'GET',
          endpoint: '/api/v1/jobs?chain=baseSepolia',
          access: 'public',
          settlementModel: 'Escrow-backed service jobs on Base Sepolia',
          useCase: 'Inspect real Base jobs and use them as the proof layer for service settlement.',
        },
        {
          id: 'post_settlement_routing',
          name: 'Post-Settlement Routing Preview',
          method: 'GET',
          endpoint: '/api/v1/integrations/uniswap/post-settlement/:jobId?chain=baseSepolia',
          access: 'preview',
          settlementModel: 'Preview-only treasury routing after Base settlement',
          useCase: 'Inspect the Base-only treasury routing payload after a completed job without claiming live swap proof.',
        },
      ],
      supplyPreview: providers.slice(0, 6).map((provider) => ({
        serviceName: provider.serviceName,
        description: provider.description,
        source: provider.source,
        endpoint: provider.endpoint,
        basePriceUsdc: provider.basePriceUsdc,
        providerAddress: provider.providerAddress,
        reputationScore: provider.reputationScore,
        erc8004Registered: provider.erc8004Registered,
        erc8004AgentId: provider.erc8004AgentId,
      })),
      executionProviders: executionService.listProviders(),
      notes: [
        'This is a public Base-facing service directory for DealRail, not proof of a fully open live marketplace.',
        config.x402n.mockMode
          ? 'Provider supply is still in curated demo mode today. The directory makes the public service surface explicit, but does not turn mock supply into live market proof.'
          : 'Discovery is blending live sources where configured, but public market depth still depends on the connected provider feeds.',
        'Celo remains a supported settlement lane in DealRail. This directory is intentionally scoped to the Base-facing service surface for the Base track.',
      ],
    };
  }
}

export const baseAgentServicesService = new BaseAgentServicesService();
