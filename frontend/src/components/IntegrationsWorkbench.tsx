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
    title: 'x402n Negotiation',
    when: 'Use when the buyer wants multi-round negotiation and offer ranking before settlement.',
    avoid: 'Avoid when the price is fixed and no bidding or evaluator path is needed.',
    input: 'Service requirement, budget, delivery target, provider market.',
    output: 'Negotiation session, confirmed batch, savings receipt.',
  },
  x402: {
    title: 'x402 Simple Payment',
    when: 'Use when the agent already knows the endpoint and just wants to pay for access or execution.',
    avoid: 'Avoid when the counterparty still needs to negotiate price or quality terms.',
    input: 'Endpoint URL and optional payment header.',
    output: 'Gateway response from the x402-compatible server.',
  },
  locus: {
    title: 'Locus Payout Rail',
    when: 'Use when the deal is decided and you want a cleaner payout or routing path for USDC.',
    avoid: 'Avoid before the deal is confirmed. Locus is for execution, not price discovery.',
    input: 'Agent ID, recipient address, amount.',
    output: 'Transfer response payload.',
  },
  delegation: {
    title: 'ERC-7710 Delegation',
    when: 'Use when a human wallet wants to authorize bounded escrow actions to an agent or operator.',
    avoid: 'Avoid if the human can act directly and does not need an agent to execute.',
    input: 'Delegate, target escrow, max amount, expiry.',
    output: 'Delegation payload and signature.',
  },
  uniswap: {
    title: 'Uniswap Treasury Routing',
    when: 'Use after settlement if the desk needs to rebalance or route proceeds to another asset.',
    avoid: 'Avoid as the primary settlement path. It is post-deal treasury tooling.',
    input: 'Amount in, minimum out, recipient.',
    output: 'Approve and swap transactions.',
  },
};

export function IntegrationsWorkbench() {
  const { address } = useAccount();
  const { sendTransactionAsync, data: txHash } = useSendTransaction();
  const { isLoading: txConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  const { signTypedDataAsync } = useSignTypedData();

  const [uniswapOut, setUniswapOut] = useState<string>('');
  const [locusOut, setLocusOut] = useState<string>('');
  const [delegationOut, setDelegationOut] = useState<string>('');
  const [x402Out, setX402Out] = useState<string>('');
  const [delegationSignature, setDelegationSignature] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [activeRail, setActiveRail] = useState<Rail>('x402n');
  const [locusTools, setLocusTools] = useState<Array<{ name?: string; id?: string; description?: string }>>([]);
  const [executionProviders, setExecutionProviders] = useState<Array<{ id: string; mode: string; useCase: string }>>([]);
  const [x402Endpoints, setX402Endpoints] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const [locus, execution, x402] = await Promise.all([
          integrationsApi.listLocusTools().catch(() => ({ tools: [] })),
          integrationsApi.listExecutionProviders().catch(() => ({ providers: [] })),
          integrationsApi.getX402Status().catch(() => ({ endpoints: [] })),
        ]);
        setLocusTools(Array.isArray(locus.tools) ? locus.tools : locus.tools?.tools || []);
        setExecutionProviders(execution.providers || []);
        setX402Endpoints(x402.endpoints || []);
      } catch {
        // non-blocking
      }
    })();
  }, []);

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

  async function probeX402() {
    setLoading(true);
    setError(null);
    try {
      const result = await integrationsApi.proxyX402({
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

  return (
    <section className="space-y-6">
      <div className="terminal-panel rounded-[1.25rem] p-6">
        <div className="terminal-kicker">Integration Strategies</div>
        <h2 className="mt-2 text-2xl font-semibold">Choose the rail that matches the stage of the deal</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--terminal-muted)]">
          The integrations page is for execution choices after you understand what stage you are in. Discovery and
          negotiation are not the same thing as payout or treasury routing.
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
            <div className="mt-2 text-xs text-[var(--terminal-muted)]">{railCopy[rail].when}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="terminal-panel rounded-[1.25rem] p-5 xl:col-span-4">
          <div className="terminal-kicker">Selected Strategy</div>
          <h3 className="mt-2 text-xl font-semibold">{railCopy[activeRail].title}</h3>
          <div className="mt-4 space-y-4 text-sm text-[var(--terminal-muted)]">
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

          <div className="mt-5 rounded-2xl border border-[var(--terminal-border)] bg-black/15 p-4">
            <div className="terminal-label">Available Metadata</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {x402Endpoints.map((endpoint) => (
                <span key={endpoint} className="terminal-chip">{endpoint}</span>
              ))}
              {executionProviders.map((provider) => (
                <span key={provider.id} className="terminal-chip">{provider.id}</span>
              ))}
              {locusTools.slice(0, 4).map((tool, idx) => (
                <span key={`${tool.id || tool.name || idx}`} className="terminal-chip">{tool.name || tool.id || 'tool'}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="terminal-panel rounded-[1.25rem] p-5 xl:col-span-8">
          <div className="terminal-kicker">Execution Workspace</div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {(activeRail === 'uniswap' || activeRail === 'x402n') && (
              <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/15 p-4 space-y-3">
                <div className="font-semibold">Uniswap Tx Builder</div>
                <p className="text-xs text-[var(--terminal-muted)]">Use after settlement when you want to rebalance the proceeds.</p>
                <input value={swapAmountIn} onChange={(e) => setSwapAmountIn(e.target.value)} className="terminal-input" placeholder="Amount in USDC (e.g. 10)" />
                <input value={swapMinOut} onChange={(e) => setSwapMinOut(e.target.value)} className="terminal-input" placeholder="Min out WETH (e.g. 0.001)" />
                <button onClick={buildUniswapTxs} disabled={loading} className="terminal-btn terminal-btn-accent w-full">Build Approve + Swap</button>
                <button onClick={() => executeBuiltTx(approveTx)} disabled={loading || !approveTx} className="terminal-btn w-full">Execute Approve Tx</button>
                <button onClick={() => executeBuiltTx(swapTx)} disabled={loading || !swapTx} className="terminal-btn w-full">Execute Swap Tx</button>
              </div>
            )}

            {(activeRail === 'locus' || activeRail === 'x402n') && (
              <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/15 p-4 space-y-3">
                <div className="font-semibold">Locus USDC Payout</div>
                <p className="text-xs text-[var(--terminal-muted)]">Use once the desk has decided who gets paid and how much.</p>
                <input value={locusAgentId} onChange={(e) => setLocusAgentId(e.target.value)} className="terminal-input" placeholder="From agent ID (buyer-agent)" />
                <input value={locusTo} onChange={(e) => setLocusTo(e.target.value)} className="terminal-input" placeholder="Recipient address 0x..." />
                <input value={locusAmount} onChange={(e) => setLocusAmount(e.target.value)} className="terminal-input" placeholder="USDC amount (e.g. 1)" />
                <button onClick={sendLocus} disabled={loading} className="terminal-btn terminal-btn-good w-full">Send via Locus</button>
              </div>
            )}

            {(activeRail === 'delegation' || activeRail === 'x402n') && (
              <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/15 p-4 space-y-3">
                <div className="font-semibold">ERC-7710 Delegation</div>
                <p className="text-xs text-[var(--terminal-muted)]">Use when a user wants an agent to execute bounded escrow actions.</p>
                <input value={delegate} onChange={(e) => setDelegate(e.target.value)} className="terminal-input" placeholder="Delegate address 0x..." />
                <input value={maxUsdc} onChange={(e) => setMaxUsdc(e.target.value)} className="terminal-input" placeholder="Max delegated USDC (e.g. 25)" />
                <button onClick={buildDelegation} disabled={loading} className="terminal-btn w-full">Build Delegation</button>
                <button onClick={signDelegationIntent} disabled={loading} className="terminal-btn terminal-btn-accent w-full">Sign Delegation Intent</button>
              </div>
            )}

            {(activeRail === 'x402' || activeRail === 'x402n') && (
              <div className="rounded-2xl border border-[var(--terminal-border)] bg-black/15 p-4 space-y-3">
                <div className="font-semibold">x402 Payment Probe</div>
                <p className="text-xs text-[var(--terminal-muted)]">Use when the endpoint is already known and you want a simple payment handshake.</p>
                <input value={x402Url} onChange={(e) => setX402Url(e.target.value)} className="terminal-input" placeholder="x402 endpoint URL" />
                <input value={x402PaymentHeader} onChange={(e) => setX402PaymentHeader(e.target.value)} className="terminal-input" placeholder="Optional X-PAYMENT header" />
                <button onClick={probeX402} disabled={loading} className="terminal-btn terminal-btn-accent w-full">Call x402 Endpoint</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="rounded border p-3 text-sm text-[var(--terminal-danger)]" style={{ borderColor: 'color-mix(in srgb, var(--terminal-danger) 50%, transparent)', background: 'color-mix(in srgb, var(--terminal-danger) 10%, transparent)' }}>{error}</div>}
      {txHash && (
        <div className="rounded border border-[var(--terminal-border)] bg-black/15 p-3 text-sm text-[var(--terminal-muted)]">
          Tx submitted: {txHash} {txConfirming ? '(confirming...)' : txConfirmed ? '(confirmed)' : ''}
        </div>
      )}
      {delegationSignature && (
        <div className="rounded border border-[var(--terminal-border)] bg-black/15 p-3 text-sm break-all text-[var(--terminal-muted)]">
          Delegation signature: {delegationSignature}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <div className="terminal-label">UNISWAP JSON OUTPUT</div>
          <pre className="rounded border border-[var(--terminal-border)] bg-black/25 p-3 overflow-auto max-h-64 text-[var(--terminal-muted)]">{uniswapOut || 'Approve and swap transaction payload appears here.'}</pre>
        </div>
        <div className="space-y-1">
          <div className="terminal-label">LOCUS JSON OUTPUT</div>
          <pre className="rounded border border-[var(--terminal-border)] bg-black/25 p-3 overflow-auto max-h-64 text-[var(--terminal-muted)]">{locusOut || 'Locus transfer response appears here.'}</pre>
        </div>
        <div className="space-y-1">
          <div className="terminal-label">DELEGATION JSON OUTPUT</div>
          <pre className="rounded border border-[var(--terminal-border)] bg-black/25 p-3 overflow-auto max-h-64 text-[var(--terminal-muted)]">{delegationOut || 'Delegation payload appears here.'}</pre>
        </div>
        <div className="space-y-1">
          <div className="terminal-label">X402 JSON OUTPUT</div>
          <pre className="rounded border border-[var(--terminal-border)] bg-black/25 p-3 overflow-auto max-h-64 text-[var(--terminal-muted)]">{x402Out || 'x402 endpoint response appears here.'}</pre>
        </div>
      </div>
    </section>
  );
}
