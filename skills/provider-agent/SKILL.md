---
name: provider-agent
description: Use for provider-side agent operations: funded-job validation, deliverable submission, and post-settlement optional routing.
---

# Provider Agent

## Use When
- Provider wallet is responsible for delivering work on an accepted deal.

## Inputs
- Confirmed offer details
- Job ID
- Deliverable hash strategy

## Workflow
1. Confirm job state is `Funded`.
2. Submit deliverable hash.
3. Wait for evaluator decision.
4. If `Completed`, optionally run settlement routing (swap/bridge).

## Hard Rules
- Never submit after expiry.
- Deliverable hash must be reproducible from source artifact.
- Do not run post-settlement swaps before `Completed`.
