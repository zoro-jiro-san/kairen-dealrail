import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

const DEPLOYER = '0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e';
const AGENT = '0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF';
const EVALUATOR = '0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2';

const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

async function main() {
  console.log('💰 Wallet Balances on Base Sepolia\n');

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

  const wallets = [
    { name: 'Deployer (Client)', address: DEPLOYER },
    { name: 'Agent (Provider)', address: AGENT },
    { name: 'Evaluator', address: EVALUATOR },
  ];

  let totalUSDC = 0n;
  let totalETH = 0n;

  for (const wallet of wallets) {
    const ethBalance = await provider.getBalance(wallet.address);
    const usdcBalance = await usdc.balanceOf(wallet.address);

    totalETH += ethBalance;
    totalUSDC += usdcBalance;

    console.log(`${wallet.name}:`);
    console.log(`  Address: ${wallet.address}`);
    console.log(`  ETH: ${ethers.formatEther(ethBalance)}`);
    console.log(`  USDC: ${ethers.formatUnits(usdcBalance, 6)}`);
    console.log();
  }

  console.log('═══════════════════════════════════════');
  console.log(`Total ETH:  ${ethers.formatEther(totalETH)}`);
  console.log(`Total USDC: ${ethers.formatUnits(totalUSDC, 6)}`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
