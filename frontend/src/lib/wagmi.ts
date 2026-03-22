// Wagmi v2 configuration for DealRail
import { http, createConfig } from 'wagmi';
import { baseSepolia, celoSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID (get from https://cloud.walletconnect.com)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
const hasWalletConnectProjectId =
  !!projectId && projectId !== 'your_project_id_here' && !projectId.toLowerCase().includes('placeholder');

// Configure chains
export const chains = [baseSepolia, celoSepolia] as const;

// Create Wagmi config
export const config = createConfig({
  chains,
  connectors: hasWalletConnectProjectId
    ? [
        injected(),
        walletConnect({
          projectId,
          metadata: {
            name: 'DealRail',
            description: 'EIP-8183 Agentic Commerce Platform',
            url: 'https://dealrail.xyz',
            icons: ['https://dealrail.xyz/logo.png'],
          },
        }),
      ]
    : [injected()],
  transports: {
    [baseSepolia.id]: http(),
    [celoSepolia.id]: http(),
  },
});

// Export chain IDs for convenience
export const CHAIN_IDS = {
  BASE_SEPOLIA: baseSepolia.id,
  CELO_SEPOLIA: celoSepolia.id,
} as const;

// Default chain
export const defaultChain = baseSepolia;
