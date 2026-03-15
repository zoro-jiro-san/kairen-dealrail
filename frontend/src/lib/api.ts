/**
 * API client for DealRail backend (Simplified Mode)
 *
 * This client connects to the simplified backend that reads directly from blockchain.
 * No database - all data comes from on-chain state.
 */
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ Types (matching simplified API response) ============

export interface Job {
  jobId: number;
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
  explorerUrl: string; // BaseScan URL
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
  providerPrivateKey: string;
}

export interface CompleteJobRequest {
  reason: string; // Bytes32 hash or string
  evaluatorPrivateKey: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  blockchain: {
    chainId: number;
    escrowAddress: string;
    usdcAddress: string;
  };
}

// ============ API Functions ============

export const jobsApi = {
  /**
   * Get job details by on-chain job ID
   * Reads directly from blockchain via backend
   */
  getByJobId: async (jobId: number): Promise<Job> => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
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
  getMultipleJobs: async (jobIds: number[]): Promise<Job[]> => {
    const promises = jobIds.map(id => jobsApi.getByJobId(id).catch(() => null));
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
};

/**
 * Health check endpoint
 * Verifies backend connectivity and blockchain status
 */
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await axios.get(`${API_URL}/health`);
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
