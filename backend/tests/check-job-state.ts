import { ethers } from 'ethers';

const BASE_SEPOLIA_RPC = 'https://base-sepolia.g.alchemy.com/v2/JB7IYC9GSIzz-JMoQcnq2';
const ESCROW_ADDRESS = '0x53d368b5467524F7d674B70F00138a283e1533ce';

const ESCROW_ABI = [
  'function getJob(uint256 jobId) view returns (tuple(address client, address provider, address evaluator, uint256 budget, uint256 expiry, uint8 state, bytes32 deliverable, address hook))',
  'function nextJobId() view returns (uint256)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

  const nextId = await escrow.nextJobId();
  console.log('Next Job ID:', nextId.toString());
  console.log('\nExisting Jobs:');
  console.log('==============\n');

  // Check jobs 1 and 2
  for (let i = 1; i < Number(nextId); i++) {
    try {
      const job = await escrow.getJob(i);
      const stateNames = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'];
      
      console.log(`Job #${i}:`);
      console.log(`  Client: ${job.client}`);
      console.log(`  Provider: ${job.provider}`);
      console.log(`  Evaluator: ${job.evaluator}`);
      console.log(`  Budget: ${ethers.formatUnits(job.budget, 6)} USDC`);
      console.log(`  State: ${stateNames[Number(job.state)]} (${job.state})`);
      console.log(`  Deliverable: ${job.deliverable}`);
      console.log(`  Explorer: https://sepolia.basescan.org/address/${ESCROW_ADDRESS}#readContract`);
      console.log();
    } catch (error) {
      console.log(`Job #${i}: Error - ${error.message}`);
    }
  }
}

main().catch(console.error);
