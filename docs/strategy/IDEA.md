# Kairen DealRail — Detailed Hackathon Idea (V2)

## Positioning
**Negotiate offchain, commit onchain, settle by proof.**

Kairen DealRail is a machine-native deal execution rail where agents negotiate within human-defined limits, lock funds in escrow, and release settlement only after verifiable delivery checks.

## Why this matters (Synthesis fit)
Primary theme: **Agents that cooperate**
Secondary themes: **Agents that pay**, **Agents that trust**

This solves the trust gap between "agent agreement" and "enforceable execution".

## Product variants considered
### Variant A (chosen for build): Deal Pipeline for Agent Operators
- Human sets policy bounds (price, counterparty, deadline, chain)
- Agent negotiates inside those bounds
- Smart contract enforces escrow + settlement
- Best balance of demoability + real utility

### Variant B (pitch): Stripe-for-Agents B2B rail
- Open deal matching + composable settlement
- Strong market narrative, larger scope

### Variant C (roadmap): Private deal layer
- ZK-gated negotiation/authorization
- High novelty, high implementation risk

## MVP scope (strict)
1. **DealIntent schema**
2. **Bounded negotiation artifacts** (offer/counter-offer)
3. **Escrow state machine contract**
4. **Settlement proof object + verification step**
5. **Audit timeline** (events + signed artifacts)

## Contract boundaries
- `EscrowRail` (core state transitions)
- `NegotiationLog` (hashes/signatures/events)

State model:
`CREATED -> FUNDED -> ACCEPTED -> COMPLETED`
With branches:
`DISPUTED -> RESOLVED` and `CANCELLED`

## TX safety model (must-pass)
Pipeline:
`Preflight -> Approval -> Simulation -> Broadcast -> Settlement Check`

Risk tiers:
- **SAFE**: read-only/simulation
- **CAUTION**: requires additional checks + explicit confirmation
- **ESCALATE**: halt and require direct human approval

Hard rules:
- no unlimited approvals
- no unverified addresses/contracts
- no state-changing tx without explicit human confirmation
- mandatory simulation before broadcast

## Chain strategy
- Local: Anvil
- Test: Base Sepolia
- Demo: Base Mainnet (cost-effective and reliable for story)

## 7-day execution plan
Day 1: scope freeze + interfaces
Day 2: escrow contract MVP + unit tests
Day 3: negotiation artifact flow + signatures
Day 4: backend/API + event timeline
Day 5: demo UI/CLI + success path
Day 6: dispute path + hardening + testnet rehearsal
Day 7: final demo, docs, submission narrative

## Demo story (judging-oriented)
1. User sets deal constraints
2. Agent negotiates within bounds
3. Terms committed + escrow funded
4. Delivery proof submitted
5. Acceptance/dispute path triggered
6. Settlement and full audit trail shown

## Out of scope (for velocity)
- cross-chain settlements in v1
- complex arbitration courts
- advanced privacy stack

## Deliverables in this repo
- `IDEA.md` (this file)
- `research/01-research-brief.md`
- `research/02-technical-blueprint.md`
- `research/03-tx-opinion.md`
- `docs/ARCHITECTURE.md`

## Key assumptions
- We can use Kairen ecosystem context and align to live stack constraints.
- Identity/routing layers not fully live are treated as integration-ready interfaces.
- Hackathon judges prioritize working demo over broad integration count.
