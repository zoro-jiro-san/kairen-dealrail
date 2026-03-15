// Transfer ETH from deployer to agent and evaluator for gas
import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const DEPLOYER_KEY = '0xece73f45df44cc1748e06cf3762d895ba6878085081c685e03fd2bbc46efea4d';

const AGENT_ADDRESS = '0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF';
const EVALUATOR_ADDRESS = '0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2';

async function main() {
  console.log('💸 Funding Agent and Evaluator Wallets for Gas\n');

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const deployer = new ethers.Wallet(DEPLOYER_KEY, provider);

  const deployerBalance = await provider.getBalance(deployer.address);
  console.log('Deployer Balance:', ethers.formatEther(deployerBalance), 'ETH');
  console.log('Deployer Address:', deployer.address);
  console.log();

  // Transfer 0.001 ETH to Agent
  console.log('📤 Transferring 0.001 ETH to Agent...');
  console.log('  To:', AGENT_ADDRESS);

  const tx1 = await deployer.sendTransaction({
    to: AGENT_ADDRESS,
    value: ethers.parseEther('0.001'),
  });
  console.log('  TX:', tx1.hash);
  await tx1.wait();
  console.log('  ✅ Sent!');
  console.log();

  // Transfer 0.001 ETH to Evaluator
  console.log('📤 Transferring 0.001 ETH to Evaluator...');
  console.log('  To:', EVALUATOR_ADDRESS);

  const tx2 = await deployer.sendTransaction({
    to: EVALUATOR_ADDRESS,
    value: ethers.parseEther('0.001'),
  });
  console.log('  TX:', tx2.hash);
  await tx2.wait();
  console.log('  ✅ Sent!');
  console.log();

  // Check final balances
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Final Balances');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const deployerFinal = await provider.getBalance(deployer.address);
  const agentFinal = await provider.getBalance(AGENT_ADDRESS);
  const evaluatorFinal = await provider.getBalance(EVALUATOR_ADDRESS);

  console.log('Deployer:', ethers.formatEther(deployerFinal), 'ETH');
  console.log('Agent:', ethers.formatEther(agentFinal), 'ETH');
  console.log('Evaluator:', ethers.formatEther(evaluatorFinal), 'ETH');
  console.log();

  console.log('✅ Wallets funded!');
  console.log('\n💡 Next step: Run `npx tsx complete-funded-jobs.ts` to unlock the 20 USDC.\n');
}

main().catch(console.error);
