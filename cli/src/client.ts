import type {
  CreateNegotiationPayload,
  DiscoveryProvidersResponse,
  DiscoverySourcesResponse,
  ExecutionProvidersResponse,
  HealthCheck,
  Job,
  JobsListResponse,
  LocusToolsResponse,
  MachinePaymentsStatusResponse,
  NegotiationSession,
  Opportunity,
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

  async machinePaymentsStatus(): Promise<MachinePaymentsStatusResponse> {
    return this.request('/api/v1/payments/status');
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
    let payload: unknown = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : typeof payload === 'string' && payload.trim()
            ? payload.trim()
          : response.statusText) || 'Request failed';
      throw new Error(message);
    }

    if (text && typeof payload === 'string') {
      throw new Error(`Expected JSON response from ${url.pathname}`);
    }

    return payload as T;
  }
}
