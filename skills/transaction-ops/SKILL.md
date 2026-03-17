---
name: transaction-ops
description: Use for deterministic transaction execution across DealRail escrow and adapters with strict preflight checks and auditable outputs.
---

# Transaction Ops

## Use When
- Executing live chain transactions in buyer/provider/evaluator workflows.

## Preconditions
- Correct chain selected.
- Role wallet funded for gas.
- Contract addresses match repo env/config.

## Procedure
1. Validate payload and role authority.
2. Quote/simulate when available.
3. Execute smallest safe step first.
4. Record tx hash + explorer link.
5. Confirm state transition.

## Required Output
- tx hash
- explorer URL
- resulting state
- next required action

## Failure Handling
- Revert: stop, fix params, retry once.
- Partial multi-step failure: retry only missing step.
