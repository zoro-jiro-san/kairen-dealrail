// Job Lifecycle API Routes
import { Router, Request, Response } from 'express';
import { contractService, JobState } from '../services/contract.service';
import { config } from '../config';
import { ethers } from 'ethers';

const router = Router();

/**
 * GET /api/v1/jobs/:jobId
 * Get job details
 */
router.get('/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await contractService.getJob(jobId);
    res.json({ job });
  } catch (error) {
    console.error(`Error getting job ${req.params.jobId}:`, error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

/**
 * POST /api/v1/jobs
 * Create a new job
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { provider, evaluator, expiryDays } = req.body;

    if (!provider || !evaluator) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      jobId: result.jobId,
      txHash: result.txHash,
      explorerUrl: `https://sepolia.basescan.org/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

export default router;
