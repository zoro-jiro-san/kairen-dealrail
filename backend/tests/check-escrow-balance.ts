import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const ESCROW_ADDRESS = '0x53d368b5467524F7d674B70F00138a283e1533ce';

const ERC20_ABI = ['function balanceOf(address account) view returns (uint256)'];

async function main() {
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
  
  const balance = await usdc.balanceOf(ESCROW_ADDRESS);
  console.log('Escrow Contract USDC Balance:', ethers.formatUnits(balance, 6), 'USDC');
}

main().catch(console.error);
