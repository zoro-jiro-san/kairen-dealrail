'use client';

import { useEffect, useState } from 'react';
import { jobsApi, Job } from '@/lib/api';
import { JobCard } from './JobCard';

interface JobsListProps {
  address?: string;
}

// Known job IDs on chain - update this as new jobs are created
const KNOWN_JOB_IDS = [1, 2, 3, 4, 5];

export function JobsList({ address }: JobsListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'client' | 'provider'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all known jobs from the blockchain
      const fetchedJobs = await jobsApi.getMultipleJobs(KNOWN_JOB_IDS);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setError('Failed to load jobs. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  }

  // Filter jobs based on selected filter and connected address
  const filteredJobs = jobs.filter(job => {
    if (!address || filter === 'all') return true;

    const addr = address.toLowerCase();
    if (filter === 'client') {
      return job.client.toLowerCase() === addr;
    } else if (filter === 'provider') {
      return job.provider.toLowerCase() === addr;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 border-b border-gray-700 pb-2 flex-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              filter === 'all'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All Jobs
          </button>
          <button
            onClick={() => setFilter('client')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              filter === 'client'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            My Jobs (Client)
          </button>
          <button
            onClick={() => setFilter('provider')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              filter === 'provider'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            My Work (Provider)
          </button>
        </div>
        <button
          onClick={loadJobs}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto" />
          <p className="text-gray-400 mt-4">Loading jobs from blockchain...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-300">
            No jobs found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'all'
              ? `Found ${jobs.length} total jobs on chain.`
              : `You don't have any jobs as ${filter}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.jobId} job={job} currentAddress={address} />
          ))}
        </div>
      )}
    </div>
  );
}
