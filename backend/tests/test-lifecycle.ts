// Full Job Lifecycle Test
import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const ESCROW_ADDRESS = '0x53d368b5467524F7d674B70F00138a283e1533ce';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

const DEPLOYER_KEY = '0xece73f45df44cc1748e06cf3762d895ba6878085081c685e03fd2bbc46efea4d';
const AGENT_KEY = '0xbc4d780784d2bcda1043ad58272aab996d19cc7e0aa3dc025c0cdbde7a01bad8';
const EVALUATOR_KEY = '0x3e59deaa1b4eae55932c3c245d389bc7c0bbfb3836810202ad3098db21205e33';

const ESCROW_ABI = [
  'function createJob(address provider, address evaluator, uint256 expiry, address hook) returns (uint256)',
  'function fund(uint256 jobId, uint256 expectedBudget)',
  'function submit(uint256 jobId, bytes32 deliverable)',
  'function complete(uint256 jobId, bytes32 reason)',
  'function getJob(uint256 jobId) view returns (tuple(address client, address provider, address evaluator, uint256 budget, uint256 expiry, uint8 state, bytes32 deliverable, address hook))',
  'function nextJobId() view returns (uint256)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];

async function main() {
  console.log('🚀 DealRail Full Lifecycle Test\n');

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const deployer = new ethers.Wallet(DEPLOYER_KEY, provider);
  const agent = new ethers.Wallet(AGENT_KEY, provider);
  const evaluator = new ethers.Wallet(EVALUATOR_KEY, provider);

  console.log('Wallets:');
  console.log('  Deployer:', deployer.address);
  console.log('  Agent:', agent.address);
  console.log('  Evaluator:', evaluator.address);
  console.log();

  // Check USDC balance
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
  const balance = await usdc.balanceOf(deployer.address);
  console.log('USDC Balance:', ethers.formatUnits(balance, 6), 'USDC\n');

  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, deployer);

  // STEP 1: Create Job
  console.log('📝 STEP 1: Creating Job...');
  const nextId = await escrow.nextJobId();
  console.log('  Next Job ID:', nextId.toString());

  const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const tx1 = await escrow.createJob(
    agent.address,
    evaluator.address,
    expiry,
    ethers.ZeroAddress
  );
  console.log('  TX submitted:', tx1.hash);
  const receipt1 = await tx1.wait();
  console.log('  ✅ Job created! Gas used:', receipt1.gasUsed.toString());
  console.log('  Explorer:', `https://sepolia.basescan.org/tx/${tx1.hash}\n`);

  const jobId = nextId;

  // STEP 2: Approve USDC
  console.log('💰 STEP 2: Approving USDC...');
  const amount = ethers.parseUnits('0.1', 6); // 0.1 USDC (nano-payment)
  const usdcWithSigner = usdc.connect(deployer);
  const tx2 = await usdcWithSigner.approve(ESCROW_ADDRESS, amount);
  console.log('  TX submitted:', tx2.hash);
  await tx2.wait();
  console.log('  ✅ Approved 0.1 USDC\n');

  // STEP 3: Fund Job
  console.log('💵 STEP 3: Funding Job...');
  const tx3 = await escrow.fund(jobId, amount);
  console.log('  TX submitted:', tx3.hash);
  const receipt3 = await tx3.wait();
  console.log('  ✅ Job funded! Gas used:', receipt3.gasUsed.toString());
  console.log('  Explorer:', `https://sepolia.basescan.org/tx/${tx3.hash}\n`);

  // Verify state after funding
  console.log('⏳ Waiting for state confirmation...');
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second wait

  const jobAfterFunding = await escrow.getJob(jobId);
  console.log('  Job state after funding:', Number(jobAfterFunding.state), '(1 = Funded)');
  console.log('  Job budget:', ethers.formatUnits(jobAfterFunding.budget, 6), 'USDC');
  console.log('  Provider address:', jobAfterFunding.provider);
  console.log();

  if (Number(jobAfterFunding.state) !== 1) {
    throw new Error(`Expected state Funded (1), got ${jobAfterFunding.state}`);
  }

  // STEP 4: Submit Deliverable (as provider/agent)
  console.log('📤 STEP 4: Submitting Deliverable (as agent)...');
  console.log('  Agent address:', agent.address);
  console.log('  Expected provider:', jobAfterFunding.provider);

  if (agent.address.toLowerCase() !== jobAfterFunding.provider.toLowerCase()) {
    throw new Error(`Agent address ${agent.address} does not match job provider ${jobAfterFunding.provider}`);
  }

  const escrowAsAgent = escrow.connect(agent);
  const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes('Test deliverable content'));
  const tx4 = await escrowAsAgent.submit(jobId, deliverableHash);
  console.log('  TX submitted:', tx4.hash);
  await tx4.wait();
  console.log('  ✅ Deliverable submitted!');
  console.log('  Hash:', deliverableHash);
  console.log('  Explorer:', `https://sepolia.basescan.org/tx/${tx4.hash}\n`);

  // Wait for state to update
  console.log('⏳ Waiting for state confirmation...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log();

  // STEP 5: Complete Job (as evaluator)
  console.log('✅ STEP 5: Completing Job (as evaluator)...');
  const escrowAsEvaluator = escrow.connect(evaluator);
  const reasonHash = ethers.keccak256(ethers.toUtf8Bytes('Quality verified'));
  const tx5 = await escrowAsEvaluator.complete(jobId, reasonHash);
  console.log('  TX submitted:', tx5.hash);
  const receipt5 = await tx5.wait();
  console.log('  ✅ Job completed! Gas used:', receipt5.gasUsed.toString());
  console.log('  Explorer:', `https://sepolia.basescan.org/tx/${tx5.hash}\n`);

  // STEP 6: Verify final state
  console.log('🔍 STEP 6: Verifying Final State...');
  const job = await escrow.getJob(jobId);
  console.log('  Job ID:', jobId.toString());
  console.log('  Client:', job.client);
  console.log('  Provider:', job.provider);
  console.log('  Budget:', ethers.formatUnits(job.budget, 6), 'USDC');
  console.log('  State:', Number(job.state), '(3 = Completed)');
  console.log('  Deliverable:', job.deliverable);
  console.log();

  console.log('🎉 FULL LIFECYCLE TEST COMPLETE!');
  console.log('View all transactions on BaseScan:');
  console.log(`https://sepolia.basescan.org/address/${ESCROW_ADDRESS}\n`);
}

main().catch(console.error);
