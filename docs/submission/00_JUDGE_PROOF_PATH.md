# Judge Proof Path

This is the shortest possible judge path for DealRail.

## 1. What This Solves

Agents can pay for things today, but they still struggle to make trustworthy service deals.

DealRail solves the missing execution layer:
- negotiate or select a provider
- pay instantly or lock funds in escrow
- submit work
- complete or reject
- keep an auditable receipt trail

## 2. What Is Live

- browser desk: `https://dealrail.kairen.xyz/`
- backend API: `https://kairen-dealrail-production.up.railway.app/`
- npm package: `@kairenxyz/dealrail`
- Base Sepolia escrow proof
- Celo Sepolia happy and reject proof
- Base Sepolia x402 paid-request proof

## 3. Exact Demo Path

### Happy path
1. open `https://dealrail.kairen.xyz/`
2. run `npx @kairenxyz/dealrail doctor --json`
3. cite Base Sepolia happy-path receipts in [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)

### Reject path
4. cite Celo Sepolia reject-path receipts in [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)

### Agents-that-pay path
5. cite the x402 proof in [`docs/progress/X402_TESTNET_PROOF_2026-03-22.md`](../progress/X402_TESTNET_PROOF_2026-03-22.md)

## 4. Exact Proof Anchors

### Base Sepolia happy path
- create: `0xc88a6bcef436cad6fefb0e012bf7ccf57ea991905f6b22615287701692952430`
- complete: `0xfe06fa5f1c85d2c33f2c78c5d38fc03a2ab72628c292d3378830cd591f4cc519`

### Celo Sepolia reject path
- create: `0x772b595b728a565098a0d68567792dbff2bb71c3a524427c896ab440c7a9f3f1`
- reject: `0xb94efcdcfc41f7e3da223b9068e649797a575039d4e2e15b71b9beb19e31efb3`

### x402 paid request
- settlement: `0x8dfabc6a77205b0740aa7bc48e230b7516acc76295536d18a6a30db19476940c`

## 5. Track-to-Proof Links

- Open Track: [`tracks/OPEN_TRACK.md`](tracks/OPEN_TRACK.md)
- Protocol Labs ERC-8004: [`tracks/PROTOCOL_LABS_ERC8004.md`](tracks/PROTOCOL_LABS_ERC8004.md)
- Protocol Labs Let the Agent Cook: [`tracks/PROTOCOL_LABS_AGENT_COOK.md`](tracks/PROTOCOL_LABS_AGENT_COOK.md)
- Celo: [`tracks/CELO.md`](tracks/CELO.md)
- AgentCash / x402: [`tracks/AGENTCASH_X402.md`](tracks/AGENTCASH_X402.md)

## 6. Risk Table

| Risk | Mitigation | Residual risk |
|------|------------|---------------|
| Broad sponsor surface | Use readiness percentages and explicit blockers | Some adapters remain below primary-track threshold |
| Contract test setup friction | Root wrapper uses `scripts/forgew.sh` and docs now include exact fallback commands | Foundry still needs to exist locally |
| Judge proof stitching across many files | This doc plus track matrix and demo script reduce hops | Final video still matters |
