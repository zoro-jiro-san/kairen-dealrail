// Complete Jobs #1 and #2 to release the 20 USDC
import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const ESCROW_ADDRESS = '0x53d368b5467524F7d674B70F00138a283e1533ce';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

const AGENT_KEY = '0xbc4d780784d2bcda1043ad58272aab996d19cc7e0aa3dc025c0cdbde7a01bad8';
const EVALUATOR_KEY = '0x3e59deaa1b4eae55932c3c245d389bc7c0bbfb3836810202ad3098db21205e33';

const ESCROW_ABI = [
  'function submit(uint256 jobId, bytes32 deliverable)',
  'function complete(uint256 jobId, bytes32 reason)',
  'function getJob(uint256 jobId) view returns (tuple(address client, address provider, address evaluator, uint256 budget, uint256 expiry, uint8 state, bytes32 deliverable, address hook))',
];

const ERC20_ABI = ['function balanceOf(address account) view returns (uint256)'];

async function completeJob(jobId: number, agent: ethers.Wallet, evaluator: ethers.Wallet, escrow: ethers.Contract) {
  const stateNames = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'];

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Job #${jobId}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Check current state
  const jobBefore = await escrow.getJob(jobId);
  console.log('Current State:', stateNames[Number(jobBefore.state)]);
  console.log('Budget:', ethers.formatUnits(jobBefore.budget, 6), 'USDC\n');

  if (Number(jobBefore.state) === 3) {
    console.log('✅ Already completed! Skipping...\n');
    return;
  }

  // Submit deliverable (if not already submitted)
  if (Number(jobBefore.state) === 1) {
    console.log('📤 Step 1: Submitting deliverable (as agent)...');
    const escrowAsAgent = escrow.connect(agent);
    const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes(`Deliverable for Job #${jobId}`));

    const tx1 = await escrowAsAgent.submit(jobId, deliverableHash);
    console.log('  TX:', tx1.hash);
    await tx1.wait();
    console.log('  ✅ Submitted!');

    // Wait for state to update
    console.log('  ⏳ Waiting for state confirmation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log();
  }

  // Complete job (as evaluator)
  console.log('✅ Step 2: Completing job (as evaluator)...');
  const escrowAsEvaluator = escrow.connect(evaluator);
  const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(`Approved - Job #${jobId}`));

  const tx2 = await escrowAsEvaluator.complete(jobId, reasonHash);
  console.log('  TX:', tx2.hash);
  const receipt = await tx2.wait();
  console.log('  ✅ Completed! Gas:', receipt.gasUsed.toString());
  console.log('  Explorer:', `https://sepolia.basescan.org/tx/${tx2.hash}`);
  console.log();

  // Verify final state
  const jobAfter = await escrow.getJob(jobId);
  console.log('Final State:', stateNames[Number(jobAfter.state)]);
  console.log();
}

async function main() {
  console.log('🚀 Completing Funded Jobs #1 and #2\n');
  console.log('This will release 20 USDC from escrow to agent wallet.\n');

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const agent = new ethers.Wallet(AGENT_KEY, provider);
  const evaluator = new ethers.Wallet(EVALUATOR_KEY, provider);
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

  // Check agent balance before
  const agentBalanceBefore = await usdc.balanceOf(agent.address);
  console.log('Agent USDC before:', ethers.formatUnits(agentBalanceBefore, 6), 'USDC\n');

  // Complete Job #1
  await completeJob(1, agent, evaluator, escrow);

  // Complete Job #2
  await completeJob(2, agent, evaluator, escrow);

  // Check agent balance after
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Results');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const agentBalanceAfter = await usdc.balanceOf(agent.address);
  const gained = agentBalanceAfter - agentBalanceBefore;

  console.log('Agent USDC after:', ethers.formatUnits(agentBalanceAfter, 6), 'USDC');
  console.log('USDC gained:', ethers.formatUnits(gained, 6), 'USDC\n');

  console.log('🎉 Jobs completed successfully!');
  console.log('\n💡 Next step: Run `npx tsx recycle-usdc.ts` to transfer USDC back to deployer.\n');
}

main().catch(console.error);
