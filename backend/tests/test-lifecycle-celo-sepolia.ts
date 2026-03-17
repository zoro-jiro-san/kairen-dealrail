import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const rpc = process.env.CELO_SEPOLIA_RPC;
const escrowAddress = process.env.ESCROW_RAIL_ERC20_CELO_SEPOLIA;
const stableToken = process.env.CELO_SEPOLIA_STABLE_TOKEN;
const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
const providerKey = process.env.AGENT_PRIVATE_KEY;
const evaluatorKey = process.env.EVALUATOR_PRIVATE_KEY;

if (!rpc || !escrowAddress || !stableToken || !deployerKey || !providerKey || !evaluatorKey) {
  throw new Error('Missing required env vars for Celo Sepolia lifecycle test');
}

const ESCROW_ABI = [
  'function createJob(address provider, address evaluator, uint256 expiry, address hook) returns (uint256)',
  'function fund(uint256 jobId, uint256 expectedBudget)',
  'function submit(uint256 jobId, bytes32 deliverable)',
  'function complete(uint256 jobId, bytes32 reason)',
  'function reject(uint256 jobId, bytes32 reason)',
  'function getJob(uint256 jobId) view returns (tuple(address client, address provider, address evaluator, uint256 budget, uint256 expiry, uint8 state, bytes32 deliverable, address hook))',
  'function nextJobId() view returns (uint256)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];

const EXPLORER_TX = 'https://celo-sepolia.blockscout.com/tx/';

async function main() {
  const provider = new ethers.JsonRpcProvider(rpc);
  const deployer = new ethers.Wallet(deployerKey, provider);
  const worker = new ethers.Wallet(providerKey, provider);
  const evaluator = new ethers.Wallet(evaluatorKey, provider);

  const escrow = new ethers.Contract(escrowAddress, ESCROW_ABI, deployer);
  const stable = new ethers.Contract(stableToken, ERC20_ABI, provider);

  const deployerBal = await stable.balanceOf(deployer.address);
  if (deployerBal < 2_200_000n) {
    throw new Error(`Insufficient deployer stable balance: ${deployerBal.toString()}`);
  }

  const amount = 1_000_000n; // 1.0 token (6 decimals)
  const expiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const out: Record<string, unknown> = {
    network: 'celo-sepolia',
    chainId: 11142220,
    escrowAddress,
    stableToken,
    runAt: new Date().toISOString(),
    actors: {
      deployer: deployer.address,
      provider: worker.address,
      evaluator: evaluator.address,
    },
    happyPath: {},
    rejectPath: {},
  };

  // Happy path
  const nextHappy = await escrow.nextJobId();
  const createHappy = await escrow.createJob(worker.address, evaluator.address, expiry, ethers.ZeroAddress);
  await createHappy.wait();

  const approveHappy = await stable.connect(deployer).approve(escrowAddress, amount);
  await approveHappy.wait();

  const fundHappy = await escrow.fund(nextHappy, amount);
  await fundHappy.wait();

  const submitHappy = await escrow.connect(worker).submit(
    nextHappy,
    ethers.keccak256(ethers.toUtf8Bytes(`celo-sepolia-happy-${Date.now()}`))
  );
  await submitHappy.wait();

  const completeHappy = await escrow.connect(evaluator).complete(
    nextHappy,
    ethers.keccak256(ethers.toUtf8Bytes('approved-celo-sepolia-smoke'))
  );
  await completeHappy.wait();

  const happyJob = await escrow.getJob(nextHappy);

  out.happyPath = {
    jobId: nextHappy.toString(),
    txs: {
      createJob: createHappy.hash,
      approve: approveHappy.hash,
      fund: fundHappy.hash,
      submit: submitHappy.hash,
      complete: completeHappy.hash,
    },
    explorer: {
      createJob: EXPLORER_TX + createHappy.hash,
      approve: EXPLORER_TX + approveHappy.hash,
      fund: EXPLORER_TX + fundHappy.hash,
      submit: EXPLORER_TX + submitHappy.hash,
      complete: EXPLORER_TX + completeHappy.hash,
    },
    finalStateCode: Number(happyJob.state),
  };

  // Reject path
  const nextReject = await escrow.nextJobId();
  const createReject = await escrow.createJob(worker.address, evaluator.address, expiry, ethers.ZeroAddress);
  await createReject.wait();

  const approveReject = await stable.connect(deployer).approve(escrowAddress, amount);
  await approveReject.wait();

  const fundReject = await escrow.fund(nextReject, amount);
  await fundReject.wait();

  const submitReject = await escrow.connect(worker).submit(
    nextReject,
    ethers.keccak256(ethers.toUtf8Bytes(`celo-sepolia-reject-${Date.now()}`))
  );
  await submitReject.wait();

  const rejectTx = await escrow.connect(evaluator).reject(
    nextReject,
    ethers.keccak256(ethers.toUtf8Bytes('rejected-celo-sepolia-smoke'))
  );
  await rejectTx.wait();

  const rejectJob = await escrow.getJob(nextReject);

  out.rejectPath = {
    jobId: nextReject.toString(),
    txs: {
      createJob: createReject.hash,
      approve: approveReject.hash,
      fund: fundReject.hash,
      submit: submitReject.hash,
      reject: rejectTx.hash,
    },
    explorer: {
      createJob: EXPLORER_TX + createReject.hash,
      approve: EXPLORER_TX + approveReject.hash,
      fund: EXPLORER_TX + fundReject.hash,
      submit: EXPLORER_TX + submitReject.hash,
      reject: EXPLORER_TX + rejectTx.hash,
    },
    finalStateCode: Number(rejectJob.state),
  };

  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
