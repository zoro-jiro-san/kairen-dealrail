# x402 Testnet Proof

Date: 2026-03-22 UTC

Purpose: canonical human-readable note for the Base Sepolia paid-request proof used to strengthen the AgentCash / x402 track claim.

## Summary

- protocol: x402
- network: `eip155:84532`
- price: `0.01 USDC`
- payer: `0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e`
- payTo: `0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF`
- settlement tx: `0x8dfabc6a77205b0740aa7bc48e230b7516acc76295536d18a6a30db19476940c`
- explorer: `https://sepolia.basescan.org/tx/0x8dfabc6a77205b0740aa7bc48e230b7516acc76295536d18a6a30db19476940c`

## Source

- proof script: [`backend/tests/proof-x402-testnet.ts`](../../backend/tests/proof-x402-testnet.ts)
- canonical ledger: [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)

## Receipt Notes

- settlement receipt status: `success`
- observed USDC transfer log amount: `0x2710`
- decimal interpretation on Base Sepolia USDC: `0.01 USDC`

## Why This Matters

- This is a real paid request on testnet.
- It upgrades the repo from "x402 adapter surface exists" to "x402 paid flow is evidenced."
- It does not imply that x402n negotiation is fully live beyond the specific evidence recorded here.
