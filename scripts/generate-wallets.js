const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Helper to generate random private key
function generatePrivateKey() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

// Generate secure wallets for deployment
console.log('🔐 Generating secure deployment wallets...\n');

// Generate deployer wallet
const deployerPrivateKey = generatePrivateKey();
console.log('═══════════════════════════════════════════════════════');
console.log('DEPLOYER WALLET');
console.log('═══════════════════════════════════════════════════════');
console.log('Private Key:', deployerPrivateKey);
console.log('⚠️  Derive address using: cast wallet address', deployerPrivateKey);
console.log();

// Generate agent wallet
const agentPrivateKey = generatePrivateKey();
console.log('═══════════════════════════════════════════════════════');
console.log('AGENT WALLET (for testing agent operations)');
console.log('═══════════════════════════════════════════════════════');
console.log('Private Key:', agentPrivateKey);
console.log('⚠️  Derive address using: cast wallet address', agentPrivateKey);
console.log();

// Generate evaluator wallet
const evaluatorPrivateKey = generatePrivateKey();
console.log('═══════════════════════════════════════════════════════');
console.log('EVALUATOR WALLET (for testing evaluator role)');
console.log('═══════════════════════════════════════════════════════');
console.log('Private Key:', evaluatorPrivateKey);
console.log('⚠️  Derive address using: cast wallet address', evaluatorPrivateKey);
console.log();

// Create secure .env template
const envTemplate = `# ═══════════════════════════════════════════════════════
# DealRail Environment Configuration
# ═══════════════════════════════════════════════════════
# SECURITY WARNING: NEVER commit this file to git!
# ═══════════════════════════════════════════════════════

# === Chain RPCs ===
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/******
BASE_MAINNET_RPC=https://base-mainnet.g.alchemy.com/v2/******
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
CELO_MAINNET_RPC=https://forno.celo.org

# === API Keys ===
ALCHEMY_API_KEY=******
BANKR_API_KEY=
PINATA_JWT=
SYNTHESIS_API_KEY=
LOCUS_API_KEY=
WALLETCONNECT_PROJECT_ID=

# === Deployment Wallets (GENERATED - DO NOT SHARE) ===
# Use 'cast wallet address <PRIVATE_KEY>' to get addresses
DEPLOYER_PRIVATE_KEY=${deployerPrivateKey}
AGENT_PRIVATE_KEY=${agentPrivateKey}
EVALUATOR_PRIVATE_KEY=${evaluatorPrivateKey}

# === Contract Addresses (update after deployment) ===
ESCROW_RAIL_BASE_SEPOLIA=
ESCROW_RAIL_ERC20_BASE_SEPOLIA=
DEALRAIL_HOOK_BASE_SEPOLIA=
ERC8004_VERIFIER_BASE_SEPOLIA=

ESCROW_RAIL_CELO_ALFAJORES=
ESCROW_RAIL_ERC20_CELO_ALFAJORES=
DEALRAIL_HOOK_CELO_ALFAJORES=
ERC8004_VERIFIER_CELO_ALFAJORES=

# === ERC-8004 Registry Addresses (deployed, same on all chains) ===
ERC8004_IDENTITY_REGISTRY=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
ERC8004_REPUTATION_REGISTRY=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63

# === Database ===
DATABASE_URL=postgresql://localhost:5432/dealrail?schema=public

# === Infrastructure ===
VERCEL_TOKEN=
RAILWAY_TOKEN=
`;

// Write to .env file in root
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envTemplate);
console.log('✅ Generated .env file at project root');
console.log();

// Create wallet info file for easy reference
const walletInfo = {
  deployer: {
    privateKey: deployerPrivateKey,
    note: "Use 'cast wallet address " + deployerPrivateKey + "' to get address"
  },
  agent: {
    privateKey: agentPrivateKey,
    note: "Use 'cast wallet address " + agentPrivateKey + "' to get address"
  },
  evaluator: {
    privateKey: evaluatorPrivateKey,
    note: "Use 'cast wallet address " + evaluatorPrivateKey + "' to get address"
  },
  generated: new Date().toISOString(),
  faucets: {
    baseSepolia: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet',
    celoAlfajores: 'https://faucet.celo.org/alfajores'
  }
};

const walletInfoPath = path.join(__dirname, '..', '.wallets.json');
fs.writeFileSync(walletInfoPath, JSON.stringify(walletInfo, null, 2));
console.log('✅ Saved wallet info to .wallets.json (DO NOT COMMIT!)');
console.log();

console.log('═══════════════════════════════════════════════════════');
console.log('NEXT STEPS:');
console.log('═══════════════════════════════════════════════════════');
console.log('1. Fund DEPLOYER wallet with:');
console.log('   - ETH on Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
console.log('   - CELO on Alfajores: https://faucet.celo.org/alfajores');
console.log();
console.log('2. Get deployer address: cast wallet address', deployerPrivateKey);
console.log('   Then fund that address with faucets above');
console.log();
console.log('3. Replace ****** in .env with your actual Alchemy API key');
console.log();
console.log('4. Add .env and .wallets.json to .gitignore (if not already)');
console.log('═══════════════════════════════════════════════════════');
