// Transfer USDC from Agent back to Deployer (recycling)
import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

const AGENT_KEY = '0xbc4d780784d2bcda1043ad58272aab996d19cc7e0aa3dc025c0cdbde7a01bad8';
const DEPLOYER_ADDRESS = '0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e';

const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

async function main() {
  console.log('♻️  USDC Recycling: Agent → Deployer\n');

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const agent = new ethers.Wallet(AGENT_KEY, provider);

  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
  const agentBalance = await usdc.balanceOf(agent.address);

  console.log('Agent USDC Balance:', ethers.formatUnits(agentBalance, 6), 'USDC');

  if (agentBalance === 0n) {
    console.log('❌ No USDC to recycle. Agent wallet is empty.\n');
    return;
  }

  // Transfer all USDC from agent to deployer
  console.log('\n🔄 Transferring', ethers.formatUnits(agentBalance, 6), 'USDC to deployer...');
  console.log('  From:', agent.address);
  console.log('  To:', DEPLOYER_ADDRESS);

  const usdcWithSigner = usdc.connect(agent);
  const tx = await usdcWithSigner.transfer(DEPLOYER_ADDRESS, agentBalance);
  console.log('  TX submitted:', tx.hash);

  const receipt = await tx.wait();
  console.log('  ✅ Transfer complete! Gas used:', receipt.gasUsed.toString());
  console.log('  Explorer:', `https://sepolia.basescan.org/tx/${tx.hash}\n`);

  // Verify final balances
  const agentFinal = await usdc.balanceOf(agent.address);
  const deployerFinal = await usdc.balanceOf(DEPLOYER_ADDRESS);

  console.log('Final Balances:');
  console.log('  Agent:', ethers.formatUnits(agentFinal, 6), 'USDC');
  console.log('  Deployer:', ethers.formatUnits(deployerFinal, 6), 'USDC');
  console.log('\n♻️  Recycling complete! Ready for next test.\n');
}

main().catch(console.error);
