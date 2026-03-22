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

function getOptionalEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

export const config = {
  server: {
    host: getEnv('HOST', getEnv('NODE_ENV', 'development') === 'production' ? '0.0.0.0' : '127.0.0.1'),
    port: parseInt(getEnv('PORT', '3001'), 10),
    nodeEnv: getEnv('NODE_ENV', 'development'),
  },
  blockchain: {
    // Base Sepolia (deployed)
    baseSepolia: {
      chainId: 84532,
      rpcUrl: getEnv('BASE_SEPOLIA_RPC', 'https://sepolia.base.org'),
      contracts: {
        escrowRail: getEnv('ESCROW_RAIL_BASE_SEPOLIA', '0x8c55C2BB6A396D3654f214726230D81e6fa22b69'),
        escrowRailERC20: getEnv('ESCROW_RAIL_ERC20_BASE_SEPOLIA', '0xE25B10057556e9714d2ac60992b68f4E61481cF9'),
        dealRailHook: getEnv('DEALRAIL_HOOK_BASE_SEPOLIA', '0x5fA109A74a688a49D254a21C2F3ab238E2A7F62e'),
        erc8004Verifier: getEnv('ERC8004_VERIFIER_BASE_SEPOLIA', '0xDB23657606957B32B385eC0A917d2818156668AC'),
        nullVerifier: getEnv('NULL_VERIFIER_BASE_SEPOLIA', '0xA61a57fF5570bF989a3a565B87b6421413995317'),
      },
      usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    // Celo Sepolia (active Celo testnet)
    celoSepolia: {
      chainId: 11142220,
      rpcUrl: getEnv('CELO_SEPOLIA_RPC', getEnv('CELO_ALFAJORES_RPC', 'https://forno.celo-sepolia.celo-testnet.org')),
      contracts: {
        escrowRail: getEnv('ESCROW_RAIL_CELO_SEPOLIA', getEnv('ESCROW_RAIL_CELO_ALFAJORES', '0x684D32E03642870B88134A3722B0b094666EF42e')),
        escrowRailERC20: getEnv(
          'ESCROW_RAIL_ERC20_CELO_SEPOLIA',
          getEnv('ESCROW_RAIL_ERC20_CELO_ALFAJORES', '0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74')
        ),
        dealRailHook: getEnv('DEALRAIL_HOOK_CELO_SEPOLIA', getEnv('DEALRAIL_HOOK_CELO_ALFAJORES', '0x04B0D16f790A5F83dc48c7e4D05467ff2eA57519')),
        erc8004Verifier: getEnv(
          'ERC8004_VERIFIER_CELO_SEPOLIA',
          getEnv('ERC8004_VERIFIER_CELO_ALFAJORES', '0x2700e5B26909301967DFeECE9cb931B9bA3bA2df')
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
    apiKey: getOptionalEnv('BANKR_API_KEY'),
    apiUrl: getEnv('BANKR_API_URL', 'https://api.bankr.bot'),
  },
  ipfs: {
    pinataJwt: getOptionalEnv('PINATA_JWT'),
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
      apiKey: getOptionalEnv('LOCUS_API_KEY'),
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
      virtualsServicesUrl: getOptionalEnv('DISCOVERY_VIRTUALS_SERVICES_URL'),
      nearServicesUrl: getOptionalEnv('DISCOVERY_NEAR_SERVICES_URL'),
      timeoutMs: parseInt(getEnv('DISCOVERY_TIMEOUT_MS', '3500'), 10),
    },
  },
  x402n: {
    baseUrl: getEnv('X402N_BASE_URL', 'https://x402n.kairen.xyz/api/v1'),
    apiKey: getOptionalEnv('X402N_API_KEY'),
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
