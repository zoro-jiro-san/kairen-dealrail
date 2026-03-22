---
name: escrow-lifecycle
description: Use whenever someone needs to create, fund, submit, complete, reject, refund, or inspect DealRail jobs on Base Sepolia or Celo Sepolia. Trigger on "job lifecycle", "escrow", "fund job", "submit deliverable", "complete", "reject", "refund", or "what state is this job in".
---

# Escrow Lifecycle

Use this skill for the onchain state machine, not for discovery or negotiation.

## Supported Rails
- Base Sepolia escrow
- Celo Sepolia escrow

## Use When
- A deal is already decided and must move through onchain state transitions.
- Someone needs to validate job state before acting.
- A human or agent needs the exact next step on a real job.

## Workflow
1. Read the job and confirm chain, participants, budget, and current state.
2. Choose the smallest valid next action.
3. Simulate when available.
4. Execute one state transition.
5. Record tx hash and explorer link.
6. Re-read the job to confirm the terminal or intermediate state.

## State Map
- `Open` -> `Funded`
- `Funded` -> `Submitted`
- `Submitted` -> `Completed` or `Rejected`
- `Rejected/Expired` -> `Refund` when valid

## Hard Rules
- Never sign on the wrong chain.
- Never try to force an invalid transition.
- Exactly one terminal evaluator decision per submitted job.
- Treat tx hash plus final state as the proof pair.
