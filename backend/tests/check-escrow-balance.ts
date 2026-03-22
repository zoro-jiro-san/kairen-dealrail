import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const ESCROW_ADDRESS = process.env.ESCROW_RAIL_ERC20_BASE_SEPOLIA || '';

const ERC20_ABI = ['function balanceOf(address account) view returns (uint256)'];

async function main() {
  if (!ESCROW_ADDRESS) {
    throw new Error('Missing required env value ESCROW_RAIL_ERC20_BASE_SEPOLIA.');
  }

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
  
  const balance = await usdc.balanceOf(ESCROW_ADDRESS);
  console.log('Escrow Contract USDC Balance:', ethers.formatUnits(balance, 6), 'USDC');
}

main().catch(console.error);
