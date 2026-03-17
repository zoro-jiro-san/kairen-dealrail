# DealRail Skill Index

URL target: `https://dealrail.kairen.xyz/SKILL.md`

DealRail is a trust/execution rail for agent commerce.

## Primary Use Case

1. Discover providers from multiple sources (x402n, external marketplaces, imported catalogs, ERC-8004 identity context).
2. Negotiate terms (RFO/offers).
3. Commit deal onchain with escrow.
4. Verify delivery by evaluator.
5. Optionally route settlement proceeds (Uniswap/Locus/other adapters).

## What DealRail Is

- Trustless settlement and verification layer.
- Integration surface for multiple discovery/execution providers.

## What DealRail Is Not

- Exclusive to one protocol.
- A closed marketplace.

## Skill References

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
