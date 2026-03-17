// DealRail Backend Configuration
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from project root (one level up from backend)
dotenv.config({ path: resolve(__dirname, '../../.env') });

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`Warning: Missing environment variable: ${key}`);
  }
  return value || '';
}

export const config = {
  server: {
    port: parseInt(getEnv('PORT', '3001'), 10),
    nodeEnv: getEnv('NODE_ENV', 'development'),
  },
  blockchain: {
    // Base Sepolia (deployed)
    baseSepolia: {
      chainId: 84532,
      rpcUrl: getEnv('BASE_SEPOLIA_RPC', 'https://sepolia.base.org'),
      contracts: {
        escrowRail: getEnv('ESCROW_RAIL_BASE_SEPOLIA', '0x8148Eb0F451e43af3286541806339157678f7F4F'),
        escrowRailERC20: getEnv('ESCROW_RAIL_ERC20_BASE_SEPOLIA', '0x53d368b5467524F7d674B70F00138a283e1533ce'),
        dealRailHook: getEnv('DEALRAIL_HOOK_BASE_SEPOLIA', '0x61B73b679E3BE2256dAa90A3c37E10AEacD8a9Cc'),
        erc8004Verifier: getEnv('ERC8004_VERIFIER_BASE_SEPOLIA', '0x668Dcc3a039CBef0054AAF244763db419BE6A521'),
        nullVerifier: getEnv('NULL_VERIFIER_BASE_SEPOLIA', '0xA6eb0b8B88fb7172D2e404A8523C8E62e3efa7Bf'),
      },
      usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    // Celo Sepolia (active Celo testnet)
    celoSepolia: {
      chainId: 11142220,
      rpcUrl: getEnv('CELO_SEPOLIA_RPC', getEnv('CELO_ALFAJORES_RPC', 'https://forno.celo-sepolia.celo-testnet.org')),
      contracts: {
        escrowRail: getEnv('ESCROW_RAIL_CELO_SEPOLIA', getEnv('ESCROW_RAIL_CELO_ALFAJORES', '')),
        escrowRailERC20: getEnv(
          'ESCROW_RAIL_ERC20_CELO_SEPOLIA',
          getEnv('ESCROW_RAIL_ERC20_CELO_ALFAJORES', '')
        ),
        dealRailHook: getEnv('DEALRAIL_HOOK_CELO_SEPOLIA', getEnv('DEALRAIL_HOOK_CELO_ALFAJORES', '')),
        erc8004Verifier: getEnv(
          'ERC8004_VERIFIER_CELO_SEPOLIA',
          getEnv('ERC8004_VERIFIER_CELO_ALFAJORES', '')
        ),
      },
      cusdAddress: getEnv(
        'CELO_SEPOLIA_STABLE_TOKEN',
        // Circle USDC testnet on Celo Sepolia
        '0x01C5C0122039549AD1493B8220cABEdD739BC44E'
      ),
    },
    // Default active chain
    activeChain: (getEnv('ACTIVE_CHAIN', 'baseSepolia')) as 'baseSepolia' | 'celoSepolia',
    get activeChainConfig() {
      return this.activeChain === 'baseSepolia' ? this.baseSepolia : this.celoSepolia;
    },
    get chainId() {
      return this.activeChainConfig.chainId;
    },
    get rpcUrl() {
      return this.activeChainConfig.rpcUrl;
    },
    get escrowAddress() {
      return this.activeChainConfig.contracts.escrowRailERC20;
    },
    // Wallet keys
    deployerPrivateKey: getEnv('DEPLOYER_PRIVATE_KEY'),
    agentPrivateKey: getEnv('AGENT_PRIVATE_KEY'),
    evaluatorPrivateKey: getEnv('EVALUATOR_PRIVATE_KEY'),
  },
  database: {
    url: getEnv('DATABASE_URL', 'postgresql://localhost:5432/dealrail'),
  },
  bankr: {
    apiKey: getEnv('BANKR_API_KEY', ''),
    apiUrl: getEnv('BANKR_API_URL', 'https://api.bankr.bot'),
  },
  ipfs: {
    pinataJwt: getEnv('PINATA_JWT', ''),
    gateway: getEnv('PINATA_GATEWAY', 'https://gateway.pinata.cloud'),
  },
  integrations: {
    uniswap: {
      baseMainnetRpc: getEnv('BASE_MAINNET_RPC', 'https://mainnet.base.org'),
      quoterV2: getEnv('UNISWAP_QUOTER_V2_BASE', '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a'),
      swapRouter02: getEnv('UNISWAP_SWAP_ROUTER_02_BASE', '0x2626664c2603336E57B271c5C0b26F421741e481'),
      universalRouter: getEnv('UNISWAP_UNIVERSAL_ROUTER_BASE', '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD'),
    },
    locus: {
      mcpUrl: getEnv('LOCUS_MCP_URL', 'https://mcp.paywithlocus.com/mcp'),
      apiKey: getEnv('LOCUS_API_KEY', ''),
      mockMode: getEnv('LOCUS_MOCK_MODE', 'true').toLowerCase() !== 'false',
      sendUsdcTool: getEnv('LOCUS_SEND_USDC_TOOL', 'send_usdc'),
    },
    erc8004: {
      identityRegistry: getEnv('ERC8004_IDENTITY_REGISTRY', '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'),
      reputationRegistry: getEnv('ERC8004_REPUTATION_REGISTRY', '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63'),
      baseMainnetRpc: getEnv('BASE_MAINNET_RPC', 'https://mainnet.base.org'),
    },
    discovery: {
      x402nEnabled: getEnv('DISCOVERY_X402N_ENABLED', 'true').toLowerCase() !== 'false',
      virtualsEnabled: getEnv('DISCOVERY_VIRTUALS_ENABLED', 'false').toLowerCase() === 'true',
      nearEnabled: getEnv('DISCOVERY_NEAR_ENABLED', 'false').toLowerCase() === 'true',
      virtualsServicesUrl: getEnv('DISCOVERY_VIRTUALS_SERVICES_URL', ''),
      nearServicesUrl: getEnv('DISCOVERY_NEAR_SERVICES_URL', ''),
      timeoutMs: parseInt(getEnv('DISCOVERY_TIMEOUT_MS', '3500'), 10),
    },
  },
  x402n: {
    baseUrl: getEnv('X402N_BASE_URL', 'https://x402n.kairen.xyz/api/v1'),
    apiKey: getEnv('X402N_API_KEY', ''),
    // Default to mock mode for deterministic hackathon demos.
    mockMode: getEnv('X402N_MOCK_MODE', 'true').toLowerCase() !== 'false',
  },
  // Helper getters
  get activeChainConfig() {
    return this.blockchain.activeChain === 'baseSepolia'
      ? this.blockchain.baseSepolia
      : this.blockchain.celoSepolia;
  },
  get chainId() {
    return this.activeChainConfig.chainId;
  },
  get rpcUrl() {
    return this.activeChainConfig.rpcUrl;
  },
  get escrowAddress() {
    return this.activeChainConfig.contracts.escrowRailERC20;
  },
};

export default config;
