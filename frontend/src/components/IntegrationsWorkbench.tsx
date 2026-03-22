'use client';

import { useEffect, useState } from 'react';
import { integrationsApi, getErrorMessage } from '@/lib/api';
import { useAccount, useSendTransaction, useSignTypedData, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, toBytes } from 'viem';

type BuiltTx = {
  to: string;
  data: string;
  value: string;
  chainId: number;
};

type Rail = 'x402n' | 'x402' | 'locus' | 'delegation' | 'uniswap';

const railCopy: Record<
  Rail,
  {
    title: string;
    when: string;
    avoid: string;
    input: string;
    output: string;
  }
> = {
  x402n: {
    title: 'Market Competition',
    when: 'Use when the buyer does not know the winning provider yet and wants ranked offers before settlement.',
    avoid: 'Avoid when the endpoint and fixed price are already known.',
    input: 'Buyer requirement, budget, delivery target, provider supply.',
    output: 'Shortlist, negotiation session, confirmed deal posture.',
  },
  x402: {
    title: 'Machine Payments',
    when: 'Use when the agent already knows the endpoint and wants an Ethereum-native pay-per-call handshake.',
    avoid: 'Avoid when provider discovery or multi-round negotiation still needs to happen.',
    input: 'Payment provider, endpoint URL, and optional payment header.',
    output: 'Gateway response from the selected machine-payment adapter.',
  },
  locus: {
    title: 'Locus Payout Rail',
    when: 'Use once the deal is decided and only payout routing remains.',
    avoid: 'Avoid before a provider or offer has been selected.',
    input: 'Agent ID, recipient address, amount.',
    output: 'Transfer response payload.',
  },
  delegation: {
    title: 'ERC-7710 Delegation',
    when: 'Use when a human wallet wants to delegate bounded escrow actions to an agent.',
    avoid: 'Avoid if the user can sign and execute directly.',
    input: 'Delegate, target escrow, max amount, expiry.',
    output: 'Delegation payload and optional signature.',
  },
  uniswap: {
    title: 'Uniswap Treasury Routing',
    when: 'Use after settlement if treasury rebalancing is needed.',
    avoid: 'Avoid as the first step of a deal.',
    input: 'Amount in, minimum out, recipient.',
    output: 'Approve and swap transactions.',
  },
};

export function IntegrationsWorkbench() {
  const { address } = useAccount();
  const { sendTransactionAsync, data: txHash } = useSendTransaction();
  const { isLoading: txConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  const { signTypedDataAsync } = useSignTypedData();

  const [activeRail, setActiveRail] = useState<Rail>('x402n');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [x402Status, setX402Status] = useState<{ endpoints?: string[]; primaryProvider?: string } | null>(null);
  const [locusTools, setLocusTools] = useState<Array<{ name?: string; id?: string; description?: string }>>([]);
  const [executionProviders, setExecutionProviders] = useState<Array<{ id: string; mode: string; useCase: string }>>([]);
  const [providersPreview, setProvidersPreview] = useState<Array<{ serviceName: string; source: string; basePriceUsdc: string | null }>>([]);

  const [uniswapOut, setUniswapOut] = useState('');
  const [locusOut, setLocusOut] = useState('');
  const [delegationOut, setDelegationOut] = useState('');
  const [x402Out, setX402Out] = useState('');
  const [delegationSignature, setDelegationSignature] = useState('');
  const [approveTx, setApproveTx] = useState<BuiltTx | null>(null);
  const [swapTx, setSwapTx] = useState<BuiltTx | null>(null);

  const [swapAmountIn, setSwapAmountIn] = useState('10');
  const [swapMinOut, setSwapMinOut] = useState('0.001');
  const [locusAgentId, setLocusAgentId] = useState('buyer-agent');
  const [locusTo, setLocusTo] = useState('0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF');
  const [locusAmount, setLocusAmount] = useState('1');
  const [delegate, setDelegate] = useState('0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF');
  const [maxUsdc, setMaxUsdc] = useState('25');
  const [x402Url, setX402Url] = useState('https://www.x402.org');
  const [x402PaymentHeader, setX402PaymentHeader] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const [x402, locus, execution, providers] = await Promise.all([
          integrationsApi.getMachinePaymentsStatus().catch(() => ({ endpoints: [] })),
          integrationsApi.listLocusTools().catch(() => ({ tools: [] })),
          integrationsApi.listExecutionProviders().catch(() => ({ providers: [] })),
          integrationsApi.listProviders().catch(() => ({ providers: [] })),
        ]);

        setX402Status(x402);
        setLocusTools(Array.isArray(locus.tools) ? locus.tools : locus.tools?.tools || []);
        setExecutionProviders(execution.providers || []);
        setProvidersPreview(
          (providers.providers || []).slice(0, 3).map((provider) => ({
            serviceName: provider.serviceName,
            source: provider.source,
            basePriceUsdc: provider.basePriceUsdc,
          }))
        );
      } catch {
        // non-blocking
      }
    })();
  }, []);

  async function executeBuiltTx(tx: BuiltTx | null) {
    if (!tx) return;
    setError(null);
    try {
      await sendTransactionAsync({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value || '0'),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function buildUniswapTxs() {
    setLoading(true);
    setError(null);
    try {
      const approve = await integrationsApi.buildUniswapApproveTx({
        token: 'USDC',
        amount: swapAmountIn,
      });
      const swap = await integrationsApi.buildUniswapSwapTx({
        tokenIn: 'USDC',
        tokenOut: 'WETH',
        amountIn: swapAmountIn,
        amountOutMinimum: swapMinOut,
        fee: 3000,
        recipient: address || '0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e',
      });
      setApproveTx(approve.tx);
      setSwapTx(swap.tx);
      setUniswapOut(JSON.stringify({ approve, swap }, null, 2));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function sendLocus() {
    setLoading(true);
    setError(null);
    try {
      const result = await integrationsApi.sendLocusUsdc({
        fromAgentId: locusAgentId,
        toAddress: locusTo,
        amountUsdc: locusAmount,
        chain: 'base-sepolia',
        memo: 'DealRail hackathon payment',
      });
      setLocusOut(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function buildDelegation() {
    setLoading(true);
    setError(null);
    try {
      const result = await integrationsApi.buildDelegation({
        delegator: address || '0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e',
        delegate,
        escrowTarget: '0x53d368b5467524F7d674B70F00138a283e1533ce',
        maxUsdc,
        expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600,
        allowedMethods: ['fund(uint256,uint256)', 'createJob(address,address,uint256,address)'],
      });
      setDelegationOut(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function signDelegationIntent() {
    setError(null);
    setDelegationSignature('');
    try {
      const methodsHash = keccak256(toBytes('fund(uint256,uint256),createJob(address,address,uint256,address)'));
      const signature = await signTypedDataAsync({
        domain: {
          name: 'DealRailDelegationIntent',
          version: '1',
          chainId: 84532,
          verifyingContract: '0x53d368b5467524F7d674B70F00138a283e1533ce',
        },
        types: {
          DelegationIntent: [
            { name: 'delegator', type: 'address' },
            { name: 'delegate', type: 'address' },
            { name: 'target', type: 'address' },
            { name: 'maxUsdc', type: 'string' },
            { name: 'expiryUnix', type: 'uint256' },
            { name: 'methodsHash', type: 'bytes32' },
          ],
        },
        primaryType: 'DelegationIntent',
        message: {
          delegator: (address || '0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e') as `0x${string}`,
          delegate: delegate as `0x${string}`,
          target: '0x53d368b5467524F7d674B70F00138a283e1533ce',
          maxUsdc,
          expiryUnix: BigInt(Math.floor(Date.now() / 1000) + 24 * 3600),
          methodsHash,
        },
      });
      setDelegationSignature(signature);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function probeX402() {
    setLoading(true);
    setError(null);
    try {
      const result = await integrationsApi.proxyMachinePayment({
        provider: 'x402',
        url: x402Url,
        method: 'GET',
        paymentHeader: x402PaymentHeader || undefined,
      });
      setX402Out(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function renderWorkspace() {
    if (activeRail === 'x402n') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5">
            <div className="font-semibold">How competition fits into DealRail</div>
            <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--terminal-muted)]">
              <div>1. `scan` or `buy` discovers supply from provider feeds.</div>
              <div>2. The market layer handles ranking and counter-rounds when the winner is not known yet.</div>
              <div>3. Once an offer is accepted, DealRail routes the outcome into machine payment, escrow, delegation, or payout rails.</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5">
            <div className="terminal-label">Visible Supply</div>
            <div className="mt-3 space-y-2">
              {providersPreview.length > 0 ? providersPreview.map((provider) => (
                <div key={`${provider.source}-${provider.serviceName}`} className="rounded-xl border border-[var(--terminal-border)] bg-black/10 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 break-words font-medium">{provider.serviceName}</div>
                    <div className="terminal-chip">{provider.source}</div>
                  </div>
                  <div className="mt-1 text-xs text-[var(--terminal-muted)]">Base {provider.basePriceUsdc ?? 'n/a'} USDC</div>
                </div>
              )) : (
                <div className="text-sm text-[var(--terminal-muted)]">No provider preview returned yet.</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeRail === 'x402') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5 space-y-3">
            <div className="font-semibold">Machine Payment Probe</div>
            <p className="text-sm leading-6 text-[var(--terminal-muted)]">Use only when the endpoint is already known and negotiation is over. x402 is the first adapter.</p>
            <input value={x402Url} onChange={(e) => setX402Url(e.target.value)} className="terminal-input" placeholder="machine-payment endpoint URL" />
            <input value={x402PaymentHeader} onChange={(e) => setX402PaymentHeader(e.target.value)} className="terminal-input" placeholder="Optional X-PAYMENT header" />
            <button onClick={probeX402} disabled={loading} className="terminal-btn terminal-btn-accent w-full">Call Payment Adapter</button>
          </div>
          <pre className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4 overflow-auto text-xs text-[var(--terminal-muted)]">{x402Out || 'Machine-payment response will appear here.'}</pre>
        </div>
      );
    }

    if (activeRail === 'locus') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5 space-y-3">
            <div className="font-semibold">Locus USDC Payout</div>
            <p className="text-sm leading-6 text-[var(--terminal-muted)]">Use after the desk already knows who gets paid.</p>
            <input value={locusAgentId} onChange={(e) => setLocusAgentId(e.target.value)} className="terminal-input" placeholder="From agent ID" />
            <input value={locusTo} onChange={(e) => setLocusTo(e.target.value)} className="terminal-input" placeholder="Recipient address 0x..." />
            <input value={locusAmount} onChange={(e) => setLocusAmount(e.target.value)} className="terminal-input" placeholder="USDC amount" />
            <button onClick={sendLocus} disabled={loading} className="terminal-btn terminal-btn-good w-full">Send via Locus</button>
          </div>
          <pre className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4 overflow-auto text-xs text-[var(--terminal-muted)]">{locusOut || 'Locus response will appear here.'}</pre>
        </div>
      );
    }

    if (activeRail === 'delegation') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5 space-y-3">
            <div className="font-semibold">ERC-7710 Delegation</div>
            <p className="text-sm leading-6 text-[var(--terminal-muted)]">Use when a human wallet needs an agent to execute bounded escrow actions.</p>
            <input value={delegate} onChange={(e) => setDelegate(e.target.value)} className="terminal-input" placeholder="Delegate address 0x..." />
            <input value={maxUsdc} onChange={(e) => setMaxUsdc(e.target.value)} className="terminal-input" placeholder="Max delegated USDC" />
            <button onClick={buildDelegation} disabled={loading} className="terminal-btn w-full">Build Delegation</button>
            <button onClick={signDelegationIntent} disabled={loading} className="terminal-btn terminal-btn-accent w-full">Sign Delegation Intent</button>
          </div>
          <pre className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4 overflow-auto text-xs text-[var(--terminal-muted)]">{delegationOut || 'Delegation payload will appear here.'}</pre>
          {delegationSignature && (
            <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4 break-all text-xs text-[var(--terminal-muted)]">
              Signature: {delegationSignature}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5 space-y-3">
          <div className="font-semibold">Uniswap Treasury Routing</div>
          <p className="text-sm leading-6 text-[var(--terminal-muted)]">Use only after settlement when proceeds need treasury routing.</p>
          <input value={swapAmountIn} onChange={(e) => setSwapAmountIn(e.target.value)} className="terminal-input" placeholder="Amount in USDC" />
          <input value={swapMinOut} onChange={(e) => setSwapMinOut(e.target.value)} className="terminal-input" placeholder="Minimum out" />
          <button onClick={buildUniswapTxs} disabled={loading} className="terminal-btn terminal-btn-accent w-full">Build Approve + Swap</button>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <button onClick={() => executeBuiltTx(approveTx)} disabled={loading || !approveTx} className="terminal-btn w-full">Execute Approve</button>
            <button onClick={() => executeBuiltTx(swapTx)} disabled={loading || !swapTx} className="terminal-btn w-full">Execute Swap</button>
          </div>
        </div>
        <pre className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4 overflow-auto text-xs text-[var(--terminal-muted)]">{uniswapOut || 'Uniswap payloads will appear here.'}</pre>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="terminal-panel rounded-[1.5rem] p-6">
        <div className="terminal-kicker">Rail Selector</div>
        <h2 className="mt-2 text-2xl font-semibold">Pick the rail for the current stage of the deal</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--terminal-muted)]">
          This page should answer one question: what rail do you use now that you know the state of the deal? It should
          not force you to decode a wall of unlabeled boxes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        {(Object.keys(railCopy) as Rail[]).map((rail) => (
          <button
            key={rail}
            type="button"
            onClick={() => setActiveRail(rail)}
            className={`rounded-[1.25rem] border p-4 text-left transition ${
              activeRail === rail
                ? 'border-[var(--terminal-accent)] bg-[var(--terminal-accent)]/10'
                : 'border-[var(--terminal-border)] bg-black/10'
            }`}
          >
            <div className="terminal-kicker">{rail}</div>
            <div className="mt-2 font-semibold">{railCopy[rail].title}</div>
            <div className="mt-2 text-xs leading-5 text-[var(--terminal-muted)]">{railCopy[rail].when}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-4">
          <div className="terminal-kicker">Selected Rail</div>
          <h3 className="mt-2 text-xl font-semibold">{railCopy[activeRail].title}</h3>
          <div className="mt-5 space-y-5 text-sm leading-6 text-[var(--terminal-muted)]">
            <div>
              <div className="terminal-label">When to use</div>
              <div className="mt-1">{railCopy[activeRail].when}</div>
            </div>
            <div>
              <div className="terminal-label">When not to use</div>
              <div className="mt-1">{railCopy[activeRail].avoid}</div>
            </div>
            <div>
              <div className="terminal-label">What you input</div>
              <div className="mt-1">{railCopy[activeRail].input}</div>
            </div>
            <div>
              <div className="terminal-label">What comes back</div>
              <div className="mt-1">{railCopy[activeRail].output}</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4">
            <div className="terminal-label">Live metadata</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(x402Status?.endpoints || []).map((endpoint) => (
                <span key={endpoint} className="terminal-chip">{endpoint}</span>
              ))}
              {x402Status?.primaryProvider ? (
                <span className="terminal-chip">payments:{x402Status.primaryProvider}</span>
              ) : null}
              {executionProviders.map((provider) => (
                <span key={provider.id} className="terminal-chip">{provider.id}:{provider.mode}</span>
              ))}
              {locusTools.slice(0, 3).map((tool, idx) => (
                <span key={`${tool.id || tool.name || idx}`} className="terminal-chip">{tool.name || tool.id || 'tool'}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-8">
          <div className="terminal-kicker">Workspace</div>
          <div className="mt-4">{renderWorkspace()}</div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border p-4 text-sm text-[var(--terminal-danger)]" style={{ borderColor: 'color-mix(in srgb, var(--terminal-danger) 40%, transparent)', background: 'color-mix(in srgb, var(--terminal-danger) 8%, transparent)' }}>
          {error}
        </div>
      )}

      {txHash && (
        <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-4 text-sm text-[var(--terminal-muted)]">
          Tx submitted: {txHash} {txConfirming ? '(confirming...)' : txConfirmed ? '(confirmed)' : ''}
        </div>
      )}
    </section>
  );
}
