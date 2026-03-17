---
name: client-frontend
description: Use for frontend UX operation: simple human navigation and agent-mode tooling with explicit state visibility.
---

# Client Frontend Operations

## Navigation Model
- Human Mode:
  - Run deal pipeline first (policy -> negotiation -> confirmation -> tracking).
  - Manage jobs second.
  - Keep discovery/integrations in advanced section.
- Agent Mode:
  - Start with provider discovery.
  - Use integrations workbench for payload ops.
  - Validate final onchain state in jobs list.

## Use Cases
- Demo runs with minimal clicks.
- Operator verification of pipeline state.
- Triggering integration flows from one workbench.

## Do Not Use For
- Heavy analytics dashboards.
- Chat-first UX that hides critical state transitions.

## UX Principles
- Prefer pipeline/status views over conversational UI.
- Show exact next action by role.
- Keep advanced payloads collapsible but available.
- Every action should expose tx hash and explorer link.

## Required Panels
- Human Mode: Deal pipeline + Jobs list
- Agent Mode: Discovery + Integration workbench + Jobs list

## Checkpoints
- Connected wallet visible.
- Active chain visible.
- Error state is actionable.
- At least one happy path and one failure path can be run end-to-end.
