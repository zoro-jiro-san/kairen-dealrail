// Contract Interaction Service
import { ethers } from 'ethers';
import { config } from '../config';

// EscrowRailERC20 ABI (minimal - only what we need)
const ESCROW_RAIL_ABI = [
  // Events
  'event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, uint256 expiry, address hook)',
  'event JobFunded(uint256 indexed jobId, uint256 amount)',
  'event JobSubmitted(uint256 indexed jobId, bytes32 deliverable)',
  'event JobCompleted(uint256 indexed jobId, bytes32 reason)',
  'event JobRejected(uint256 indexed jobId, bytes32 reason)',
  'event JobExpired(uint256 indexed jobId)',

  // Read functions
  'function getJob(uint256 jobId) view returns (tuple(address client, address provider, address evaluator, uint256 budget, uint256 expiry, uint8 state, bytes32 deliverable, address hook))',
  'function getState(uint256 jobId) view returns (uint8)',
  'function nextJobId() view returns (uint256)',

  // Write functions
  'function createJob(address provider, address evaluator, uint256 expiry, address hook) returns (uint256)',
  'function fund(uint256 jobId, uint256 expectedBudget)',
  'function submit(uint256 jobId, bytes32 deliverable)',
  'function complete(uint256 jobId, bytes32 reason)',
  'function reject(uint256 jobId, bytes32 reason)',
  'function claimRefund(uint256 jobId)',
];

// ERC20 ABI (for USDC approvals)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];

// Job State enum (matches Solidity)
export enum JobState {
  Open = 0,
  Funded = 1,
  Submitted = 2,
  Completed = 3,
  Rejected = 4,
  Expired = 5,
}

export interface Job {
  jobId: string;
  client: string;
  provider: string;
  evaluator: string;
  budget: string;
  expiry: number;
  state: JobState;
  deliverable: string;
  hook: string;
}

class ContractService {
  private provider: ethers.JsonRpcProvider;
  private escrowContract: ethers.Contract;
  private usdcContract: ethers.Contract;

  constructor() {
    const chainConfig = config.activeChainConfig;

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);

    // Initialize contracts (read-only initially)
    this.escrowContract = new ethers.Contract(
      chainConfig.contracts.escrowRailERC20,
      ESCROW_RAIL_ABI,
      this.provider
    );

    this.usdcContract = new ethers.Contract(
      chainConfig.usdcAddress || chainConfig.cusdAddress,
      ERC20_ABI,
      this.provider
    );
  }

  /**
   * Get a signer for write operations
   */
  private getSigner(privateKey: string): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Get job details from contract
   */
  async getJob(jobId: number): Promise<Job> {
    const jobData = await this.escrowContract.getJob(jobId);

    return {
      jobId: jobId.toString(),
      client: jobData.client,
      provider: jobData.provider,
      evaluator: jobData.evaluator,
      budget: jobData.budget.toString(),
      expiry: Number(jobData.expiry),
      state: jobData.state as JobState,
      deliverable: jobData.deliverable,
      hook: jobData.hook,
    };
  }

  /**
   * Get job state
   */
  async getJobState(jobId: number): Promise<JobState> {
    const state = await this.escrowContract.getState(jobId);
    return state as JobState;
  }

  /**
   * Get next job ID
   */
  async getNextJobId(): Promise<number> {
    const nextId = await this.escrowContract.nextJobId();
    return Number(nextId);
  }

  /**
   * Create a new job (client perspective)
   */
  async createJob(params: {
    provider: string;
    evaluator: string;
    expiry: number;
    hook?: string;
    clientPrivateKey: string;
  }): Promise<{ jobId: number; txHash: string }> {
    const signer = this.getSigner(params.clientPrivateKey);
    const escrowWithSigner = this.escrowContract.connect(signer);

    const tx = await escrowWithSigner.createJob(
      params.provider,
      params.evaluator,
      params.expiry,
      params.hook || ethers.ZeroAddress
    );

    const receipt = await tx.wait();

    // Parse JobCreated event to get jobId
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.escrowContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'JobCreated');

    const jobId = event ? Number(event.args.jobId) : await this.getNextJobId() - 1;

    return {
      jobId,
      txHash: receipt.hash,
    };
  }

  /**
   * Fund a job (client perspective)
   */
  async fundJob(params: {
    jobId: number;
    amount: string; // in wei/smallest unit
    clientPrivateKey: string;
  }): Promise<{ txHash: string }> {
    const signer = this.getSigner(params.clientPrivateKey);

    // 1. Approve USDC spending
    const usdcWithSigner = this.usdcContract.connect(signer);
    const approveTx = await usdcWithSigner.approve(
      this.escrowContract.target,
      params.amount
    );
    await approveTx.wait();

    // 2. Fund the job
    const escrowWithSigner = this.escrowContract.connect(signer);
    const tx = await escrowWithSigner.fund(params.jobId, params.amount);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  /**
   * Submit deliverable (provider perspective)
   */
  async submitDeliverable(params: {
    jobId: number;
    deliverableHash: string; // bytes32 hash
    providerPrivateKey: string;
  }): Promise<{ txHash: string }> {
    const signer = this.getSigner(params.providerPrivateKey);
    const escrowWithSigner = this.escrowContract.connect(signer);

    const tx = await escrowWithSigner.submit(params.jobId, params.deliverableHash);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  /**
   * Complete job (evaluator perspective)
   */
  async completeJob(params: {
    jobId: number;
    reason?: string;
    evaluatorPrivateKey: string;
  }): Promise<{ txHash: string }> {
    const signer = this.getSigner(params.evaluatorPrivateKey);
    const escrowWithSigner = this.escrowContract.connect(signer);

    const reasonHash = params.reason
      ? ethers.keccak256(ethers.toUtf8Bytes(params.reason))
      : ethers.ZeroHash;

    const tx = await escrowWithSigner.complete(params.jobId, reasonHash);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  /**
   * Reject job (evaluator perspective)
   */
  async rejectJob(params: {
    jobId: number;
    reason?: string;
    evaluatorPrivateKey: string;
  }): Promise<{ txHash: string }> {
    const signer = this.getSigner(params.evaluatorPrivateKey);
    const escrowWithSigner = this.escrowContract.connect(signer);

    const reasonHash = params.reason
      ? ethers.keccak256(ethers.toUtf8Bytes(params.reason))
      : ethers.ZeroHash;

    const tx = await escrowWithSigner.reject(params.jobId, reasonHash);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  /**
   * Claim refund (permissionless after expiry)
   */
  async claimRefund(params: {
    jobId: number;
    callerPrivateKey: string;
  }): Promise<{ txHash: string }> {
    const signer = this.getSigner(params.callerPrivateKey);
    const escrowWithSigner = this.escrowContract.connect(signer);

    const tx = await escrowWithSigner.claimRefund(params.jobId);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(address: string): Promise<string> {
    const balance = await this.usdcContract.balanceOf(address);
    return balance.toString();
  }

  /**
   * Get USDC allowance
   */
  async getUSDCAllowance(owner: string, spender?: string): Promise<string> {
    const allowance = await this.usdcContract.allowance(
      owner,
      spender || this.escrowContract.target
    );
    return allowance.toString();
  }
}

export const contractService = new ContractService();
