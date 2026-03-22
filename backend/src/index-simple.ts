// DealRail Backend API Server (Simplified - No Database)
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { contractService } from './services/contract.service';
import { ethers } from 'ethers';
import { z } from 'zod';
import { x402nService } from './services/x402n.service';
import { uniswapService } from './services/uniswap.service';
import { locusService } from './services/locus.service';
import { delegationService } from './services/delegation.service';
import { discoveryService } from './services/discovery.service';
import { executionService } from './services/execution.service';
import { opportunityBookService } from './services/opportunity-book.service';
import { machinePaymentsService } from './services/machine-payments.service';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

const stateNames = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'];

function getExplorerBaseUrl(): string {
  return config.activeChainConfig.chainId === 11142220
    ? 'https://celo-sepolia.blockscout.com'
    : 'https://sepolia.basescan.org';
}

function formatJobResponse(jobId: number, job: Awaited<ReturnType<typeof contractService.getJob>>) {
  const explorerBase = getExplorerBaseUrl();
  return {
    jobId,
    client: job.client,
    provider: job.provider,
    evaluator: job.evaluator,
    budget: ethers.formatUnits(job.budget, 6) + ' USDC',
    budgetRaw: job.budget.toString(),
    expiry: new Date(Number(job.expiry) * 1000).toISOString(),
    state: stateNames[Number(job.state)],
    stateCode: Number(job.state),
    deliverable: job.deliverable,
    hook: job.hook,
    explorerUrl: `${explorerBase}/address/${config.activeChainConfig.contracts.escrowRailERC20}`,
  };
}

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  const stablecoinAddress =
    'usdcAddress' in config.activeChainConfig
      ? config.activeChainConfig.usdcAddress
      : config.activeChainConfig.cusdAddress;

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    blockchain: {
      network: config.blockchain.activeChain,
      chainId: config.activeChainConfig.chainId,
      escrowAddress: config.activeChainConfig.contracts.escrowRailERC20,
      usdcAddress: stablecoinAddress,
    },
    integrations: {
      x402nMockMode: config.x402n.mockMode,
      x402nBaseUrl: config.x402n.baseUrl,
      machinePaymentsPrimary: 'x402',
    },
  });
});

// GET /api/v1/jobs - List recent jobs from chain
app.get('/api/v1/jobs', async (req: Request, res: Response) => {
  try {
    const limitRaw = Number(req.query.limit ?? 20);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;

    const nextJobId = await contractService.getNextJobId();
    const maxJobId = Math.max(nextJobId - 1, 0);
    const minJobId = Math.max(1, maxJobId - limit + 1);

    const jobIds: number[] = [];
    for (let id = maxJobId; id >= minJobId; id -= 1) {
      jobIds.push(id);
    }

    const jobs = await Promise.all(
      jobIds.map(async (jobId) => {
        try {
          const job = await contractService.getJob(jobId);
          return formatJobResponse(jobId, job);
        } catch {
          return null;
        }
      })
    );

    res.json({
      jobs: jobs.filter((job) => job !== null),
      pagination: {
        limit,
        totalOnchain: maxJobId,
      },
    });
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ error: 'Failed to list jobs' });
  }
});

// GET /api/v1/jobs/:jobId - Get job details from blockchain
app.get('/api/v1/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId) || jobId < 1) {
      res.status(400).json({ error: 'Invalid job ID' });
      return;
    }

    const nextJobId = await contractService.getNextJobId();
    if (jobId >= nextJobId) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = await contractService.getJob(jobId);
    res.json(formatJobResponse(jobId, job));
  } catch (error) {
    console.error(`Error getting job ${req.params.jobId}:`, error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

// POST /api/v1/jobs - Create a new job
app.post('/api/v1/jobs', async (req: Request, res: Response) => {
  try {
    const { provider, evaluator, expiryDays } = req.body;

    if (!provider || !evaluator) {
      res.status(400).json({ error: 'Missing provider or evaluator address' });
      return;
    }

    const days = expiryDays || 7;
    const expiry = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;

    const result = await contractService.createJob({
      provider,
      evaluator,
      expiry,
      clientPrivateKey: config.blockchain.deployerPrivateKey!,
    });

    res.status(201).json({
      success: true,
      jobId: result.jobId,
      txHash: result.txHash,
      explorerUrl: `${getExplorerBaseUrl()}/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job', details: (error as Error).message });
  }
});

// POST /api/v1/jobs/:jobId/fund - Fund a job
app.post('/api/v1/jobs/:jobId/fund', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { amount } = req.body; // Amount in USDC (e.g., "0.1")

    if (isNaN(jobId) || !amount) {
      res.status(400).json({ error: 'Invalid jobId or amount' });
      return;
    }

    const amountWei = ethers.parseUnits(amount, 6);

    const result = await contractService.fundJob({
      jobId,
      amount: amountWei.toString(),
      clientPrivateKey: config.blockchain.deployerPrivateKey!,
    });

    res.json({
      success: true,
      jobId,
      amount: amount + ' USDC',
      txHash: result.txHash,
      explorerUrl: `${getExplorerBaseUrl()}/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error funding job:', error);
    res.status(500).json({ error: 'Failed to fund job', details: (error as Error).message });
  }
});

// POST /api/v1/jobs/:jobId/submit - Submit deliverable
app.post('/api/v1/jobs/:jobId/submit', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { deliverable, providerPrivateKey } = req.body;

    if (isNaN(jobId) || !deliverable || !providerPrivateKey) {
      res.status(400).json({ error: 'Missing jobId, deliverable, or providerPrivateKey' });
      return;
    }

    const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes(deliverable));

    const result = await contractService.submitDeliverable({
      jobId,
      deliverableHash,
      providerPrivateKey,
    });

    res.json({
      success: true,
      jobId,
      deliverableHash,
      txHash: result.txHash,
      explorerUrl: `${getExplorerBaseUrl()}/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error submitting deliverable:', error);
    res.status(500).json({ error: 'Failed to submit deliverable', details: (error as Error).message });
  }
});

// POST /api/v1/jobs/:jobId/complete - Complete job (evaluator)
app.post('/api/v1/jobs/:jobId/complete', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { reason, evaluatorPrivateKey } = req.body;

    if (isNaN(jobId) || !evaluatorPrivateKey) {
      res.status(400).json({ error: 'Missing jobId or evaluatorPrivateKey' });
      return;
    }

    const result = await contractService.completeJob({
      jobId,
      reason: reason || 'Approved',
      evaluatorPrivateKey,
    });

    res.json({
      success: true,
      jobId,
      reason: reason || 'Approved',
      txHash: result.txHash,
      explorerUrl: `${getExplorerBaseUrl()}/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ error: 'Failed to complete job', details: (error as Error).message });
  }
});

// POST /api/v1/jobs/:jobId/reject - Reject job (evaluator)
app.post('/api/v1/jobs/:jobId/reject', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { reason, evaluatorPrivateKey } = req.body;

    if (isNaN(jobId) || !evaluatorPrivateKey) {
      res.status(400).json({ error: 'Missing jobId or evaluatorPrivateKey' });
      return;
    }

    const result = await contractService.rejectJob({
      jobId,
      reason: reason || 'Rejected',
      evaluatorPrivateKey,
    });

    res.json({
      success: true,
      jobId,
      reason: reason || 'Rejected',
      txHash: result.txHash,
      explorerUrl: `${getExplorerBaseUrl()}/tx/${result.txHash}`,
    });
    return;
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({ error: 'Failed to reject job', details: (error as Error).message });
    return;
  }
});

// POST /api/v1/jobs/:jobId/claim-refund - Claim refund after expiry
app.post('/api/v1/jobs/:jobId/claim-refund', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { callerPrivateKey } = req.body;

    if (isNaN(jobId) || !callerPrivateKey) {
      res.status(400).json({ error: 'Missing jobId or callerPrivateKey' });
      return;
    }

    const result = await contractService.claimRefund({
      jobId,
      callerPrivateKey,
    });

    res.json({
      success: true,
      jobId,
      txHash: result.txHash,
      explorerUrl: `${getExplorerBaseUrl()}/tx/${result.txHash}`,
    });
    return;
  } catch (error) {
    console.error('Error claiming refund:', error);
    res.status(500).json({ error: 'Failed to claim refund', details: (error as Error).message });
    return;
  }
});

const createNegotiationSchema = z.object({
  serviceRequirement: z.string().min(5),
  maxBudgetUsdc: z.number().positive(),
  maxDeliveryHours: z.number().int().positive(),
  minReputationScore: z.number().int().min(0).max(1000),
  auctionMode: z.enum(['ranked', 'reverse_auction']).optional(),
  maxRounds: z.number().int().min(1).max(10).optional(),
  batchSize: z.number().int().min(1).max(8).optional(),
  autoCounterStepBps: z.number().int().min(50).max(2000).optional(),
  networkMode: z.enum(['demo', 'testnet', 'mainnet']).optional(),
});

// POST /api/v1/x402n/rfos - Create negotiation from policy
app.post('/api/v1/x402n/rfos', async (req: Request, res: Response) => {
  try {
    const policy = createNegotiationSchema.parse(req.body);
    const session = await x402nService.createNegotiation(policy);
    res.status(201).json(session);
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid policy payload', details: error.issues });
      return;
    }
    console.error('Error creating x402n negotiation:', error);
    res.status(500).json({ error: 'Failed to create negotiation' });
    return;
  }
});

// GET /api/v1/x402n/rfos/:negotiationId - Get negotiation state
app.get('/api/v1/x402n/rfos/:negotiationId', async (req: Request, res: Response) => {
  const session = x402nService.getNegotiation(req.params.negotiationId);
  if (!session) {
    res.status(404).json({ error: 'Negotiation not found' });
    return;
  }
  res.json(session);
  return;
});

// POST /api/v1/x402n/offers/:offerId/accept - Accept offer in negotiation
app.post('/api/v1/x402n/offers/:offerId/accept', async (req: Request, res: Response) => {
  const schema = z.object({ negotiationId: z.string().min(1) });

  try {
    const { negotiationId } = schema.parse(req.body);
    const offerId = req.params.offerId;

    const updated = x402nService.acceptOffer(negotiationId, offerId);
    if (!updated) {
      res.status(404).json({ error: 'Negotiation or offer not found' });
      return;
    }

    const acceptedOffer = updated.offers.find((offer) => offer.offerId === offerId);
    res.json({
      negotiation: updated,
      acceptedOffer,
      dealBlueprint: acceptedOffer
        ? {
            provider: acceptedOffer.provider,
            evaluator: acceptedOffer.evaluator,
            budgetUsdc: acceptedOffer.priceUsdc,
            expectedDeliveryHours: acceptedOffer.deliveryHours,
          }
        : null,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid accept payload', details: error.issues });
      return;
    }
    console.error('Error accepting x402n offer:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
    return;
  }
});

// POST /api/v1/x402n/rfos/:negotiationId/counter - Execute one reverse-auction round
app.post('/api/v1/x402n/rfos/:negotiationId/counter', (req: Request, res: Response) => {
  const updated = x402nService.runCounterRound(req.params.negotiationId);
  if (!updated) {
    res.status(404).json({ error: 'Negotiation not found' });
    return;
  }
  res.json({
    success: true,
    negotiation: updated,
    roundsCompleted: updated.roundsCompleted,
    maxRounds: updated.maxRounds,
    bestOffer: updated.offers[0] ?? null,
  });
  return;
});

// POST /api/v1/x402n/rfos/:negotiationId/batch - Create offer batch for confirmation
app.post('/api/v1/x402n/rfos/:negotiationId/batch', (req: Request, res: Response) => {
  const schema = z.object({
    offerIds: z.array(z.string().min(1)).optional(),
  });

  try {
    const payload = schema.parse(req.body ?? {});
    const result = x402nService.createBatch(req.params.negotiationId, payload.offerIds);
    if (!result) {
      res.status(404).json({ error: 'Negotiation not found or no eligible offers for batch' });
      return;
    }
    res.status(201).json({
      success: true,
      batch: result.batch,
      negotiation: result.session,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid batch payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to create batch', details: (error as Error).message });
    return;
  }
});

// POST /api/v1/x402n/rfos/:negotiationId/confirm - Confirm deal from a batch
app.post('/api/v1/x402n/rfos/:negotiationId/confirm', (req: Request, res: Response) => {
  const schema = z.object({
    batchId: z.string().min(1),
    selectedOfferId: z.string().min(1).optional(),
  });

  try {
    const payload = schema.parse(req.body);
    const result = x402nService.confirmBatch(
      req.params.negotiationId,
      payload.batchId,
      payload.selectedOfferId
    );

    if (!result) {
      res.status(404).json({ error: 'Negotiation, batch, or offer not found' });
      return;
    }

    res.json({
      success: true,
      confirmation: result.confirmation,
      selectedOffer: result.selectedOffer,
      receipt: result.receipt,
      negotiation: result.session,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid confirmation payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to confirm batch', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/x402n/rfos/:negotiationId/receipt - Savings receipt
app.get('/api/v1/x402n/rfos/:negotiationId/receipt', (req: Request, res: Response) => {
  const receipt = x402nService.getReceipt(req.params.negotiationId);
  if (!receipt) {
    res.status(404).json({ error: 'Receipt not found for negotiation' });
    return;
  }
  res.json({
    success: true,
    receipt,
  });
  return;
});

// GET /api/v1/x402n/rfos/:negotiationId/activities - Live negotiation feed
app.get('/api/v1/x402n/rfos/:negotiationId/activities', (req: Request, res: Response) => {
  const schema = z.object({
    limit: z
      .string()
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1).max(200))
      .optional(),
  });

  try {
    const parsed = schema.parse({
      limit: req.query.limit,
    });

    const negotiation = x402nService.getNegotiation(req.params.negotiationId);
    if (!negotiation) {
      res.status(404).json({ error: 'Negotiation not found' });
      return;
    }

    const activities = x402nService.getActivities(req.params.negotiationId, parsed.limit ?? 50);
    res.json({
      success: true,
      negotiationId: req.params.negotiationId,
      activities,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid activity query params', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to load activities', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/integrations/uniswap/quote - Quote USDC/WETH route on Base Mainnet
app.get('/api/v1/integrations/uniswap/quote', async (req: Request, res: Response) => {
  const schema = z.object({
    tokenIn: z.enum(['USDC', 'WETH']).default('USDC'),
    tokenOut: z.enum(['USDC', 'WETH']).default('WETH'),
    amountIn: z.string().default('1'),
    fee: z
      .string()
      .transform((value) => Number(value))
      .pipe(z.number().int().positive())
      .default('3000'),
  });

  try {
    const parsed = schema.parse({
      tokenIn: req.query.tokenIn ?? 'USDC',
      tokenOut: req.query.tokenOut ?? 'WETH',
      amountIn: req.query.amountIn ?? '1',
      fee: req.query.fee ?? '3000',
    });

    if (parsed.tokenIn === parsed.tokenOut) {
      res.status(400).json({ error: 'tokenIn and tokenOut must be different' });
      return;
    }

    const quote = await uniswapService.quoteExactInputSingle({
      tokenIn: parsed.tokenIn,
      tokenOut: parsed.tokenOut,
      amountIn: parsed.amountIn,
      fee: parsed.fee,
    });

    res.json({
      success: true,
      network: 'base-mainnet',
      ...quote,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid quote params', details: error.issues });
      return;
    }
    console.error('Error fetching Uniswap quote:', error);
    res.status(500).json({ error: 'Failed to fetch Uniswap quote', details: (error as Error).message });
    return;
  }
});

// POST /api/v1/integrations/uniswap/build-approve-tx
app.post('/api/v1/integrations/uniswap/build-approve-tx', async (req: Request, res: Response) => {
  const schema = z.object({
    token: z.enum(['USDC', 'WETH']),
    amount: z.string().min(1),
  });

  try {
    const payload = schema.parse(req.body);
    const tx = uniswapService.buildApproveTx(payload);
    res.json({ success: true, tx });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid approve payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to build approve tx', details: (error as Error).message });
    return;
  }
});

// POST /api/v1/integrations/uniswap/build-swap-tx
app.post('/api/v1/integrations/uniswap/build-swap-tx', async (req: Request, res: Response) => {
  const schema = z.object({
    tokenIn: z.enum(['USDC', 'WETH']),
    tokenOut: z.enum(['USDC', 'WETH']),
    amountIn: z.string().min(1),
    amountOutMinimum: z.string().min(1),
    fee: z.number().int().positive().default(3000),
    recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  });

  try {
    const payload = schema.parse(req.body);

    if (payload.tokenIn === payload.tokenOut) {
      res.status(400).json({ error: 'tokenIn and tokenOut must differ' });
      return;
    }

    const tx = uniswapService.buildExactInputSingleTx(payload);
    res.json({ success: true, tx });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid swap payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to build swap tx', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/integrations/uniswap/post-settlement/:jobId
// Builds approve+swap tx payloads directly from onchain job data.
app.get('/api/v1/integrations/uniswap/post-settlement/:jobId', async (req: Request, res: Response) => {
  const schema = z.object({
    tokenOut: z.enum(['USDC', 'WETH']).default('WETH'),
    fee: z
      .string()
      .transform((value) => Number(value))
      .pipe(z.number().int().positive())
      .default('3000'),
    slippageBps: z
      .string()
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1).max(5_000))
      .default('300'),
  });

  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (Number.isNaN(jobId)) {
      res.status(400).json({ error: 'Invalid jobId' });
      return;
    }

    const parsed = schema.parse({
      tokenOut: req.query.tokenOut ?? 'WETH',
      fee: req.query.fee ?? '3000',
      slippageBps: req.query.slippageBps ?? '300',
    });

    const job = await contractService.getJob(jobId);
    const stateCode = Number(job.state);
    if (stateCode !== 3) {
      res.status(400).json({
        error: 'Job is not completed',
        stateCode,
        state: stateNames[stateCode] || 'Unknown',
      });
      return;
    }

    const tokenIn: 'USDC' = 'USDC';
    const tokenOut = parsed.tokenOut;

    const tokenInMeta = uniswapService.getTokenMeta(tokenIn);
    const tokenOutMeta = uniswapService.getTokenMeta(tokenOut);

    const amountInRaw = job.budget.toString();
    const amountIn = ethers.formatUnits(amountInRaw, tokenInMeta.decimals);

    const quote = await uniswapService.quoteExactInputSingle({
      tokenIn,
      tokenOut,
      amountIn,
      fee: parsed.fee,
    });

    const quotedOutRaw = BigInt(quote.amountOutRaw);
    const amountOutMinimumRaw =
      (quotedOutRaw * BigInt(10_000 - parsed.slippageBps)) / BigInt(10_000);

    const approveTx = uniswapService.buildApproveTx({
      token: tokenIn,
      amount: amountIn,
    });

    const swapTx = uniswapService.buildExactInputSingleTx({
      tokenIn,
      tokenOut,
      amountInRaw,
      amountOutMinimumRaw: amountOutMinimumRaw.toString(),
      fee: parsed.fee,
      recipient: job.provider,
    });

    res.json({
      success: true,
      jobId,
      source: {
        provider: job.provider,
        budgetRaw: amountInRaw,
        budget: `${amountIn} USDC`,
      },
      quote: {
        amountOut: `${quote.amountOut} ${tokenOut}`,
        amountOutRaw: quote.amountOutRaw,
      },
      execution: {
        slippageBps: parsed.slippageBps,
        amountOutMinimum: ethers.formatUnits(amountOutMinimumRaw, tokenOutMeta.decimals),
        amountOutMinimumRaw: amountOutMinimumRaw.toString(),
        approveTx,
        swapTx,
      },
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid params', details: error.issues });
      return;
    }
    res.status(500).json({
      error: 'Failed to build post-settlement swap payloads',
      details: (error as Error).message,
    });
    return;
  }
});

// POST /api/v1/integrations/locus/send-usdc
app.post('/api/v1/integrations/locus/send-usdc', async (req: Request, res: Response) => {
  const schema = z.object({
    fromAgentId: z.string().min(1),
    toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    amountUsdc: z.string().min(1),
    chain: z.enum(['base', 'base-sepolia', 'celo', 'celo-sepolia']),
    memo: z.string().max(200).optional(),
  });

  try {
    const payload = schema.parse(req.body);
    const result = await locusService.sendUsdc(payload);
    res.json({ success: true, ...result });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid Locus payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to call Locus bridge', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/integrations/locus/tools
app.get('/api/v1/integrations/locus/tools', async (_req: Request, res: Response) => {
  try {
    const tools = await locusService.listTools();
    res.json({ success: true, tools });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to list Locus tools', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/payments/status
app.get('/api/v1/payments/status', (_req: Request, res: Response) => {
  res.json(machinePaymentsService.getStatus());
  return;
});

// POST /api/v1/payments/proxy
app.post('/api/v1/payments/proxy', async (req: Request, res: Response) => {
  const schema = z.object({
    provider: z.enum(['x402']).optional(),
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    headers: z.record(z.string()).optional(),
    body: z.unknown().optional(),
    paymentHeader: z.string().optional(),
  });

  try {
    const payload = schema.parse(req.body);
    const result = await machinePaymentsService.proxyRequest(payload);
    res.status(result.status === 402 ? 402 : 200).json(result);
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid machine payments payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to call machine payment provider', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/integrations/x402/status
app.get('/api/v1/integrations/x402/status', (_req: Request, res: Response) => {
  const status = machinePaymentsService.getStatus();
  res.json({
    success: status.success,
    primaryProvider: status.primaryProvider,
    providers: status.providers,
    useCase: status.useCase,
    endpoints: ['POST /api/v1/integrations/x402/proxy', ...status.endpoints],
  });
  return;
});

// POST /api/v1/integrations/x402/proxy
app.post('/api/v1/integrations/x402/proxy', async (req: Request, res: Response) => {
  const schema = z.object({
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    headers: z.record(z.string()).optional(),
    body: z.unknown().optional(),
    paymentHeader: z.string().optional(),
  });

  try {
    const payload = schema.parse(req.body);
    const result = await machinePaymentsService.proxyRequest({ ...payload, provider: 'x402' });
    res.status(result.status === 402 ? 402 : 200).json(result);
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid x402 proxy payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to call x402 endpoint', details: (error as Error).message });
    return;
  }
});

// POST /api/v1/integrations/metamask/delegation/build
app.post('/api/v1/integrations/metamask/delegation/build', async (req: Request, res: Response) => {
  const schema = z.object({
    delegator: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    delegate: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    escrowTarget: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    maxUsdc: z.string().min(1),
    expiryUnix: z.number().int().positive(),
    allowedMethods: z.array(z.string().min(3)).min(1),
  });

  try {
    const payload = schema.parse(req.body);
    const delegation = delegationService.buildDelegation(payload);
    res.json({ success: true, delegation });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid delegation payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to build delegation payload', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/discovery/providers
app.get('/api/v1/discovery/providers', async (req: Request, res: Response) => {
  const schema = z.object({
    query: z.string().optional(),
    minReputation: z
      .string()
      .transform((value) => Number(value))
      .pipe(z.number().int().min(0).max(1000))
      .optional(),
    maxBasePriceUsdc: z
      .string()
      .transform((value) => Number(value))
      .pipe(z.number().positive())
      .optional(),
    sources: z.string().optional(),
  });

  try {
    const params = schema.parse({
      query: req.query.query,
      minReputation: req.query.minReputation,
      maxBasePriceUsdc: req.query.maxBasePriceUsdc,
      sources: req.query.sources,
    });

    const sourceList = params.sources
      ? params.sources
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter((s) => ['x402n', 'virtuals', 'near', 'mock', 'imported'].includes(s))
      : undefined;

    const providers = await discoveryService.listProviderCandidates({
      query: params.query,
      minReputation: params.minReputation,
      maxBasePriceUsdc: params.maxBasePriceUsdc,
      sources: sourceList as any,
    });

    res.json({
      success: true,
      useCase: 'Find qualified provider agents before x402n negotiation and escrow commit',
      providers,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid query params', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch providers', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/discovery/sources
app.get('/api/v1/discovery/sources', (_req: Request, res: Response) => {
  res.json({
    success: true,
    neutral: true,
    sources: discoveryService.listSources(),
  });
});

// GET /api/v1/discovery/opportunities
app.get('/api/v1/discovery/opportunities', async (req: Request, res: Response) => {
  const schema = z.object({
    status: z.enum(['open', 'matched', 'archived']).optional(),
    limit: z
      .string()
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1).max(100))
      .optional(),
  });

  try {
    const params = schema.parse({
      status: req.query.status,
      limit: req.query.limit,
    });

    const opportunities = await opportunityBookService.list({
      status: params.status,
      limit: params.limit,
    });

    res.json({
      success: true,
      useCase: 'Persist unmatched buyer demand so providers can discover open opportunities later',
      opportunities,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid query params', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch opportunity book', details: (error as Error).message });
    return;
  }
});

// POST /api/v1/discovery/opportunities
app.post('/api/v1/discovery/opportunities', async (req: Request, res: Response) => {
  const schema = z.object({
    requestText: z.string().min(3),
    normalizedQuery: z.string().min(1),
    maxBudgetUsdc: z.number().positive().nullable().optional(),
    maxDeliveryHours: z.number().int().positive().nullable().optional(),
    matchesAtCreate: z.number().int().min(0).optional(),
    source: z.enum(['terminal', 'api']).optional(),
  });

  try {
    const payload = schema.parse(req.body);
    const opportunity = await opportunityBookService.create(payload);

    res.status(201).json({
      success: true,
      opportunity,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid opportunity payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to create opportunity', details: (error as Error).message });
    return;
  }
});

// POST /api/v1/discovery/providers/import
app.post('/api/v1/discovery/providers/import', (req: Request, res: Response) => {
  const schema = z.object({
    providers: z.array(
      z.object({
        providerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        evaluatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        source: z.enum(['x402n', 'virtuals', 'near', 'mock', 'imported']).default('imported'),
        serviceId: z.string().nullable(),
        serviceName: z.string().min(1),
        description: z.string().default(''),
        endpoint: z.string().nullable(),
        basePriceUsdc: z.string().nullable(),
        reputationScore: z.number().nullable(),
        erc8004AgentId: z.string().nullable(),
        erc8004Registered: z.boolean(),
      })
    ),
  });

  try {
    const payload = schema.parse(req.body);
    const result = discoveryService.importCandidates(payload.providers as any);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid import payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to import providers', details: (error as Error).message });
  }
});

// GET /api/v1/agents/:address - ERC-8004 identity source of truth
app.get('/api/v1/agents/:address', async (req: Request, res: Response) => {
  const address = req.params.address;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    res.status(400).json({ error: 'Invalid address' });
    return;
  }

  try {
    const identity = await discoveryService.getAgentIdentity(address);
    res.json({
      success: true,
      source: 'erc-8004',
      identity,
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve agent identity', details: (error as Error).message });
    return;
  }
});

// GET /api/v1/execution/providers
app.get('/api/v1/execution/providers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    neutral: true,
    providers: executionService.listProviders(),
  });
});

// POST /api/v1/execution/submit
app.post('/api/v1/execution/submit', async (req: Request, res: Response) => {
  const schema = z.object({
    provider: z.enum(['wallet', 'locus', 'bankr']),
    operation: z.enum(['send-usdc', 'send-tx']),
    payload: z.record(z.any()),
  });

  try {
    const payload = schema.parse(req.body);
    const result = await executionService.execute(payload);
    res.json({ success: true, result });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid execution payload', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Failed to execute request', details: (error as Error).message });
    return;
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const HOST = config.server.host;
const PORT = config.server.port;

app.listen(PORT, HOST, () => {
  console.log(`✅ DealRail API server running (Simplified - No Database) on ${HOST}:${PORT}`);
  console.log(`   Health: http://${HOST}:${PORT}/health`);
  console.log(`   API: http://${HOST}:${PORT}/api/v1`);
  console.log(`   Network: ${config.blockchain.activeChain}`);
  console.log(`   Chain ID: ${config.activeChainConfig.chainId}`);
  console.log(`   Escrow: ${config.activeChainConfig.contracts.escrowRailERC20}`);
  console.log();
});

export default app;
