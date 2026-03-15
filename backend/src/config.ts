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
    // Celo Alfajores (pending deployment)
    celoAlfajores: {
      chainId: 44787,
      rpcUrl: getEnv('CELO_ALFAJORES_RPC', 'https://alfajores-forno.celo-testnet.org'),
      contracts: {
        escrowRail: getEnv('ESCROW_RAIL_CELO_ALFAJORES', ''),
        escrowRailERC20: getEnv('ESCROW_RAIL_ERC20_CELO_ALFAJORES', ''),
        dealRailHook: getEnv('DEALRAIL_HOOK_CELO_ALFAJORES', ''),
        erc8004Verifier: getEnv('ERC8004_VERIFIER_CELO_ALFAJORES', ''),
      },
      cusdAddress: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    },
    // Default active chain
    activeChain: (getEnv('ACTIVE_CHAIN', 'baseSepolia')) as 'baseSepolia' | 'celoAlfajores',
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
  // Helper getters
  get activeChainConfig() {
    return this.blockchain.activeChain === 'baseSepolia'
      ? this.blockchain.baseSepolia
      : this.blockchain.celoAlfajores;
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
