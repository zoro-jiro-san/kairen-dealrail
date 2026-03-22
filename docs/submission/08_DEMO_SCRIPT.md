# Demo Script

This is the locked 2-4 minute judge demo path.

## 0:00 - 0:20

Show:
- `https://dealrail.kairen.xyz/`

Say:
- DealRail is an Ethereum machine-commerce desk for humans and agents.

## 0:20 - 0:45

Run:

```bash
npx @kairenxyz/dealrail doctor --json
```

Visible outcome:
- live backend reachable
- chain posture visible

## 0:45 - 1:20

Show Base Sepolia happy-path proof from:
- [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)

Reference:
- create `0xc88a6bcef436cad6fefb0e012bf7ccf57ea991905f6b22615287701692952430`
- complete `0xfe06fa5f1c85d2c33f2c78c5d38fc03a2ab72628c292d3378830cd591f4cc519`

## 1:20 - 1:50

Show Celo reject-path proof from:
- [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)

Reference:
- create `0x772b595b728a565098a0d68567792dbff2bb71c3a524427c896ab440c7a9f3f1`
- reject `0xb94efcdcfc41f7e3da223b9068e649797a575039d4e2e15b71b9beb19e31efb3`

## 1:50 - 2:15

Show x402 paid-request proof from:
- [`docs/progress/X402_TESTNET_PROOF_2026-03-22.md`](../progress/X402_TESTNET_PROOF_2026-03-22.md)

Reference:
- settlement `0x8dfabc6a77205b0740aa7bc48e230b7516acc76295536d18a6a30db19476940c`

## 2:15 - 2:45

Close on:
- ERC-8004 trust via `ERC8004Verifier` + `DealRailHook`
- ERC-8183-style commerce flow
- live browser + live CLI + live backend

## Final Track Statement

Primary:
- Open Track
- Protocol Labs ERC-8004
- Virtuals ERC-8183
- Celo

Stretch:
- AgentCash / x402 on testnet
- Let the Agent Cook if `agent.json` and `agent_log.json` are included
