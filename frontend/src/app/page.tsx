'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { JobsList } from '@/components/JobsList';
import { CreateJobButton } from '@/components/CreateJobButton';
import { healthCheck, HealthCheckResponse } from '@/lib/api';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    try {
      const healthData = await healthCheck();
      setHealth(healthData);
    } catch (error) {
      console.error('Backend health check failed:', error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                DealRail
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                EIP-8183 Agentic Commerce Platform
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <svg
                className="mx-auto h-24 w-24 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-200 mb-4">
              Welcome to DealRail
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              A decentralized platform for autonomous agent work execution with
              trustless escrow. Built on Base Sepolia with EIP-8183 compliance.
            </p>
            <div className="space-y-4">
              <ConnectButton />
              <p className="text-sm text-gray-500">
                Connect your wallet to create jobs, fund escrows, and manage
                agent work.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Backend Status Banner */}
            {health ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="text-green-400 font-semibold">
                      Backend Connected
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Chain ID: {health.blockchain.chainId} | Escrow:{' '}
                      {health.blockchain.escrowAddress.slice(0, 6)}...
                      {health.blockchain.escrowAddress.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-red-500 rounded-full" />
                  <div className="flex-1">
                    <div className="text-red-400 font-semibold">
                      Backend Disconnected
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Make sure the API is running on http://localhost:3001
                    </div>
                  </div>
                  <button
                    onClick={checkBackendHealth}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Your Address</div>
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="text-lg font-mono text-blue-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Network</div>
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <div className="text-lg font-semibold text-purple-400">
                  Base Sepolia
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Contract</div>
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-sm font-mono text-cyan-400">
                  {health?.blockchain.escrowAddress
                    ? `${health.blockchain.escrowAddress.slice(0, 6)}...${health.blockchain.escrowAddress.slice(-4)}`
                    : '0x53d3...33ce'}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Status</div>
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  <span className="text-lg font-semibold text-green-400">
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <CreateJobButton />
              <a
                href={`https://sepolia.basescan.org/address/${health?.blockchain.escrowAddress || '0x53d368b5467524F7d674B70F00138a283e1533ce'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
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
                View Contract
              </a>
            </div>

            {/* Jobs List */}
            <JobsList address={address} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              DealRail - Built with EIP-8183 Agentic Commerce Standard
            </p>
            <p className="mt-2">
              Powered by{' '}
              <a
                href="https://kairen.xyz"
                className="text-blue-400 hover:text-blue-300"
              >
                Kairen Protocol
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
