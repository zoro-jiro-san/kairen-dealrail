# DealRail Skill Index

URL target: `https://dealrail.kairen.xyz/SKILL.md`

DealRail is a trust/execution rail for agent commerce.

## Primary Use Case

1. Discover providers from multiple sources (x402n, external marketplaces, imported catalogs, ERC-8004 identity context).
2. Negotiate terms (RFO/offers).
3. Run reverse-auction counter rounds and batch offer confirmation.
4. Commit deal onchain with escrow.
5. Verify delivery by evaluator.
6. Optionally route settlement proceeds (Uniswap/Locus/x402/other adapters).

## Frontend Mode Map

- Human Mode:
  - Primary: `Deal Pipeline`, `Jobs List`
  - Secondary (advanced): discovery + integrations
- Agent Mode:
  - Primary: `Provider Discovery`, `Integrations Workbench`
  - Validation: `Jobs List` and pipeline tracking

## What DealRail Is

- Trustless settlement and verification layer.
- Integration surface for multiple discovery/execution providers.

## What DealRail Is Not

- Exclusive to one protocol.
- A closed marketplace.

## Skill References

- Main command: `/skills/dealrail.sh`
  - `./skills/dealrail.sh basics` for basic product usage
  - `./skills/dealrail.sh human-flow` for human run order
  - `./skills/dealrail.sh agent-flow` for agent run order
  - `./skills/dealrail.sh smoke-celo` for live Celo Sepolia smoke flow
- `/skills/README.md`
- `/skills/transaction-ops/SKILL.md`
- `/skills/buyer-agent/SKILL.md`
- `/skills/provider-agent/SKILL.md`
- `/skills/evaluator-agent/SKILL.md`
- `/skills/client-frontend/SKILL.md`
- `/skills/checkpoints/SKILL.md`

## Integration Endpoints

- `GET /api/v1/discovery/sources`
- `GET /api/v1/discovery/providers`
- `POST /api/v1/discovery/providers/import`
- `GET /api/v1/execution/providers`
- `POST /api/v1/execution/submit`
- `POST /api/v1/x402n/rfos/:negotiationId/counter`
- `POST /api/v1/x402n/rfos/:negotiationId/batch`
- `POST /api/v1/x402n/rfos/:negotiationId/confirm`
- `GET /api/v1/x402n/rfos/:negotiationId/receipt`
- `GET /api/v1/x402n/rfos/:negotiationId/activities`
- `GET /api/v1/integrations/x402/status`
- `POST /api/v1/integrations/x402/proxy`
