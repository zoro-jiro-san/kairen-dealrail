import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const ESCROW_ADDRESS = '0x53d368b5467524F7d674B70F00138a283e1533ce';
const EVALUATOR_KEY = '0x3e59deaa1b4eae55932c3c245d389bc7c0bbfb3836810202ad3098db21205e33';

const ESCROW_ABI = ['function complete(uint256 jobId, bytes32 reason)'];

async function main() {
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const evaluator = new ethers.Wallet(EVALUATOR_KEY, provider);
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, evaluator);

  console.log('✅ Completing Job #4...');
  const reasonHash = ethers.keccak256(ethers.toUtf8Bytes('Approved'));
  const tx = await escrow.complete(4, reasonHash);
  console.log('  TX:', tx.hash);
  await tx.wait();
  console.log('  ✅ Done!');
}

main().catch(console.error);
