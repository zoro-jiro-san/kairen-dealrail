// DealRail Backend API Server (Simplified - No Database)
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { contractService } from './services/contract.service';
import { ethers } from 'ethers';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    blockchain: {
      network: config.blockchain.activeChain,
      chainId: config.activeChainConfig.chainId,
      escrowAddress: config.activeChainConfig.contracts.escrowRailERC20,
      usdcAddress: config.activeChainConfig.usdcAddress,
    },
  });
});

// GET /api/v1/jobs/:jobId - Get job details from blockchain
app.get('/api/v1/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await contractService.getJob(jobId);

    const stateNames = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'];

    res.json({
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
      explorerUrl: `https://sepolia.basescan.org/address/${config.activeChainConfig.contracts.escrowRailERC20}`,
    });
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
      return res.status(400).json({ error: 'Missing provider or evaluator address' });
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
      explorerUrl: `https://sepolia.basescan.org/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

// POST /api/v1/jobs/:jobId/fund - Fund a job
app.post('/api/v1/jobs/:jobId/fund', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { amount } = req.body; // Amount in USDC (e.g., "0.1")

    if (isNaN(jobId) || !amount) {
      return res.status(400).json({ error: 'Invalid jobId or amount' });
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
      explorerUrl: `https://sepolia.basescan.org/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error funding job:', error);
    res.status(500).json({ error: 'Failed to fund job', details: error.message });
  }
});

// POST /api/v1/jobs/:jobId/submit - Submit deliverable
app.post('/api/v1/jobs/:jobId/submit', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { deliverable, providerPrivateKey } = req.body;

    if (isNaN(jobId) || !deliverable || !providerPrivateKey) {
      return res.status(400).json({ error: 'Missing jobId, deliverable, or providerPrivateKey' });
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
      explorerUrl: `https://sepolia.basescan.org/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error submitting deliverable:', error);
    res.status(500).json({ error: 'Failed to submit deliverable', details: error.message });
  }
});

// POST /api/v1/jobs/:jobId/complete - Complete job (evaluator)
app.post('/api/v1/jobs/:jobId/complete', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const { reason, evaluatorPrivateKey } = req.body;

    if (isNaN(jobId) || !evaluatorPrivateKey) {
      return res.status(400).json({ error: 'Missing jobId or evaluatorPrivateKey' });
    }

    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reason || 'Approved'));

    const result = await contractService.completeJob({
      jobId,
      reasonHash,
      evaluatorPrivateKey,
    });

    res.json({
      success: true,
      jobId,
      reasonHash,
      txHash: result.txHash,
      explorerUrl: `https://sepolia.basescan.org/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ error: 'Failed to complete job', details: error.message });
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
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log('✅ DealRail API server running (Simplified - No Database)');
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API: http://localhost:${PORT}/api/v1`);
  console.log(`   Network: ${config.blockchain.activeChain}`);
  console.log(`   Chain ID: ${config.activeChainConfig.chainId}`);
  console.log(`   Escrow: ${config.activeChainConfig.contracts.escrowRailERC20}`);
  console.log();
});

export default app;
