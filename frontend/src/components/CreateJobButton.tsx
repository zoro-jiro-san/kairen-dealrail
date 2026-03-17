'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { ESCROW_ABI, getEscrowAddress, getHookAddress } from '@/lib/contracts';
import { Address } from 'viem';

export function CreateJobButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState('');
  const [evaluator, setEvaluator] = useState('');
  const [expiry, setExpiry] = useState('');
  const [useTrustHook, setUseTrustHook] = useState(true);
  const chainId = useChainId();

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider || !evaluator || !expiry) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const expiryTimestamp = Math.floor(new Date(expiry).getTime() / 1000);

      writeContract({
        address: getEscrowAddress(chainId),
        abi: ESCROW_ABI,
        functionName: 'createJob',
        args: [
          provider as Address,
          evaluator as Address,
          BigInt(expiryTimestamp),
          (useTrustHook ? getHookAddress(chainId) : '0x0000000000000000000000000000000000000000') as Address,
        ],
      });
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. See console for details.');
    }
  };

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setProvider('');
        setEvaluator('');
        setExpiry('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!isOpen) return;
    const prefProvider = localStorage.getItem('dealrail.prefProvider');
    const prefEvaluator = localStorage.getItem('dealrail.prefEvaluator');
    if (prefProvider && /^0x[a-fA-F0-9]{40}$/.test(prefProvider)) {
      setProvider(prefProvider);
    }
    if (prefEvaluator && /^0x[a-fA-F0-9]{40}$/.test(prefEvaluator)) {
      setEvaluator(prefEvaluator);
    }
  }, [isOpen]);

  // Show error if transaction fails
  useEffect(() => {
    if (error) {
      alert(`Transaction failed: ${error.message}`);
    }
  }, [error]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        + Create New Job
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Create New Job
              </h2>

              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="text-green-400 text-6xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Job Created!
                  </h3>
                  <p className="text-gray-400">
                    Your job has been created successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Provider Address
                    </label>
                    <input
                      type="text"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      disabled={isPending || isConfirming}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Evaluator Address
                    </label>
                    <input
                      type="text"
                      value={evaluator}
                      onChange={(e) => setEvaluator(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      disabled={isPending || isConfirming}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      disabled={isPending || isConfirming}
                    />
                  </div>

                  <label className="flex items-center gap-2 rounded border border-gray-600 bg-gray-900/40 px-3 py-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={useTrustHook}
                      onChange={(e) => setUseTrustHook(e.target.checked)}
                      disabled={isPending || isConfirming}
                    />
                    Use trust hook (ERC-8004 reputation checks and feedback writes)
                  </label>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      disabled={isPending || isConfirming}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isPending || isConfirming}
                    >
                      {isPending || isConfirming ? 'Creating...' : 'Create Job'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
