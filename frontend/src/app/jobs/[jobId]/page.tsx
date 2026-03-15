'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsApi, Job, getErrorMessage } from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, encodePacked, keccak256 } from 'viem';
import { ESCROW_ABI, USDC_ABI, getEscrowAddress, getUSDCAddress } from '@/lib/contracts';

const stateColors: Record<string, string> = {
  Open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Funded: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Submitted: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  Expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const stateDescriptions: Record<string, string> = {
  Open: 'Job created, awaiting funding from client',
  Funded: 'Job funded, provider can start work',
  Submitted: 'Work submitted, awaiting evaluator approval',
  Completed: 'Work approved and payment released to provider',
  Rejected: 'Work rejected by evaluator',
  Expired: 'Job expired without completion',
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, chainId } = useAccount();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [fundAmount, setFundAmount] = useState('0.1');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [fundingStep, setFundingStep] = useState<'idle' | 'approving' | 'approved' | 'funding'>('idle');

  const jobId = params?.jobId ? parseInt(params.jobId as string) : null;

  // Contract write hooks
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  // Handle transaction confirmation and multi-step flows
  useEffect(() => {
    if (isConfirmed && jobId && chainId) {
      // Handle approval confirmation - proceed to funding
      if (fundingStep === 'approving') {
        setFundingStep('approved');
        setActionSuccess('USDC approved! Now funding job...');

        // Call fund after approval
        setTimeout(() => {
          const amount = parseUnits(fundAmount, 6);
          const escrowAddress = getEscrowAddress(chainId);

          setFundingStep('funding');
          writeContract({
            address: escrowAddress,
            abi: ESCROW_ABI,
            functionName: 'fund',
            args: [BigInt(jobId), amount],
          });
        }, 1000);
      } else {
        // Other transactions - reload job
        setTimeout(() => {
          loadJob();
          setActionSuccess('Transaction confirmed! Job updated.');
          setActionLoading(false);
          setFundingStep('idle');
          setTimeout(() => setActionSuccess(null), 5000);
        }, 2000); // Wait 2s for state to propagate
      }
    }
  }, [isConfirmed, jobId, chainId, fundingStep, fundAmount]);

  async function loadJob() {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      const jobData = await jobsApi.getByJobId(jobId);
      setJob(jobData);
    } catch (error) {
      console.error('Failed to load job:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  // Fund Job action (approve + fund)
  async function handleFundJob() {
    if (!jobId || !chainId || !address) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    setFundingStep('approving');

    try {
      const amount = parseUnits(fundAmount, 6); // USDC has 6 decimals
      const escrowAddress = getEscrowAddress(chainId);
      const usdcAddress = getUSDCAddress(chainId);

      // Step 1: Approve USDC (step 2 happens automatically in useEffect after confirmation)
      setActionSuccess('Step 1/2: Approving USDC...');
      writeContract({
        address: usdcAddress,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [escrowAddress, amount],
      });
    } catch (error) {
      console.error('Fund job error:', error);
      setActionError(getErrorMessage(error));
      setActionLoading(false);
      setFundingStep('idle');
    }
  }

  // Submit Deliverable action
  async function handleSubmitDeliverable() {
    if (!jobId || !chainId || !deliverableInput) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      // Convert deliverable string to bytes32 hash
      const deliverableHash = keccak256(encodePacked(['string'], [deliverableInput]));
      const escrowAddress = getEscrowAddress(chainId);

      setActionSuccess('Submitting deliverable...');
      writeContract({
        address: escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'submit',
        args: [BigInt(jobId), deliverableHash],
      });
    } catch (error) {
      console.error('Submit deliverable error:', error);
      setActionError(getErrorMessage(error));
      setActionLoading(false);
    }
  }

  // Complete Job action
  async function handleCompleteJob() {
    if (!jobId || !chainId) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const escrowAddress = getEscrowAddress(chainId);
      const reason = keccak256(encodePacked(['string'], ['Work approved']));

      setActionSuccess('Completing job...');
      writeContract({
        address: escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'complete',
        args: [BigInt(jobId), reason],
      });
    } catch (error) {
      console.error('Complete job error:', error);
      setActionError(getErrorMessage(error));
      setActionLoading(false);
    }
  }

  // Reject Job action
  async function handleRejectJob() {
    if (!jobId || !chainId) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const escrowAddress = getEscrowAddress(chainId);
      const reason = keccak256(encodePacked(['string'], ['Work rejected']));

      setActionSuccess('Rejecting job...');
      writeContract({
        address: escrowAddress,
        abi: ESCROW_ABI,
        functionName: 'reject',
        args: [BigInt(jobId), reason],
      });
    } catch (error) {
      console.error('Reject job error:', error);
      setActionError(getErrorMessage(error));
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto" />
            <p className="text-gray-400 mt-4">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-red-400 text-6xl mb-4">!</div>
            <h2 className="text-2xl font-bold text-gray-200 mb-4">
              Job Not Found
            </h2>
            <p className="text-gray-400 mb-8">{error || 'Job does not exist'}</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isClient = job.client.toLowerCase() === address?.toLowerCase();
  const isProvider = job.provider.toLowerCase() === address?.toLowerCase();
  const isEvaluator = job.evaluator.toLowerCase() === address?.toLowerCase();

  const expiryDate = new Date(job.expiry);
  const timeUntilExpiry = formatDistanceToNow(expiryDate, { addSuffix: true });
  const formattedExpiry = format(expiryDate, 'PPpp');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold">Job #{job.jobId}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Job Status</h2>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-lg border ${
                      stateColors[job.state]
                    }`}
                  >
                    {job.state}
                  </span>
                  {isClient && (
                    <span className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                      You're the Client
                    </span>
                  )}
                  {isProvider && (
                    <span className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">
                      You're the Provider
                    </span>
                  )}
                  {isEvaluator && (
                    <span className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                      You're the Evaluator
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {stateDescriptions[job.state]}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{job.budget}</div>
                <div className="text-sm text-gray-400">Budget</div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Participants</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Client</div>
                  <div className="font-mono text-gray-200">{job.client}</div>
                </div>
                {isClient && (
                  <span className="text-blue-400 text-sm font-semibold">You</span>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Provider</div>
                  <div className="font-mono text-gray-200">{job.provider}</div>
                </div>
                {isProvider && (
                  <span className="text-cyan-400 text-sm font-semibold">You</span>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Evaluator</div>
                  <div className="font-mono text-gray-200">{job.evaluator}</div>
                </div>
                {isEvaluator && (
                  <span className="text-purple-400 text-sm font-semibold">You</span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Expiry</div>
                <div className="text-gray-200">{formattedExpiry}</div>
                <div className="text-sm text-gray-500 mt-1">{timeUntilExpiry}</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Budget (Raw)</div>
                <div className="font-mono text-gray-200 text-sm break-all">
                  {job.budgetRaw}
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg md:col-span-2">
                <div className="text-sm text-gray-400 mb-1">Deliverable Hash</div>
                <div className="font-mono text-gray-200 text-sm break-all">
                  {job.deliverable === '0x0000000000000000000000000000000000000000000000000000000000000000'
                    ? 'Not submitted yet'
                    : job.deliverable}
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg md:col-span-2">
                <div className="text-sm text-gray-400 mb-1">Hook Contract</div>
                <div className="font-mono text-gray-200 text-sm break-all">
                  {job.hook === '0x0000000000000000000000000000000000000000'
                    ? 'No hook'
                    : job.hook}
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Explorer */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">On-Chain Verification</h3>
            <a
              href={job.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View on BaseScan
            </a>
          </div>

          {/* Action Timeline */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Next Steps</h3>

            {/* Success/Error Messages */}
            {actionSuccess && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400">{actionSuccess}</p>
              </div>
            )}
            {actionError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{actionError}</p>
              </div>
            )}

            {/* Transaction Status */}
            {hash && (
              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-semibold mb-1">
                      {isConfirming ? 'Confirming Transaction...' : 'Transaction Confirmed'}
                    </p>
                    <p className="text-gray-400 text-xs font-mono">
                      {hash.slice(0, 10)}...{hash.slice(-8)}
                    </p>
                  </div>
                  <a
                    href={`https://sepolia.basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    View on BaseScan
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* OPEN STATE - Fund Job */}
              {job.stateCode === 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-3">
                  <p className="text-blue-400">
                    {isClient
                      ? 'Fund this job to allow the provider to start work'
                      : 'Waiting for client to fund the escrow'}
                  </p>
                  {isClient && (
                    <div className="space-y-2">
                      {!address ? (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                          <p className="text-yellow-400 text-sm mb-2">Connect your wallet to fund this job</p>
                        </div>
                      ) : (
                        <>
                          <label className="block text-sm text-gray-300">
                            Amount (USDC)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white"
                            placeholder="0.1"
                          />
                          <button
                            onClick={handleFundJob}
                            disabled={isWritePending || isConfirming}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                          >
                            {isWritePending || isConfirming ? 'Processing...' : 'Fund Job'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* FUNDED STATE - Submit Deliverable */}
              {job.stateCode === 1 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-3">
                  <p className="text-purple-400">
                    {isProvider
                      ? 'Submit your deliverable when work is complete'
                      : 'Waiting for provider to submit deliverable'}
                  </p>
                  {isProvider && (
                    <div className="space-y-2">
                      {!address ? (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                          <p className="text-yellow-400 text-sm mb-2">Connect your wallet to submit deliverable</p>
                        </div>
                      ) : (
                        <>
                          <label className="block text-sm text-gray-300">
                            Deliverable (text will be hashed)
                          </label>
                          <textarea
                            value={deliverableInput}
                            onChange={(e) => setDeliverableInput(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white"
                            placeholder="Enter deliverable content or URL..."
                            rows={3}
                          />
                          <button
                            onClick={handleSubmitDeliverable}
                            disabled={!deliverableInput || isWritePending || isConfirming}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                          >
                            {isWritePending || isConfirming ? 'Processing...' : 'Submit Deliverable'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUBMITTED STATE - Complete/Reject */}
              {job.stateCode === 2 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg space-y-3">
                  <p className="text-orange-400">
                    {isEvaluator
                      ? 'Review the deliverable and approve or reject'
                      : 'Waiting for evaluator to review submission'}
                  </p>
                  {isEvaluator && (
                    <div className="space-y-2">
                      {!address ? (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                          <p className="text-yellow-400 text-sm mb-2">Connect your wallet to review this job</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleCompleteJob}
                            disabled={isWritePending || isConfirming}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                          >
                            {isWritePending || isConfirming ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={handleRejectJob}
                            disabled={isWritePending || isConfirming}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                          >
                            {isWritePending || isConfirming ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* COMPLETED STATE */}
              {job.stateCode === 3 && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400">
                    Job completed! Payment has been released to the provider.
                  </p>
                </div>
              )}

              {/* REJECTED STATE */}
              {job.stateCode === 4 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">
                    Work was rejected. Client can claim refund.
                  </p>
                </div>
              )}

              {/* EXPIRED STATE */}
              {job.stateCode === 5 && (
                <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                  <p className="text-gray-400">
                    Job expired. Client can claim refund if funds were escrowed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
