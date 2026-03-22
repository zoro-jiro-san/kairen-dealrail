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
] as const;

// ERC20 ABI (for stablecoin approvals)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
] as const;

export type SupportedChain = 'baseSepolia' | 'celoSepolia';

type ChainConfig = typeof config.blockchain.baseSepolia | typeof config.blockchain.celoSepolia;

type ChainContext = {
  chain: SupportedChain;
  chainConfig: ChainConfig;
  provider: ethers.JsonRpcProvider;
  escrowContract: ethers.Contract;
  stablecoinContract: ethers.Contract;
  stablecoinAddress: string;
  stablecoinSymbol: string;
  explorerBaseUrl: string;
};

export type SimulationTx = {
  kind: string;
  to: string;
  data: string;
  value: string;
  from?: string;
  gasEstimate: string | null;
  explorerUrl: string;
};

export type TransactionSimulation = {
  chain: SupportedChain;
  chainId: number;
  explorerBaseUrl: string;
  stablecoinAddress: string;
  stablecoinSymbol: string;
  ok: boolean;
  warnings: string[];
  transactions: SimulationTx[];
  error?: string;
};

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
  private contexts = new Map<SupportedChain, ChainContext>();

  private resolveChain(chain?: SupportedChain): SupportedChain {
    return chain || config.blockchain.activeChain;
  }

  private getStablecoinAddress(chainConfig: ChainConfig): string {
    return 'usdcAddress' in chainConfig ? chainConfig.usdcAddress : chainConfig.cusdAddress;
  }

  private getStablecoinSymbol(chain: SupportedChain): string {
    return chain === 'baseSepolia' ? 'USDC' : 'USDC';
  }

  private getExplorerBaseUrl(chain: SupportedChain): string {
    return chain === 'celoSepolia'
      ? 'https://celo-sepolia.blockscout.com'
      : 'https://sepolia.basescan.org';
  }

  private buildContext(chain: SupportedChain): ChainContext {
    const chainConfig = config.blockchain[chain];
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    const stablecoinAddress = this.getStablecoinAddress(chainConfig);

    return {
      chain,
      chainConfig,
      provider,
      escrowContract: new ethers.Contract(chainConfig.contracts.escrowRailERC20, ESCROW_RAIL_ABI, provider),
      stablecoinContract: new ethers.Contract(stablecoinAddress, ERC20_ABI, provider),
      stablecoinAddress,
      stablecoinSymbol: this.getStablecoinSymbol(chain),
      explorerBaseUrl: this.getExplorerBaseUrl(chain),
    };
  }

  private getContext(chain?: SupportedChain): ChainContext {
    const resolvedChain = this.resolveChain(chain);
    const existing = this.contexts.get(resolvedChain);
    if (existing) return existing;

    const next = this.buildContext(resolvedChain);
    this.contexts.set(resolvedChain, next);
    return next;
  }

  private getSigner(privateKey: string, chain?: SupportedChain): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.getContext(chain).provider);
  }

  private async estimateGasOrNull(
    provider: ethers.JsonRpcProvider,
    request: { from?: string; to: string; data: string; value?: string }
  ): Promise<string | null> {
    if (!request.from) return null;

    try {
      const gas = await provider.estimateGas({
        from: request.from,
        to: request.to,
        data: request.data,
        value: BigInt(request.value || '0'),
      });
      return gas.toString();
    } catch {
      return null;
    }
  }

  private async buildSimulationTx(params: {
    chain?: SupportedChain;
    kind: string;
    to: string;
    data: string;
    from?: string;
    value?: string;
  }): Promise<SimulationTx> {
    const context = this.getContext(params.chain);
    const value = params.value || '0';
    const gasEstimate = await this.estimateGasOrNull(context.provider, {
      from: params.from,
      to: params.to,
      data: params.data,
      value,
    });

    return {
      kind: params.kind,
      to: params.to,
      data: params.data,
      value,
      from: params.from,
      gasEstimate,
      explorerUrl: `${context.explorerBaseUrl}/address/${params.to}`,
    };
  }

  getChainSummary(chain?: SupportedChain) {
    const context = this.getContext(chain);
    return {
      chain: context.chain,
      chainId: context.chainConfig.chainId,
      rpcUrl: context.chainConfig.rpcUrl,
      escrowAddress: context.chainConfig.contracts.escrowRailERC20,
      stablecoinAddress: context.stablecoinAddress,
      stablecoinSymbol: context.stablecoinSymbol,
      explorerBaseUrl: context.explorerBaseUrl,
    };
  }

  listSupportedChains() {
    return (['baseSepolia', 'celoSepolia'] as SupportedChain[]).map((chain) => this.getChainSummary(chain));
  }

  async getJob(jobId: number, chain?: SupportedChain): Promise<Job> {
    const jobData = await this.getContext(chain).escrowContract.getJob(jobId);

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

  async getJobState(jobId: number, chain?: SupportedChain): Promise<JobState> {
    const state = await this.getContext(chain).escrowContract.getState(jobId);
    return state as JobState;
  }

  async getNextJobId(chain?: SupportedChain): Promise<number> {
    const nextId = await this.getContext(chain).escrowContract.nextJobId();
    return Number(nextId);
  }

  async createJob(params: {
    provider: string;
    evaluator: string;
    expiry: number;
    hook?: string;
    clientPrivateKey: string;
    chain?: SupportedChain;
  }): Promise<{ jobId: number; txHash: string }> {
    const context = this.getContext(params.chain);
    const signer = this.getSigner(params.clientPrivateKey, params.chain);
    const escrowWithSigner = context.escrowContract.connect(signer);

    const tx = await escrowWithSigner.createJob(
      params.provider,
      params.evaluator,
      params.expiry,
      params.hook || ethers.ZeroAddress
    );

    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log: any) => {
        try {
          return context.escrowContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((entry: any) => entry?.name === 'JobCreated');

    const jobId = event ? Number(event.args.jobId) : (await this.getNextJobId(params.chain)) - 1;

    return {
      jobId,
      txHash: receipt.hash,
    };
  }

  async fundJob(params: {
    jobId: number;
    amount: string;
    clientPrivateKey: string;
    chain?: SupportedChain;
  }): Promise<{ txHash: string }> {
    const context = this.getContext(params.chain);
    const signer = this.getSigner(params.clientPrivateKey, params.chain);

    const stablecoinWithSigner = context.stablecoinContract.connect(signer);
    const approveTx = await stablecoinWithSigner.approve(context.escrowContract.target, params.amount);
    await approveTx.wait();

    const escrowWithSigner = context.escrowContract.connect(signer);
    const tx = await escrowWithSigner.fund(params.jobId, params.amount);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  async submitDeliverable(params: {
    jobId: number;
    deliverableHash: string;
    providerPrivateKey: string;
    chain?: SupportedChain;
  }): Promise<{ txHash: string }> {
    const context = this.getContext(params.chain);
    const signer = this.getSigner(params.providerPrivateKey, params.chain);
    const escrowWithSigner = context.escrowContract.connect(signer);

    const tx = await escrowWithSigner.submit(params.jobId, params.deliverableHash);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  async completeJob(params: {
    jobId: number;
    reason?: string;
    evaluatorPrivateKey: string;
    chain?: SupportedChain;
  }): Promise<{ txHash: string }> {
    const context = this.getContext(params.chain);
    const signer = this.getSigner(params.evaluatorPrivateKey, params.chain);
    const escrowWithSigner = context.escrowContract.connect(signer);
    const reasonHash = params.reason ? ethers.keccak256(ethers.toUtf8Bytes(params.reason)) : ethers.ZeroHash;

    const tx = await escrowWithSigner.complete(params.jobId, reasonHash);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  async rejectJob(params: {
    jobId: number;
    reason?: string;
    evaluatorPrivateKey: string;
    chain?: SupportedChain;
  }): Promise<{ txHash: string }> {
    const context = this.getContext(params.chain);
    const signer = this.getSigner(params.evaluatorPrivateKey, params.chain);
    const escrowWithSigner = context.escrowContract.connect(signer);
    const reasonHash = params.reason ? ethers.keccak256(ethers.toUtf8Bytes(params.reason)) : ethers.ZeroHash;

    const tx = await escrowWithSigner.reject(params.jobId, reasonHash);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  async claimRefund(params: {
    jobId: number;
    callerPrivateKey: string;
    chain?: SupportedChain;
  }): Promise<{ txHash: string }> {
    const context = this.getContext(params.chain);
    const signer = this.getSigner(params.callerPrivateKey, params.chain);
    const escrowWithSigner = context.escrowContract.connect(signer);

    const tx = await escrowWithSigner.claimRefund(params.jobId);
    const receipt = await tx.wait();

    return { txHash: receipt.hash };
  }

  async getUSDCBalance(address: string, chain?: SupportedChain): Promise<string> {
    const balance = await this.getContext(chain).stablecoinContract.balanceOf(address);
    return balance.toString();
  }

  async getUSDCAllowance(owner: string, spender?: string, chain?: SupportedChain): Promise<string> {
    const context = this.getContext(chain);
    const allowance = await context.stablecoinContract.allowance(
      owner,
      spender || context.escrowContract.target
    );
    return allowance.toString();
  }

  async simulateCreateJob(params: {
    provider: string;
    evaluator: string;
    expiry: number;
    hook?: string;
    from?: string;
    chain?: SupportedChain;
  }): Promise<TransactionSimulation> {
    const context = this.getContext(params.chain);
    const data = context.escrowContract.interface.encodeFunctionData('createJob', [
      params.provider,
      params.evaluator,
      params.expiry,
      params.hook || ethers.ZeroAddress,
    ]);

    const warnings = !params.from ? ['No `from` address supplied, so gas estimation was skipped.'] : [];
    const transaction = await this.buildSimulationTx({
      chain: params.chain,
      kind: 'createJob',
      to: context.chainConfig.contracts.escrowRailERC20,
      data,
      from: params.from,
    });

    return {
      ...this.getChainSummary(params.chain),
      ok: true,
      warnings,
      transactions: [transaction],
    };
  }

  async simulateFundJob(params: {
    jobId: number;
    amount: string;
    from?: string;
    chain?: SupportedChain;
  }): Promise<TransactionSimulation> {
    const context = this.getContext(params.chain);
    const approveData = context.stablecoinContract.interface.encodeFunctionData('approve', [
      context.chainConfig.contracts.escrowRailERC20,
      params.amount,
    ]);
    const fundData = context.escrowContract.interface.encodeFunctionData('fund', [params.jobId, params.amount]);

    const warnings = !params.from ? ['No `from` address supplied, so gas estimation was skipped.'] : [];
    const transactions = await Promise.all([
      this.buildSimulationTx({
        chain: params.chain,
        kind: 'approveStablecoin',
        to: context.stablecoinAddress,
        data: approveData,
        from: params.from,
      }),
      this.buildSimulationTx({
        chain: params.chain,
        kind: 'fundJob',
        to: context.chainConfig.contracts.escrowRailERC20,
        data: fundData,
        from: params.from,
      }),
    ]);

    return {
      ...this.getChainSummary(params.chain),
      ok: true,
      warnings,
      transactions,
    };
  }

  async simulateSubmitDeliverable(params: {
    jobId: number;
    deliverableHash: string;
    from?: string;
    chain?: SupportedChain;
  }): Promise<TransactionSimulation> {
    const context = this.getContext(params.chain);
    const data = context.escrowContract.interface.encodeFunctionData('submit', [params.jobId, params.deliverableHash]);
    const warnings = !params.from ? ['No `from` address supplied, so gas estimation was skipped.'] : [];
    const transaction = await this.buildSimulationTx({
      chain: params.chain,
      kind: 'submitDeliverable',
      to: context.chainConfig.contracts.escrowRailERC20,
      data,
      from: params.from,
    });

    return {
      ...this.getChainSummary(params.chain),
      ok: true,
      warnings,
      transactions: [transaction],
    };
  }

  async simulateCompleteJob(params: {
    jobId: number;
    reasonHash: string;
    from?: string;
    chain?: SupportedChain;
  }): Promise<TransactionSimulation> {
    const context = this.getContext(params.chain);
    const data = context.escrowContract.interface.encodeFunctionData('complete', [params.jobId, params.reasonHash]);
    const warnings = !params.from ? ['No `from` address supplied, so gas estimation was skipped.'] : [];
    const transaction = await this.buildSimulationTx({
      chain: params.chain,
      kind: 'completeJob',
      to: context.chainConfig.contracts.escrowRailERC20,
      data,
      from: params.from,
    });

    return {
      ...this.getChainSummary(params.chain),
      ok: true,
      warnings,
      transactions: [transaction],
    };
  }

  async simulateRejectJob(params: {
    jobId: number;
    reasonHash: string;
    from?: string;
    chain?: SupportedChain;
  }): Promise<TransactionSimulation> {
    const context = this.getContext(params.chain);
    const data = context.escrowContract.interface.encodeFunctionData('reject', [params.jobId, params.reasonHash]);
    const warnings = !params.from ? ['No `from` address supplied, so gas estimation was skipped.'] : [];
    const transaction = await this.buildSimulationTx({
      chain: params.chain,
      kind: 'rejectJob',
      to: context.chainConfig.contracts.escrowRailERC20,
      data,
      from: params.from,
    });

    return {
      ...this.getChainSummary(params.chain),
      ok: true,
      warnings,
      transactions: [transaction],
    };
  }

  async simulateClaimRefund(params: {
    jobId: number;
    from?: string;
    chain?: SupportedChain;
  }): Promise<TransactionSimulation> {
    const context = this.getContext(params.chain);
    const data = context.escrowContract.interface.encodeFunctionData('claimRefund', [params.jobId]);
    const warnings = !params.from ? ['No `from` address supplied, so gas estimation was skipped.'] : [];
    const transaction = await this.buildSimulationTx({
      chain: params.chain,
      kind: 'claimRefund',
      to: context.chainConfig.contracts.escrowRailERC20,
      data,
      from: params.from,
    });

    return {
      ...this.getChainSummary(params.chain),
      ok: true,
      warnings,
      transactions: [transaction],
    };
  }
}

export const contractService = new ContractService();
