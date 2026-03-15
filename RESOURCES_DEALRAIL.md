# Kairen DealRail — Resource Handbook

**Version:** 1.0
**Date:** 2026-03-15
**Purpose:** Single reference for every SDK, API, MCP server, skill file, contract address, faucet, tool, and key needed to build DealRail across all 10 sponsor tracks.

---

## Table of Contents

1. [Skills (Agent-Readable Instruction Files)](#1-skills)
2. [MCP Servers](#2-mcp-servers)
3. [Sponsor SDKs & API Keys](#3-sponsor-sdks--api-keys)
4. [Smart Contract Addresses (Deployed)](#4-smart-contract-addresses)
5. [Chain Configuration & RPCs](#5-chain-configuration--rpcs)
6. [Faucets](#6-faucets)
7. [Block Explorers](#7-block-explorers)
8. [Core Development Dependencies](#8-core-development-dependencies)
9. [Infrastructure & Hosting](#9-infrastructure--hosting)
10. [Hackathon Platform](#10-hackathon-platform)
11. [Quick Install Script](#11-quick-install-script)
12. [API Key Checklist](#12-api-key-checklist)

---

## 1. Skills

Skills are `.md` instruction files designed for AI agents — they provide structured context, routing rules, and best practices. Fetch them with `curl -s <URL>` to load into agent context.

### Hackathon Core Skills

| Skill | URL | Purpose |
|-------|-----|---------|
| **Synthesis Hackathon API** | `https://synthesis.devfolio.co/skill.md` | Registration, submission, rules, timeline, ERC-8004 on-chain identity. **READ FIRST** — this is the canonical hackathon instruction set |
| **Synthesis Themes** | `https://synthesis.devfolio.co/themes.md` | Four themes (Pay, Trust, Cooperate, Keep Secrets), design spaces, and judging philosophy |
| **Synthesis Prize Catalog** | `https://synthesis.devfolio.co/catalog/prizes.md` | All 106 prizes, filterable by track/company/amount. Supports pagination (`?page=2&limit=50`) |
| **EthSkills** | `https://ethskills.com/SKILL.md` | Ethereum, Solidity, smart contracts, and web3 development best practices. Referenced in hackathon docs as a recommended build resource |

### Kairen Ecosystem Skills

| Skill | URL | Purpose |
|-------|-----|---------|
| **Kairen Root Skill** | `https://kairen.xyz/skill.md` | Top-level index for the Kairen ecosystem. Routes to correct layer (Market, x402n, ForgeID, AgentNet). **Start here** for ecosystem orientation |
| **x402n Skill** | `https://x402n.kairen.xyz/skill.md` | Negotiation layer — RFO workflows, offer submission, deal execution, settlement. Full API reference with endpoints |
| **x402n Flows** | `https://x402n.kairen.xyz/flows.md` | Detailed workflow diagrams for buyer, provider, and settlement flows |
| **x402n API Docs** | `https://x402n.kairen.xyz/api.md` | Full REST API reference |
| **Kairen Market** | `https://market.kairen.xyz` | Service discovery — browse providers, compare capabilities |
| **x402n MD Index** | `https://x402n.kairen.xyz/md-index` | List of all available markdown endpoints in the x402n surface |

### How to Use Skills in Agent Context

```bash
# Load a skill into your agent's context
curl -s https://synthesis.devfolio.co/skill.md

# Load with Accept header (some skills respond differently)
curl -s -H "Accept: text/markdown" https://x402n.kairen.xyz/skill.md

# Chain multiple skills for full context
cat <(curl -s https://kairen.xyz/skill.md) <(curl -s https://x402n.kairen.xyz/skill.md)
```

---

## 2. MCP Servers

MCP (Model Context Protocol) servers allow AI agents to interact with external services via standardized tool interfaces. Use `@modelcontextprotocol/sdk` (v1.27.1) to connect.

### Sponsor MCP Servers

| Sponsor | MCP Endpoint | Purpose | Notes |
|---------|-------------|---------|-------|
| **Locus** | `mcp.paywithlocus.com/mcp` | USDC payment operations — smart wallets, spending limits, escrow ops, audit trails | Agent-native payment infrastructure. Use for DealRail's payment layer |
| **AgentCash** | Run via `npx agentcash` | MCP server for calling x402-protected APIs with automatic payment handling | Generic MCP server — discovers x402 endpoints and handles payments. Repo: `github.com/Merit-Systems/agent-cash` |

### x402 MCP Servers (Discoverable)

| Server | Package | Purpose |
|--------|---------|---------|
| **AgentCash MCP** | `agentcash` v0.9.5 | Generic x402 payment MCP — auto-discovers x402-gated APIs and pays |
| **Easy Node x402 MCP** | `@easynodexyz/mcp-x402` v0.1.3 | Example of x402 MCP server for purchasing services |
| **CornerStone MCP** | `cornerstone-autonomous-agent` v2.1.0 | MCP x402 skill for financial agents |

### MCP SDK

```bash
npm install @modelcontextprotocol/sdk@1.27.1
```

```typescript
// Connect to an MCP server
import { Client } from "@modelcontextprotocol/sdk/client";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";

const transport = new SSEClientTransport("https://mcp.paywithlocus.com/mcp");
const client = new Client({ name: "dealrail-agent", version: "1.0.0" });
await client.connect(transport);

// List available tools
const tools = await client.listTools();

// Call a tool
const result = await client.callTool("send_usdc", {
  to: "0x...",
  amount: "10.00",
  chain: "base"
});
```

---

## 3. Sponsor SDKs & API Keys

### Track 1: ERC-8004 — Protocol Labs

**What you need:** Register agents in on-chain identity registry, read/write reputation

| Resource | Value |
|----------|-------|
| EIP Spec | `https://eips.ethereum.org/EIPS/eip-8004` |
| Contracts Repo | `github.com/erc-8004/erc-8004-contracts` |
| Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (same on all chains) |
| Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` (same on all chains) |
| Chains deployed | Ethereum Mainnet, Base, Linea, Sepolia |
| Agent ID format | `eip155:{chainId}:{registryAddress}:{agentId}` |
| API Key needed | **None** — direct contract interaction |

**Integration pattern:**
```solidity
// Read identity
IERC8004IdentityRegistry registry = IERC8004IdentityRegistry(0x8004A169FB4a3325136EB29fA0ceB6D2e539a432);
uint256 agentId = registry.agentIdOf(agentAddress);

// Read reputation
IERC8004ReputationRegistry repRegistry = IERC8004ReputationRegistry(0x8004BAa17C55a88189AE136b182e5fdA19dE9b63);
uint256 reputation = repRegistry.getReputation(agentId);
```

**Hackathon registration note:** When you call `POST /register` on `synthesis.devfolio.co`, the platform auto-registers your ERC-8004 identity on Base Mainnet. The response includes `registrationTxn` with a BaseScan link.

---

### Track 2: Celo

**What you need:** Deploy contracts on Celo, use cUSD for settlement

| Resource | Value |
|----------|-------|
| SDK | `@celo/contractkit` v10.0.3 |
| CLI | `@celo/celocli` v8.0.3 |
| Starter Kit | `@celo/celo-composer` v2.4.13 |
| Identity SDK | `@celo/identity` v5.1.2 |
| Docs | `https://docs.celo.org/developer-guide/contractkit` |
| Tooling Repo | `github.com/celo-org/developer-tooling` |
| API Key needed | **None** — public RPCs available |

**cUSD Contract Addresses:**

| Network | cUSD Address |
|---------|-------------|
| Celo Mainnet | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| Alfajores Testnet | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |

```bash
npm install @celo/contractkit
```

```typescript
import { newKit } from "@celo/contractkit";
const kit = newKit("https://alfajores-forno.celo-testnet.org");
const stableToken = await kit.contracts.getStableToken();
```

---

### Track 3: MetaMask Delegations

**What you need:** Create scoped delegations for agent authorization

| Resource | Value |
|----------|-------|
| SDK | `@metamask/delegation-toolkit` v0.13.0 |
| Starter Repo | `github.com/MetaMask/gator-nextjs-starter` |
| Docs | `https://metamask.io/news/what-is-the-delegation-toolkit-and-what-can-you-build-with-it` |
| Standards | ERC-7710 (delegation), ERC-7715 (permission requests) |
| API Key needed | **None** — client-side library |

```bash
npm install @metamask/delegation-toolkit
```

```typescript
import {
  createDelegation,
  createCaveatBuilder,
  SINGLE_DEFAULT_MODE,
} from "@metamask/delegation-toolkit";

// Create delegation with spending cap caveat
const delegation = createDelegation({
  delegate: agentAddress,
  delegator: humanAddress,
  caveats: [
    {
      enforcer: ALLOWED_METHODS_ENFORCER,
      terms: encodeFunctionSelector("fund(uint256,uint256)")
    },
    {
      enforcer: NATIVE_TOKEN_TRANSFER_ENFORCER,
      terms: encodeMaxAmount(50_000_000n) // 50 USDC
    },
    {
      enforcer: TIMESTAMP_ENFORCER,
      terms: encodeExpiry(Math.floor(Date.now() / 1000) + 86400) // 24h
    }
  ]
});
```

**Key Caveat Enforcers:**
- `AllowedMethodsEnforcer` — whitelist specific contract functions
- `NativeTokenTransferAmountEnforcer` — cap ETH/native token spending
- `ERC20TransferAmountEnforcer` — cap ERC-20 spending
- `TimestampEnforcer` — time-bound delegations
- `AllowedTargetsEnforcer` — whitelist contract addresses
- `LimitedCallsEnforcer` — max number of calls

---

### Track 4: Bankr LLM Gateway

**What you need:** Agent wallet management and payment execution

| Resource | Value |
|----------|-------|
| SDK | `@bankr/sdk` v0.1.0-alpha.8 |
| API Base URL | `https://api.bankr.bot` |
| Homepage | `https://bankr.bot` |
| Key endpoints | `POST /agent/prompt` (natural language) / `POST /agent/submit` (raw tx) |
| API Key needed | **Yes** — `BANKR_API_KEY` (format: `bk_...`) |

```bash
npm install @bankr/sdk
```

```typescript
import { BankrClient } from "@bankr/sdk";

const client = new BankrClient({
  apiKey: process.env.BANKR_API_KEY
});

// Natural language payment
const job = await client.prompt(
  "Send 10 USDC to contract 0x... calling fund(42, 10000000) on Base"
);
const result = await client.waitForJob(job.jobId);
console.log("TX Hash:", result.txHash);
```

**How to get API key:** Request via Bankr website or hackathon Telegram. Check synthesis Telegram for sponsor links.

---

### Track 5: Uniswap API

**What you need:** Post-settlement token swap

| Resource | Value |
|----------|-------|
| Core SDK | `@uniswap/sdk-core` v7.12.2 |
| V3 SDK | `@uniswap/v3-sdk` v3.29.2 |
| V4 SDK | `@uniswap/v4-sdk` v1.29.3 |
| Universal Router SDK | `@uniswap/universal-router-sdk` v4.34.2 |
| Smart Order Router | `@uniswap/smart-order-router` v4.31.10 |
| Docs | `https://docs.uniswap.org` |
| SDKs Repo | `github.com/Uniswap/sdks` |
| API Key needed | **Depends** — check if hackathon provides Uniswap API key |

```bash
npm install @uniswap/sdk-core @uniswap/v3-sdk @uniswap/smart-order-router
```

**Uniswap Router Addresses (Base):**

| Contract | Address (Base Mainnet) |
|----------|----------------------|
| SwapRouter02 | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| UniversalRouter | `0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD` |
| QuoterV2 | `0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a` |

```typescript
import { Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { AlphaRouter } from "@uniswap/smart-order-router";

const router = new AlphaRouter({ chainId: 8453, provider }); // Base
const route = await router.route(
  CurrencyAmount.fromRawAmount(USDC, "10000000"),
  WETH,
  TradeType.EXACT_INPUT
);
```

---

### Track 6: Locus

**What you need:** USDC payment operations with spending limits

| Resource | Value |
|----------|-------|
| MCP Endpoint | `mcp.paywithlocus.com/mcp` |
| Website | `https://paywithlocus.com` |
| API Key needed | **Yes** — request from Locus |

**Integration:** Connect via MCP protocol (see Section 2 above).

---

### Track 7: ENS

**What you need:** Agent ENS names + text records for discovery

| Resource | Value |
|----------|-------|
| SDK | `@ensdomains/ensjs` v4.2.2 |
| Docs | `https://docs.ens.domains` |
| Standards | ENSIP-25 (agent metadata), EIP-137 (ENS), EIP-181 (reverse) |
| API Key needed | **None** — direct on-chain interaction |

```bash
npm install @ensdomains/ensjs
```

```typescript
import { createEnsPublicClient } from "@ensdomains/ensjs";

const ensClient = createEnsPublicClient({
  chain: mainnet,
  transport: http()
});

// Resolve name
const address = await ensClient.getAddressRecord({ name: "buyer.dealrail.eth" });

// Read text record
const x402nEndpoint = await ensClient.getTextRecord({
  name: "buyer.dealrail.eth",
  key: "com.kairen.x402n"
});
```

**Text record keys for DealRail agents:**
- `com.kairen.x402n` — x402n API endpoint
- `com.erc8004.agentId` — ERC-8004 agent ID
- `com.dealrail.capabilities` — JSON capabilities descriptor
- `description` — Human-readable agent description
- `url` — Agent homepage/documentation

---

### Track 8: AgentCash (Merit Systems)

**What you need:** x402 payment gateway

| Resource | Value |
|----------|-------|
| Package | `agentcash` v0.9.5 |
| Type | MCP Server (run as server or use as library) |
| Repo | `github.com/Merit-Systems/agent-cash` |
| Keywords | mcp, x402, payments, ai, claude, model-context-protocol |
| API Key needed | **Yes** — needs a funded wallet for x402 payments |

```bash
# Run as MCP server
npx agentcash

# Or install as dependency
npm install agentcash
```

AgentCash auto-discovers x402-protected endpoints, negotiates payment terms, and executes payments. It bridges the x402 protocol to MCP tooling.

---

### Track 9: Arkhai / Alkahest

**What you need:** Document DealRail's evaluator as an escrow ecosystem extension

| Resource | Value |
|----------|-------|
| Prize | Best Application: $450, Best Extension: $450 |
| Integration | Conceptual — DealRail's evaluator pattern extends escrow primitives |
| API Key needed | **None** |

**Integration approach:** Position DealRail's multi-signal evaluator as a new verification primitive for the Alkahest (natural-language-agreement) ecosystem. Document the evaluator interface and how it composable with other escrow systems.

---

### Track 10: Synthesis Open Track

**What you need:** Full project demonstrating 3+ themes

| Resource | Value |
|----------|-------|
| Submission | Via Devfolio platform |
| Prize | $14,058.96 (community-funded) |
| API Key needed | Synthesis API key (obtained during registration) |

---

## 4. Smart Contract Addresses

### ERC-8004 Registries (Live — same address all chains)

| Contract | Address | Status |
|----------|---------|--------|
| Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | ✅ Live |
| Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | ✅ Live |
| **Chains:** | Ethereum Mainnet, Base, Linea, Sepolia | |

### ERC-8183 Reference Implementation (Virtuals Protocol)

| Contract | Address (Base Mainnet) | Notes |
|----------|----------------------|-------|
| ThoughtProof Evaluator | `0x119299F33f918808edD5ef92bd79cefB8700C091` | Multi-model evaluator, live on Base |
| **Repo:** | `github.com/Virtual-Protocol/agent-commerce-protocol` | MIT license |

### Celo Stablecoins

| Token | Mainnet Address | Alfajores Address |
|-------|----------------|-------------------|
| cUSD | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |
| cEUR | `0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73` | `0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F` |
| CELO (native) | — | Faucet available |

### Uniswap on Base

| Contract | Base Mainnet Address |
|----------|---------------------|
| SwapRouter02 | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| UniversalRouter | `0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD` |
| QuoterV2 | `0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a` |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| WETH (Base) | `0x4200000000000000000000000000000000000006` |

### DealRail Contracts (To Be Deployed)

| Contract | Base Sepolia | Celo Alfajores | Base Mainnet | Celo Mainnet |
|----------|-------------|----------------|-------------|-------------|
| EscrowRail.sol | TBD | TBD | TBD | TBD |
| EscrowRailERC20.sol | TBD | TBD | TBD | TBD |
| DealRailHook.sol | TBD | TBD | TBD | TBD |
| ERC8004Verifier.sol | TBD | TBD | TBD | TBD |
| NullVerifier.sol | TBD | TBD | TBD | TBD |

*Update this table as contracts are deployed.*

---

## 5. Chain Configuration & RPCs

### Base

| Network | Chain ID | RPC | Notes |
|---------|---------|-----|-------|
| Base Mainnet | 8453 | `https://mainnet.base.org` | Public, rate-limited |
| Base Mainnet (Alchemy) | 8453 | `https://base-mainnet.g.alchemy.com/v2/{API_KEY}` | Needs Alchemy key |
| Base Sepolia | 84532 | `https://sepolia.base.org` | Public, rate-limited |
| Base Sepolia (Alchemy) | 84532 | `https://base-sepolia.g.alchemy.com/v2/{API_KEY}` | Needs Alchemy key |

### Celo

| Network | Chain ID | RPC | Notes |
|---------|---------|-----|-------|
| Celo Mainnet | 42220 | `https://forno.celo.org` | Public |
| Alfajores Testnet | 44787 | `https://alfajores-forno.celo-testnet.org` | Public |

### Ethereum (for ENS)

| Network | Chain ID | RPC | Notes |
|---------|---------|-----|-------|
| Ethereum Mainnet | 1 | `https://eth-mainnet.g.alchemy.com/v2/{API_KEY}` | For ENS resolution |
| Sepolia | 11155111 | `https://eth-sepolia.g.alchemy.com/v2/{API_KEY}` | For ENS testing |

### Local Development

| Network | Chain ID | RPC | Notes |
|---------|---------|-----|-------|
| Anvil (Foundry) | 31337 | `http://localhost:8545` | `anvil` command |
| Anvil (Base Fork) | 8453 | `anvil --fork-url https://mainnet.base.org` | Fork Base mainnet |
| Anvil (Celo Fork) | 42220 | `anvil --fork-url https://forno.celo.org` | Fork Celo mainnet |

---

## 6. Faucets

| Chain | Faucet URL | Token | Notes |
|-------|-----------|-------|-------|
| Base Sepolia | `https://www.alchemy.com/faucets/base-sepolia` | ETH | Needs Alchemy account |
| Base Sepolia | `https://faucet.quicknode.com/base/sepolia` | ETH | QuickNode faucet |
| Base Sepolia | `https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet` | ETH | Coinbase official |
| Celo Alfajores | `https://faucet.celo.org/alfajores` | CELO + cUSD | Official Celo faucet |
| Ethereum Sepolia | `https://sepoliafaucet.com/` | ETH | For ENS testing |

---

## 7. Block Explorers

| Chain | Explorer | API Docs |
|-------|---------|----------|
| Base Mainnet | `https://basescan.org` | `https://docs.basescan.org/api` |
| Base Sepolia | `https://sepolia.basescan.org` | Same API pattern |
| Celo Mainnet | `https://celoscan.io` | `https://celoscan.io/apis` |
| Celo Alfajores | `https://alfajores.celoscan.io` | Same API pattern |
| Ethereum Mainnet | `https://etherscan.io` | For ENS transactions |

**Transaction link templates:**
```
Base Sepolia:  https://sepolia.basescan.org/tx/{txHash}
Celo Alfajores: https://alfajores.celoscan.io/tx/{txHash}
Base Mainnet:   https://basescan.org/tx/{txHash}
```

---

## 8. Core Development Dependencies

### Smart Contracts (Foundry)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Initialize project
forge init contracts
cd contracts

# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Key commands
forge build                    # Compile
forge test                     # Run tests
forge test -vvvv               # Verbose tests
forge snapshot                 # Gas benchmarks
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast
```

**foundry.toml config:**
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC}"
base_mainnet = "${BASE_MAINNET_RPC}"
celo_alfajores = "https://alfajores-forno.celo-testnet.org"
celo_mainnet = "https://forno.celo.org"
```

### Backend (Node.js + TypeScript)

```json
{
  "dependencies": {
    "viem": "^2.47.4",
    "ethers": "^6.16.0",
    "@metamask/delegation-toolkit": "^0.13.0",
    "@bankr/sdk": "^0.1.0-alpha.8",
    "@ensdomains/ensjs": "^4.2.2",
    "@celo/contractkit": "^10.0.3",
    "@uniswap/sdk-core": "^7.12.2",
    "@uniswap/v3-sdk": "^3.29.2",
    "@uniswap/smart-order-router": "^4.31.10",
    "@modelcontextprotocol/sdk": "^1.27.1",
    "x402": "^1.1.0",
    "@x402/evm": "^2.6.0",
    "agentcash": "^0.9.5",
    "pinata": "^2.5.5",
    "hono": "^4.12.8",
    "prisma": "^7.5.0",
    "@prisma/client": "^7.5.0",
    "@openzeppelin/contracts": "^5.6.1"
  }
}
```

### Frontend (Next.js)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "wagmi": "^3.5.0",
    "viem": "^2.47.4",
    "@rainbow-me/rainbowkit": "^2.2.10",
    "@metamask/delegation-toolkit": "^0.13.0",
    "@ensdomains/ensjs": "^4.2.2",
    "@coinbase/onchainkit": "^1.1.2",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest"
  }
}
```

---

## 9. Infrastructure & Hosting

### Pinata (IPFS)

| Resource | Value |
|----------|-------|
| SDK | `pinata` v2.5.5 (official) or `pinata-web3` v0.5.4 |
| Dashboard | `https://app.pinata.cloud` |
| API Base | `https://api.pinata.cloud` |
| Gateway | `https://gateway.pinata.cloud/ipfs/{CID}` |
| API Key needed | **Yes** — `PINATA_API_KEY` + `PINATA_SECRET_KEY` |

```typescript
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT
});

// Pin deliverable content
const result = await pinata.upload.json({
  deliverable: "API integration result",
  hash: "0x...",
  timestamp: Date.now()
});
console.log("IPFS CID:", result.IpfsHash);
```

### Alchemy

| Resource | Value |
|----------|-------|
| Dashboard | `https://dashboard.alchemy.com` |
| Base Sepolia RPC | `https://base-sepolia.g.alchemy.com/v2/{KEY}` |
| Base Mainnet RPC | `https://base-mainnet.g.alchemy.com/v2/{KEY}` |
| Free tier | 300M compute units/month |
| API Key needed | **Yes** — `ALCHEMY_API_KEY` |

### Vercel (Frontend)

| Resource | Value |
|----------|-------|
| Deploy | `vercel --prod` from frontend directory |
| Framework | Auto-detects Next.js |
| Env vars | Set in Vercel dashboard |
| API Key needed | **Yes** — `VERCEL_TOKEN` (for CI/CD) |

### Railway (Backend)

| Resource | Value |
|----------|-------|
| Deploy | Connect GitHub repo, auto-deploy on push |
| Databases | PostgreSQL available as add-on |
| Env vars | Set in Railway dashboard |
| API Key needed | **Yes** — `RAILWAY_TOKEN` (for CI/CD) |

---

## 10. Hackathon Platform

### Synthesis API

| Resource | Value |
|----------|-------|
| Base URL | `https://synthesis.devfolio.co` |
| Skill File | `https://synthesis.devfolio.co/skill.md` |
| Registration | `POST /register` — creates ERC-8004 identity on Base Mainnet |
| Auth | Bearer token: `sk-synth-...` (returned from registration, shown only once) |
| Themes | `https://synthesis.devfolio.co/themes.md` |
| Prizes | `https://synthesis.devfolio.co/catalog/prizes.md` |
| Telegram | `https://nsb.dev/synthesis-updates` |

### Registration Payload

```json
{
  "name": "Zoro (Kairen DealRail)",
  "description": "Deal execution agent — negotiates within human-defined limits, locks escrow, settles by proof",
  "agentHarness": "claude-code",
  "model": "claude-sonnet-4-6",
  "humanInfo": {
    "name": "Sarthi",
    "email": "...",
    "socialMediaHandle": "@...",
    "background": "builder",
    "cryptoExperience": "yes",
    "aiAgentExperience": "yes",
    "codingComfort": 9,
    "problemToSolve": "Trust gap between agent agreements and enforceable execution in agent commerce"
  }
}
```

---

## 11. Quick Install Script

```bash
#!/bin/bash
# DealRail Development Environment Setup

echo "=== Kairen DealRail Setup ==="

# 1. Install Foundry (smart contracts)
echo "Installing Foundry..."
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 2. Setup contracts
echo "Setting up contracts..."
mkdir -p contracts && cd contracts
forge init --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit
cd ..

# 3. Setup backend
echo "Setting up backend..."
mkdir -p backend && cd backend
npm init -y
npm install \
  viem ethers hono prisma @prisma/client \
  @metamask/delegation-toolkit \
  @bankr/sdk \
  @ensdomains/ensjs \
  @celo/contractkit \
  @uniswap/sdk-core @uniswap/v3-sdk \
  @modelcontextprotocol/sdk \
  x402 @x402/evm \
  agentcash \
  pinata \
  typescript @types/node tsx
npx prisma init
cd ..

# 4. Setup frontend
echo "Setting up frontend..."
npx create-next-app@14 frontend \
  --typescript --tailwind --eslint --app --src-dir
cd frontend
npm install \
  wagmi viem @rainbow-me/rainbowkit \
  @metamask/delegation-toolkit \
  @ensdomains/ensjs \
  @coinbase/onchainkit
cd ..

# 5. Create .env template
cat > .env.template << 'EOF'
# === Chain RPCs ===
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_MAINNET_RPC=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
CELO_MAINNET_RPC=https://forno.celo.org

# === API Keys ===
ALCHEMY_API_KEY=
BANKR_API_KEY=bk_...
PINATA_JWT=
SYNTHESIS_API_KEY=sk-synth-...

# === Wallet Keys (NEVER COMMIT) ===
DEPLOYER_PRIVATE_KEY=
AGENT_PRIVATE_KEY=

# === Contract Addresses (update after deploy) ===
ESCROW_RAIL_BASE_SEPOLIA=
ESCROW_RAIL_CELO_ALFAJORES=
HOOK_BASE_SEPOLIA=
HOOK_CELO_ALFAJORES=

# === Infrastructure ===
DATABASE_URL=postgresql://...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
EOF

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "  1. Copy .env.template to .env and fill in keys"
echo "  2. Get faucet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
echo "  3. Get faucet CELO+cUSD: https://faucet.celo.org/alfajores"
echo "  4. Register with hackathon: POST https://synthesis.devfolio.co/register"
echo "  5. Start building: see PRD_KAIREN_DEALRAIL.md"
```

---

## 12. API Key Checklist

Track every key you need. Check off as obtained.

| Service | Key Name | Env Variable | How to Get | Status |
|---------|----------|-------------|-----------|--------|
| Alchemy | API Key | `ALCHEMY_API_KEY` | `dashboard.alchemy.com` — free tier | [ ] |
| Bankr | API Key | `BANKR_API_KEY` | Request via `bankr.bot` or hackathon Telegram | [ ] |
| Pinata | JWT | `PINATA_JWT` | `app.pinata.cloud` — free tier (100 pins) | [ ] |
| Synthesis | API Key | `SYNTHESIS_API_KEY` | `POST /register` on synthesis.devfolio.co | [ ] |
| Locus | API Key | `LOCUS_API_KEY` | Request from Locus team / hackathon | [ ] |
| WalletConnect | Project ID | `WALLETCONNECT_PROJECT_ID` | `cloud.walletconnect.com` — free | [ ] |
| Vercel | Token | `VERCEL_TOKEN` | `vercel.com/account/tokens` — free | [ ] |
| Railway | Token | `RAILWAY_TOKEN` | `railway.app` — free hobby plan | [ ] |
| Deployer | Private Key | `DEPLOYER_PRIVATE_KEY` | Generate fresh wallet for hackathon only | [ ] |
| Agent | Private Key | `AGENT_PRIVATE_KEY` | Generate fresh wallet for agent ops | [ ] |

**Security rules:**
- NEVER commit `.env` to git (add to `.gitignore`)
- Use fresh wallets for hackathon — fund only what you need
- Deployer key needs ETH on Base Sepolia + CELO on Alfajores for gas
- Agent key needs test USDC/cUSD for demo transactions

---

## Appendix: x402 Protocol Reference

Since DealRail extends x402 with negotiation (x402n), here are the core x402 packages:

| Package | Version | Purpose |
|---------|---------|---------|
| `x402` | v1.1.0 | Core x402 protocol types and utilities |
| `@x402/evm` | v2.6.0 | EVM-specific implementation (Base, Ethereum) |
| `@x402/extensions` | v2.6.0 | Protocol extensions |
| `agentcash` | v0.9.5 | MCP server for consuming x402-protected APIs |
| `@use-agently/sdk` | v0.19.0 | Full agent SDK with wallet, A2A, MCP, and x402 support |

**x402 flow (for context):**
```
Client → GET /resource → 402 Payment Required (with price header)
Client → signs payment → sends payment header
Server → verifies payment → returns resource
```

DealRail replaces the "signs payment → sends payment" step with:
```
Client → posts RFO → receives offers → negotiates → accepts
→ createJob → fund (escrow) → provider delivers → evaluator verifies
→ complete/reject → settlement/refund
```

---

## Appendix: Useful GitHub Repos

| Repo | Purpose |
|------|---------|
| `github.com/coinbase/x402` | x402 protocol — reference for payment flows |
| `github.com/erc-8004/erc-8004-contracts` | ERC-8004 registry contracts |
| `github.com/Virtual-Protocol/agent-commerce-protocol` | ERC-8183 reference implementation |
| `github.com/MetaMask/delegation-toolkit` | Delegation SDK source + examples |
| `github.com/MetaMask/gator-nextjs-starter` | Next.js starter with MetaMask delegations |
| `github.com/Merit-Systems/agent-cash` | AgentCash MCP server source |
| `github.com/celo-org/developer-tooling` | Celo ContractKit source |
| `github.com/Uniswap/sdks` | All Uniswap SDK packages |
| `github.com/selfxyz/self` | Self.xyz ZK identity |
| `github.com/ensdomains/ensjs` | ENS JavaScript library |
| `github.com/PinataCloud/pinata-web3` | Pinata IPFS SDK |
| `github.com/AgentlyHQ/use-agently` | Agently SDK (wallet + A2A + MCP + x402) |
| `github.com/OpenZeppelin/openzeppelin-contracts` | Security-audited Solidity contracts |

---

*This resource handbook covers every external dependency for the DealRail build. Keep it updated as new API keys are obtained and contracts are deployed.*

*Last updated: 2026-03-15*
