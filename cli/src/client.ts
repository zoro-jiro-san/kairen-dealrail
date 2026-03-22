import type {
  CreateNegotiationPayload,
  DiscoveryProvidersResponse,
  DiscoverySourcesResponse,
  ExecutionProvidersResponse,
  HealthCheck,
  Job,
  JobsListResponse,
  LocusToolsResponse,
  NegotiationSession,
  Opportunity,
  X402StatusResponse,
} from './types.js';

export type RequestOptions = {
  method?: 'GET' | 'POST';
  params?: Record<string, string | number | undefined>;
  body?: unknown;
};

export class DealRailClient {
  constructor(private readonly baseUrl: string) {}

  async health(): Promise<HealthCheck> {
    return this.request('/health');
  }

  async listProviders(params?: {
    query?: string;
    minReputation?: number;
    maxBasePriceUsdc?: number;
    sources?: string;
  }): Promise<DiscoveryProvidersResponse> {
    return this.request('/api/v1/discovery/providers', { params });
  }

  async listSources(): Promise<DiscoverySourcesResponse> {
    return this.request('/api/v1/discovery/sources');
  }

  async listExecutionProviders(): Promise<ExecutionProvidersResponse> {
    return this.request('/api/v1/execution/providers');
  }

  async listLocusTools(): Promise<LocusToolsResponse> {
    return this.request('/api/v1/integrations/locus/tools');
  }

  async x402Status(): Promise<X402StatusResponse> {
    return this.request('/api/v1/integrations/x402/status');
  }

  async listJobs(limit = 10): Promise<JobsListResponse> {
    return this.request('/api/v1/jobs', { params: { limit } });
  }

  async getJob(jobId: number): Promise<Job> {
    return this.request(`/api/v1/jobs/${jobId}`);
  }

  async createNegotiation(payload: CreateNegotiationPayload): Promise<NegotiationSession> {
    return this.request('/api/v1/x402n/rfos', { method: 'POST', body: payload });
  }

  async createOpportunity(payload: {
    requestText: string;
    normalizedQuery: string;
    maxBudgetUsdc?: number | null;
    maxDeliveryHours?: number | null;
    matchesAtCreate?: number;
    source?: 'terminal' | 'api';
  }): Promise<{ success: boolean; opportunity: Opportunity }> {
    return this.request('/api/v1/discovery/opportunities', { method: 'POST', body: payload });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`);

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : response.statusText) || 'Request failed';
      throw new Error(message);
    }

    return payload as T;
  }
}
