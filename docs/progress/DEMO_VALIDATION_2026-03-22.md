# Demo Validation 2026-03-22

This log captures the end-to-end validation run for DealRail across:

- Base Sepolia happy path
- Celo Sepolia happy path
- Celo Sepolia reject path
- Local CLI against the running simplified backend

## Environment Check

Validated presence of:

- `BASE_SEPOLIA_RPC`
- `CELO_SEPOLIA_RPC`
- `DEPLOYER_PRIVATE_KEY`
- `AGENT_PRIVATE_KEY`
- `EVALUATOR_PRIVATE_KEY`
- `ESCROW_RAIL_ERC20_BASE_SEPOLIA`
- `ESCROW_RAIL_ERC20_CELO_SEPOLIA`
- `CELO_SEPOLIA_STABLE_TOKEN`

## Base Sepolia Wallet Balances

Command:

```bash
cd backend
npx tsx tests/check-all-balances.ts
```

Result:

- Deployer / client: `0.047734321124012577 ETH`, `39.4 USDC`
- Agent / provider: `0.000995582823630954 ETH`, `0.6 USDC`
- Evaluator: `0.000995520549601106 ETH`, `0.0 USDC`
- Aggregate: `0.049725424497244637 ETH`, `40.0 USDC`

## Base Sepolia Happy Path

Command:

```bash
cd backend
npx tsx tests/test-lifecycle.ts
```

Validated roles:

- Buyer / client: `0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e`
- Provider: `0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF`
- Evaluator: `0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2`

Onchain sequence:

1. Create job `#2`
2. Approve `0.1 USDC`
3. Fund escrow
4. Submit deliverable
5. Complete job

Transactions:

- Create: `0xc6f49d1fa0cd024852ea3651317b9ff31918abf02637fc73c8c5feac9ffd310c`
- Approve: `0x711ad623f80f0b11114ff6dc8a9ab0a79984736b2d4204bbfb284ef8e7eef1e8`
- Fund: `0x7b08af64c1137c6ebcc94d3ba428a4f7a7e2fa1559b159d298e8934e985dc2c2`
- Submit: `0x162d040320623aab308a1dc96f776637efe9c6a96ea04603dc035a66d9c76299`
- Complete: `0x5e44b634e6a85dbc096c4ee8cf72b7b6ad3bb0c853218ed1870cc042c031fcb4`

Final state:

- Job ID: `2`
- Budget: `0.1 USDC`
- State code: `3`
- State label: `Completed`
- Deliverable hash: `0x25fe56e2dc670473cb290567ccdcc13a93eac30141afde046328ddb035774423`

Explorer base:

- `https://sepolia.basescan.org/address/0xE25B10057556e9714d2ac60992b68f4E61481cF9`

## Celo Sepolia Initial Failure

Command:

```bash
cd backend
npm run smoke:celo-sepolia
```

Initial failure reason:

- `INSUFFICIENT_FUNDS`
- Evaluator balance seen in failure: `0.005351076877`
- Reported tx cost: `0.007372773727`
- Deficit: about `0.00202169685`

## Celo Sepolia Gas Repair

After checking balances, deployer had enough native balance to top up execution wallets.

Pre-fix balances:

- Deployer: `5.077179532448`
- Provider: `0.005160769388`
- Evaluator: `0.005351076877`

Top-up command:

```bash
source .env && cast send 0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF --value 0.03ether --private-key "$DEPLOYER_PRIVATE_KEY" --rpc-url "$CELO_SEPOLIA_RPC" --legacy && cast send 0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2 --value 0.03ether --private-key "$DEPLOYER_PRIVATE_KEY" --rpc-url "$CELO_SEPOLIA_RPC" --legacy
```

Funding transactions:

- Provider top-up: `0x349ebe5e992309a2503a3aa644b0cee00ba866fda5cb70b5c1ee71db6c068003`
- Evaluator top-up: `0xaae76e9d020be7385c7200659e8c27b3fbdf5a2aa32d9ec7a3466c936a539b6b`

## Celo Sepolia Happy + Reject Smoke

Command:

```bash
cd backend
npm run smoke:celo-sepolia
```

Actors:

- Buyer / client: `0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e`
- Provider: `0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF`
- Evaluator: `0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2`

Happy path:

- Job ID: `5`
- Final state code: `3`
- Create: `0xa256e0a6010897ab6eb2377aebcd12265ea81a147423d42d92a37d7c86db9de0`
- Approve: `0x3093d227710f4f9d811d3fe74637de2c6d2ce3f1b73faa360edd9c459b61388b`
- Fund: `0x25331c72df3ba3f7e297c3abbe4b496c0d5dd48259d52423971aec746e714761`
- Submit: `0x14cb79f543e152d19bc12459dd7c8cde40242f342672250b77512b2aa6d445a6`
- Complete: `0x0bbf3cd7388dce58fe5ef0e58a0b854bfe12a58d14237e1c49b30d26f20fb0b8`

Reject path:

- Job ID: `6`
- Final state code: `4`
- Create: `0xde835a7f2805fb4fae137f68df3dcc1b583e953d7742212604edb3e2b0a7ec0e`
- Approve: `0x7882010329019bea497ec4e2c61f64b19a7c7848f38927aaf7822bb8acd3213e`
- Fund: `0x86030983f61549d91e72c798f3ae0d133fa69278b3123c1df2d2e185edf4f5a5`
- Submit: `0x1ae3a9a65a0bc5037ccc539cf81522c662f8c372d535a05e6734d4b8a9051b22`
- Reject: `0x70970f5155186d17d93f1510fc18afd300da80ea43b076d7563feeac923b9519`

Explorer base:

- `https://celo-sepolia.blockscout.com/address/0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74`

## Local Backend + CLI Validation

Started simplified backend:

```bash
cd backend
node dist/index-simple.js
```

Verified CLI against local API:

```bash
cd cli
DEALRAIL_API_URL=http://localhost:3001 node dist/cli.js status --json
DEALRAIL_API_URL=http://localhost:3001 node dist/cli.js jobs --limit 4 --json
DEALRAIL_API_URL=http://localhost:3001 node dist/cli.js scan automation
DEALRAIL_API_URL=http://localhost:3001 node dist/cli.js vend "automation benchmark report" --budget 0.12 --hours 24 --json
DEALRAIL_API_URL=http://localhost:3001 node dist/cli.js rails --json
```

Observed:

- Health endpoint returned `healthy`
- Active chain from backend: `baseSepolia`
- CLI `jobs` returned completed jobs including Base job `#2`
- CLI `scan automation` returned one provider in mock market
- CLI `vend` created negotiation `neg_c40dce13`
- CLI `vend` ranked three offers and selected a best offer at `0.09 USDC`
- CLI `rails` showed wallet, locus bridge, and bankr execution rails

## Demo-Ready Narrative

Recommended video sequence:

1. Show `dealrail demo` or `dealrail help`
2. Show `dealrail status --json`
3. Show `dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json`
4. Show `dealrail jobs --limit 4 --json`
5. Show Base Sepolia tx hashes for create, fund, submit, complete
6. Show Celo Sepolia happy path and reject path tx hashes
7. Close with the claim that buyer, provider, and evaluator roles were exercised onchain

## Current Verdict

- Base Sepolia happy path: verified
- Celo Sepolia happy path: verified
- Celo Sepolia reject path: verified
- CLI human mode: verified locally via built binary
- CLI agent mode `--json`: verified against running backend
- Remaining limitation: CLI `vend` currently verifies negotiation and ranking, but does not yet auto-accept and settle into onchain escrow in one command
