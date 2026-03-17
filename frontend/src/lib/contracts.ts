// Contract addresses and ABIs
import { Address } from 'viem';

// Contract addresses - latest deployment (Base Sepolia + Celo Sepolia)
export const ESCROW_ADDRESSES: Record<number, Address> = {
  84532: '0xE25B10057556e9714d2ac60992b68f4E61481cF9', // Base Sepolia - EscrowRailERC20
  11142220: '0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74', // Celo Sepolia - EscrowRailERC20
  8453: '0x0000000000000000000000000000000000000000', // Base Mainnet (not deployed)
};

// USDC addresses
export const USDC_ADDRESSES: Record<number, Address> = {
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia - Mock USDC
  11142220: '0x01C5C0122039549AD1493B8220cABEdD739BC44E', // Celo Sepolia - Stable token
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet - Native USDC
};

export const HOOK_ADDRESSES: Record<number, Address> = {
  84532: '0x5fA109A74a688a49D254a21C2F3ab238E2A7F62e',
  11142220: '0x04B0D16f790A5F83dc48c7e4D05467ff2eA57519',
};

// EscrowRail ABI (minimal for frontend)
export const ESCROW_ABI = [
  // ============ Read Functions ============
  {
    inputs: [{ name: 'jobId', type: 'uint256' }],
    name: 'getJob',
    outputs: [
      {
        components: [
          { name: 'client', type: 'address' },
          { name: 'provider', type: 'address' },
          { name: 'evaluator', type: 'address' },
          { name: 'budget', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
          { name: 'state', type: 'uint8' },
          { name: 'deliverable', type: 'bytes32' },
          { name: 'hook', type: 'address' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'jobId', type: 'uint256' }],
    name: 'getState',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ============ Write Functions ============
  {
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'evaluator', type: 'address' },
      { name: 'expiry', type: 'uint256' },
      { name: 'hook', type: 'address' },
    ],
    name: 'createJob',
    outputs: [{ name: 'jobId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'expectedBudget', type: 'uint256' },
    ],
    name: 'fund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'deliverable', type: 'bytes32' },
    ],
    name: 'submit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'reason', type: 'bytes32' },
    ],
    name: 'complete',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'reason', type: 'bytes32' },
    ],
    name: 'reject',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'jobId', type: 'uint256' }],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ============ Events ============
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: true, name: 'client', type: 'address' },
      { indexed: true, name: 'provider', type: 'address' },
      { indexed: false, name: 'evaluator', type: 'address' },
      { indexed: false, name: 'expiry', type: 'uint256' },
      { indexed: false, name: 'hook', type: 'address' },
    ],
    name: 'JobCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'JobFunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: false, name: 'deliverable', type: 'bytes32' },
    ],
    name: 'JobSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'bytes32' },
    ],
    name: 'JobCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'bytes32' },
    ],
    name: 'JobRejected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'jobId', type: 'uint256' }],
    name: 'JobExpired',
    type: 'event',
  },
] as const;

// Job states enum (matches contract)
export const JobState = {
  OPEN: 0,
  FUNDED: 1,
  SUBMITTED: 2,
  COMPLETED: 3,
  REJECTED: 4,
  EXPIRED: 5,
} as const;

export const JobStateNames: Record<number, string> = {
  [JobState.OPEN]: 'Open',
  [JobState.FUNDED]: 'Funded',
  [JobState.SUBMITTED]: 'Submitted',
  [JobState.COMPLETED]: 'Completed',
  [JobState.REJECTED]: 'Rejected',
  [JobState.EXPIRED]: 'Expired',
};

// Helper to get contract address for current chain
export function getEscrowAddress(chainId: number): Address {
  return ESCROW_ADDRESSES[chainId] || ESCROW_ADDRESSES[84532];
}

export function getHookAddress(chainId: number): Address {
  return HOOK_ADDRESSES[chainId] || '0x0000000000000000000000000000000000000000';
}

// Helper to get USDC address for current chain
export function getUSDCAddress(chainId: number): Address {
  return USDC_ADDRESSES[chainId] || USDC_ADDRESSES[84532];
}

// USDC ABI (minimal for approval)
export const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
