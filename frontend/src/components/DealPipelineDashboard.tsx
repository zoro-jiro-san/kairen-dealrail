'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  DealConfirmation,
  Job,
  NegotiationActivity,
  NegotiationBatch,
  NegotiationOffer,
  NegotiationSession,
  SavingsReceipt,
  getErrorMessage,
  jobsApi,
  x402nApi,
} from '@/lib/api';

const stepLabels = [
  'Policy Set',
  'Auction Running',
  'Batch Prepared',
  'Deal Confirmed',
  'Escrow Funded',
  'Delivery + Evaluation',
];

type NetworkMode = 'demo' | 'testnet' | 'mainnet';

function Step({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full ${
          active ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.20)]' : 'bg-gray-600'
        }`}
      />
      <span className={active ? 'text-emerald-300' : 'text-gray-400'}>{label}</span>
    </div>
  );
}

export function DealPipelineDashboard() {
  const [serviceRequirement, setServiceRequirement] = useState(
    'Generate a verified benchmark report for model latency and cost.'
  );
  const [maxBudgetUsdc, setMaxBudgetUsdc] = useState('0.12');
  const [maxDeliveryHours, setMaxDeliveryHours] = useState('24');
  const [minReputationScore, setMinReputationScore] = useState('700');
  const [maxRounds, setMaxRounds] = useState('3');
  const [batchSize, setBatchSize] = useState('2');
  const [autoCounterStepBps, setAutoCounterStepBps] = useState('500');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('testnet');

  const [session, setSession] = useState<NegotiationSession | null>(null);
  const [acceptedOffer, setAcceptedOffer] = useState<NegotiationOffer | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<NegotiationBatch | null>(null);
  const [confirmation, setConfirmation] = useState<DealConfirmation | null>(null);
  const [receipt, setReceipt] = useState<SavingsReceipt | null>(null);
  const [activities, setActivities] = useState<NegotiationActivity[]>([]);

  const [trackedJobId, setTrackedJobId] = useState('');
  const [trackedJob, setTrackedJob] = useState<Job | null>(null);

  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      try {
        const feed = await x402nApi.getActivities(session.negotiationId, 30);
        setActivities(feed.activities);
      } catch {
        // non-blocking
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session]);

  const steps = useMemo(() => {
    const stateCode = trackedJob?.stateCode ?? -1;
    return [
      !!session,
      !!session && (session.roundsCompleted > 0 || session.offers.length > 0),
      !!selectedBatch,
      !!confirmation,
      stateCode >= 1,
      stateCode >= 2,
    ];
  }, [session, selectedBatch, confirmation, trackedJob]);

  async function handleCreateRfo(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await x402nApi.createRfo({
        serviceRequirement,
        maxBudgetUsdc: Number(maxBudgetUsdc),
        maxDeliveryHours: Number(maxDeliveryHours),
        minReputationScore: Number(minReputationScore),
        auctionMode: 'reverse_auction',
        maxRounds: Number(maxRounds),
        batchSize: Number(batchSize),
        autoCounterStepBps: Number(autoCounterStepBps),
        networkMode,
      });
      setSession(result);
      setAcceptedOffer(null);
      setSelectedBatch(null);
      setConfirmation(null);
      setReceipt(null);
      setTrackedJob(null);
      setActivities(result.activities || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCounterRound() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const result = await x402nApi.runCounterRound(session.negotiationId);
      setSession(result.negotiation);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptOffer(offerId: string) {
    if (!session) return;

    setLoading(true);
    setError(null);
    try {
      const result = await x402nApi.acceptOffer(session.negotiationId, offerId);
      setSession(result.negotiation);
      setAcceptedOffer(result.acceptedOffer);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBatch() {
    if (!session) return;
    setLoading(true);
    setError(null);

    try {
      const selectedOfferIds = acceptedOffer ? [acceptedOffer.offerId] : undefined;
      const result = await x402nApi.createBatch(session.negotiationId, selectedOfferIds);
      setSession(result.negotiation);
      setSelectedBatch(result.batch);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmBatch() {
    if (!session || !selectedBatch) return;
    setLoading(true);
    setError(null);

    try {
      const result = await x402nApi.confirmBatch(
        session.negotiationId,
        selectedBatch.batchId,
        acceptedOffer?.offerId
      );
      setSession(result.negotiation);
      setConfirmation(result.confirmation);
      setReceipt(result.receipt);
      setAcceptedOffer(result.selectedOffer);

      const latestReceipt = await x402nApi.getReceipt(session.negotiationId);
      setReceipt(latestReceipt.receipt);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function trackJob() {
    if (!trackedJobId) return;
    setTracking(true);
    setError(null);
    try {
      const job = await jobsApi.getByJobId(Number(trackedJobId));
      setTrackedJob(job);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTracking(false);
    }
  }

  return (
    <section className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Deal Pipeline (Reverse Auction + Confirmation)</h2>
        <p className="text-sm text-gray-400 mt-1">
          Human or agent defines policy. Agents run reverse-auction rounds, batch offers, confirm one deal, then settle
          onchain.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['demo', 'testnet', 'mainnet'] as NetworkMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setNetworkMode(mode)}
            className={`px-3 py-1 rounded text-sm border ${
              networkMode === mode
                ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                : 'bg-gray-900/40 border-gray-700 text-gray-400'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <form onSubmit={handleCreateRfo} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={serviceRequirement}
          onChange={(e) => setServiceRequirement(e.target.value)}
          className="md:col-span-4 bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white"
          placeholder="Service requirement"
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={maxBudgetUsdc}
          onChange={(e) => setMaxBudgetUsdc(e.target.value)}
          className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white"
          placeholder="Max budget (USDC)"
        />
        <input
          type="number"
          min="1"
          value={maxDeliveryHours}
          onChange={(e) => setMaxDeliveryHours(e.target.value)}
          className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white"
          placeholder="Max delivery hours"
        />
        <input
          type="number"
          min="0"
          max="1000"
          value={minReputationScore}
          onChange={(e) => setMinReputationScore(e.target.value)}
          className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white"
          placeholder="Min reputation"
        />
        <input
          type="number"
          min="1"
          max="10"
          value={maxRounds}
          onChange={(e) => setMaxRounds(e.target.value)}
          className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white"
          placeholder="Max rounds"
        />
        <input
          type="number"
          min="1"
          max="8"
          value={batchSize}
          onChange={(e) => setBatchSize(e.target.value)}
          className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white"
          placeholder="Batch size"
        />
        <input
          type="number"
          min="50"
          max="2000"
          value={autoCounterStepBps}
          onChange={(e) => setAutoCounterStepBps(e.target.value)}
          className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white"
          placeholder="Counter step (bps)"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded px-4 py-2"
        >
          {loading ? 'Negotiating...' : 'Start Reverse Auction'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stepLabels.map((label, idx) => (
          <Step key={label} label={label} active={steps[idx]} />
        ))}
      </div>

      {session && (
        <div className="space-y-3">
          <div className="text-sm text-gray-400">
            Negotiation ID: <span className="font-mono text-gray-200">{session.negotiationId}</span> ({session.mode} |{' '}
            {session.policy.networkMode})
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCounterRound}
              disabled={loading || session.roundsCompleted >= session.maxRounds}
              className="text-sm bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 text-white font-medium rounded px-3 py-2"
            >
              Run Counter Round ({session.roundsCompleted}/{session.maxRounds})
            </button>
            <button
              onClick={handleCreateBatch}
              disabled={loading || session.offers.length === 0}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-medium rounded px-3 py-2"
            >
              Create Offer Batch
            </button>
            <button
              onClick={handleConfirmBatch}
              disabled={loading || !selectedBatch}
              className="text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white font-medium rounded px-3 py-2"
            >
              Confirm Deal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {session.offers.map((offer) => (
              <div key={offer.offerId} className="rounded border border-gray-600 p-3 bg-gray-900/40 space-y-2">
                <div className="text-sm text-gray-300 font-semibold">{offer.offerId}</div>
                <div className="text-sm text-gray-400">
                  Price: <span className="text-gray-200">{offer.priceUsdc} USDC</span>
                </div>
                <div className="text-sm text-gray-400">
                  Initial: <span className="text-gray-200">{offer.initialPriceUsdc} USDC</span>
                </div>
                <div className="text-sm text-gray-400">
                  Round: <span className="text-gray-200">{offer.round}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Delivery: <span className="text-gray-200">{offer.deliveryHours}h</span>
                </div>
                <div className="text-sm text-gray-400">
                  Rep: <span className="text-gray-200">{offer.reputationScore}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Score: <span className="text-emerald-300">{offer.score}</span>
                </div>
                <button
                  onClick={() => handleAcceptOffer(offer.offerId)}
                  disabled={loading}
                  className="w-full text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white font-medium rounded px-3 py-2"
                >
                  Select Offer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedBatch && (
        <div className="rounded border border-indigo-500/40 bg-indigo-500/10 p-4 space-y-2 text-sm">
          <div className="text-indigo-300 font-semibold">Active Batch</div>
          <div className="text-gray-300">Batch ID: <span className="font-mono">{selectedBatch.batchId}</span></div>
          <div className="text-gray-300">Offers: {selectedBatch.offerIds.join(', ')}</div>
          <div className="text-gray-300">Status: {selectedBatch.status}</div>
        </div>
      )}

      {confirmation && (
        <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2 text-sm">
          <div className="text-emerald-300 font-semibold">Deal Confirmation</div>
          <div className="text-gray-300">Confirmation ID: <span className="font-mono">{confirmation.confirmationId}</span></div>
          <div className="text-gray-300">Provider: <span className="font-mono">{confirmation.provider}</span></div>
          <div className="text-gray-300">Evaluator: <span className="font-mono">{confirmation.evaluator}</span></div>
          <div className="text-gray-300">Expected Delivery: {confirmation.expectedDeliveryHours}h</div>
        </div>
      )}

      {receipt && (
        <div className="rounded border border-cyan-500/40 bg-cyan-500/10 p-4 space-y-2 text-sm">
          <div className="text-cyan-300 font-semibold">Savings Receipt</div>
          <div className="text-gray-300">Receipt ID: <span className="font-mono">{receipt.receiptId}</span></div>
          <div className="text-gray-300">Baseline: {receipt.baselinePriceUsdc} USDC</div>
          <div className="text-gray-300">Settled: {receipt.settledPriceUsdc} USDC</div>
          <div className="text-gray-300">Saved: {receipt.savedUsdc} USDC ({receipt.savedPct}%)</div>
          <div className="text-gray-300">Mode: {receipt.networkMode}</div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm text-gray-300 font-medium">Live Activity Feed</div>
        <div className="max-h-48 overflow-auto space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded border border-gray-700 bg-gray-900/40 p-2 text-xs">
              <div className="text-gray-200">{activity.message}</div>
              <div className="text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          {activities.length === 0 && <div className="text-xs text-gray-500">No activity yet.</div>}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          value={trackedJobId}
          onChange={(e) => setTrackedJobId(e.target.value)}
          placeholder="Track Job ID"
          className="bg-gray-900/60 border border-gray-600 rounded px-3 py-2 text-white w-44"
        />
        <button
          onClick={trackJob}
          disabled={tracking}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded px-4 py-2"
        >
          {tracking ? 'Tracking...' : 'Track'}
        </button>
        {trackedJob && (
          <div className="text-sm text-gray-300 self-center">
            State: <span className="font-semibold">{trackedJob.state}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
      )}
    </section>
  );
}
