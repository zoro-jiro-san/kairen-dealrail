// Reject Path Lifecycle Test
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
  'function reject(uint256 jobId, bytes32 reason)',
  'function getJob(uint256 jobId) view returns (tuple(address client, address provider, address evaluator, uint256 budget, uint256 expiry, uint8 state, bytes32 deliverable, address hook))',
  'function nextJobId() view returns (uint256)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
];

async function main() {
  console.log('🚨 DealRail Reject Path Test\n');

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const deployer = new ethers.Wallet(DEPLOYER_KEY, provider);
  const agent = new ethers.Wallet(AGENT_KEY, provider);
  const evaluator = new ethers.Wallet(EVALUATOR_KEY, provider);

  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, deployer);
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider).connect(deployer);

  // 1) Create
  const nextId = await escrow.nextJobId();
  const jobId = nextId;
  const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const tx1 = await escrow.createJob(agent.address, evaluator.address, expiry, ethers.ZeroAddress);
  await tx1.wait();
  console.log('Created job:', jobId.toString(), tx1.hash);

  // 2) Fund
  const amount = ethers.parseUnits('0.1', 6);
  const tx2 = await usdc.approve(ESCROW_ADDRESS, amount);
  await tx2.wait();
  const tx3 = await escrow.fund(jobId, amount);
  await tx3.wait();
  console.log('Funded job:', tx3.hash);

  // 3) Submit
  const escrowAsAgent = escrow.connect(agent);
  const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes('Intentionally low quality output'));
  const tx4 = await escrowAsAgent.submit(jobId, deliverableHash);
  await tx4.wait();
  console.log('Submitted deliverable:', tx4.hash);

  // 4) Reject
  const escrowAsEvaluator = escrow.connect(evaluator);
  const reasonHash = ethers.keccak256(ethers.toUtf8Bytes('Quality threshold not met'));
  const tx5 = await escrowAsEvaluator.reject(jobId, reasonHash);
  await tx5.wait();
  console.log('Rejected job:', tx5.hash);

  // 5) Verify
  let finalState = -1;
  for (let i = 0; i < 8; i += 1) {
    const job = await escrow.getJob(jobId);
    finalState = Number(job.state);
    if (finalState === 4) break;
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  console.log('Final state:', finalState, '(4 = Rejected)');
  if (finalState !== 4) {
    throw new Error(`Expected rejected state 4, got ${finalState}`);
  }

  console.log('\n✅ Reject path validated');
  console.log('Tx links:');
  console.log(`create:  https://sepolia.basescan.org/tx/${tx1.hash}`);
  console.log(`fund:    https://sepolia.basescan.org/tx/${tx3.hash}`);
  console.log(`submit:  https://sepolia.basescan.org/tx/${tx4.hash}`);
  console.log(`reject:  https://sepolia.basescan.org/tx/${tx5.hash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
