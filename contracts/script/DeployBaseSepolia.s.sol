// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EscrowRail.sol";
import "../src/EscrowRailERC20.sol";
import "../src/DealRailHook.sol";
import "../src/identity/NullVerifier.sol";
import "../src/identity/ERC8004Verifier.sol";

/**
 * @title DeployBaseSepolia
 * @notice Deployment script for Base Sepolia testnet
 * @dev Deploys:
 *      1. NullVerifier (for permissionless testing)
 *      2. ERC8004Verifier (for reputation-gated testing)
 *      3. EscrowRail (native ETH variant)
 *      4. EscrowRailERC20 (USDC variant)
 *      5. DealRailHook (reputation gates + post-settlement feedback)
 *
 * Usage:
 *   source .env
 *   forge script script/DeployBaseSepolia.s.sol:DeployBaseSepolia \
 *     --rpc-url $BASE_SEPOLIA_RPC \
 *     --broadcast \
 *     --verify
 *
 * Expected env vars:
 *   - BASE_SEPOLIA_RPC
 *   - DEPLOYER_PRIVATE_KEY
 */
contract DeployBaseSepolia is Script {
    // Base Sepolia USDC address (test token)
    // If this doesn't exist, we'll need to deploy a mock ERC20
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Deploying to Base Sepolia ===");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy NullVerifier (permissionless)
        NullVerifier nullVerifier = new NullVerifier();
        console.log("NullVerifier deployed at:", address(nullVerifier));

        // 2. Deploy ERC8004Verifier (reputation-gated)
        ERC8004Verifier erc8004Verifier = new ERC8004Verifier();
        console.log("ERC8004Verifier deployed at:", address(erc8004Verifier));

        // 3. Deploy EscrowRail (native ETH)
        EscrowRail escrowRail = new EscrowRail(address(nullVerifier));
        console.log("EscrowRail (ETH) deployed at:", address(escrowRail));

        // 4. Deploy EscrowRailERC20 (USDC)
        EscrowRailERC20 escrowRailUSDC = new EscrowRailERC20(
            USDC_BASE_SEPOLIA,
            address(erc8004Verifier)
        );
        console.log("EscrowRailERC20 (USDC) deployed at:", address(escrowRailUSDC));

        // 5. Deploy DealRailHook for USDC escrow
        // Minimum reputation: 300 out of 1000
        DealRailHook hook = new DealRailHook(
            address(escrowRailUSDC),
            300 // minimumReputation
        );
        console.log("DealRailHook deployed at:", address(hook));

        vm.stopBroadcast();

        // Print deployment summary
        console.log("\n=== Deployment Complete ===");
        console.log("Chain: Base Sepolia (84532)");
        console.log("Explorer: https://sepolia.basescan.org");
        console.log("\nContract Addresses:");
        console.log("-------------------");
        console.log("NullVerifier:         ", address(nullVerifier));
        console.log("ERC8004Verifier:      ", address(erc8004Verifier));
        console.log("EscrowRail (ETH):     ", address(escrowRail));
        console.log("EscrowRailERC20 (USDC):", address(escrowRailUSDC));
        console.log("DealRailHook:         ", address(hook));
        console.log("\nSettlement Token (USDC):", USDC_BASE_SEPOLIA);
        console.log("\nNext Steps:");
        console.log("1. Update .env with deployed contract addresses");
        console.log("2. Verify contracts on BaseScan");
        console.log("3. Fund test wallets with USDC");
        console.log("4. Test full deal lifecycle");
    }
}
