// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EscrowRail.sol";
import "../src/EscrowRailERC20.sol";
import "../src/DealRailHook.sol";
import "../src/identity/NullVerifier.sol";
import "../src/identity/ERC8004Verifier.sol";

/**
 * @title DeployCeloSepolia
 * @notice Deployment script for Celo Sepolia testnet
 * @dev Deploys:
 *      1. NullVerifier (for permissionless testing)
 *      2. ERC8004Verifier (for reputation-gated testing)
 *      3. EscrowRail (native CELO variant)
 *      4. EscrowRailERC20 (stable-token variant)
 *      5. DealRailHook (reputation gates + post-settlement feedback)
 *
 * Usage:
 *   source .env
 *   forge script script/DeployCeloSepolia.s.sol:DeployCeloSepolia \
 *     --rpc-url $CELO_SEPOLIA_RPC \
 *     --broadcast \
 *     --legacy
 *
 * Expected env vars:
 *   - CELO_SEPOLIA_RPC
 *   - DEPLOYER_PRIVATE_KEY
 *   - CELO_SEPOLIA_STABLE_TOKEN (optional, default below)
 *
 * Note: Use --legacy for widest compatibility.
 */
contract DeployCeloSepolia is Script {
    // Default to Circle testnet USDC on Celo Sepolia.
    // Override with CELO_SEPOLIA_STABLE_TOKEN if needed.
    address constant DEFAULT_STABLE_TOKEN = 0x01C5C0122039549AD1493B8220cABEdD739BC44E;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address stableToken = vm.envOr("CELO_SEPOLIA_STABLE_TOKEN", DEFAULT_STABLE_TOKEN);

        console.log("=== Deploying to Celo Sepolia ===");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);
        console.log("Stable token:", stableToken);

        vm.startBroadcast(deployerPrivateKey);

        NullVerifier nullVerifier = new NullVerifier();
        console.log("NullVerifier deployed at:", address(nullVerifier));

        ERC8004Verifier erc8004Verifier = new ERC8004Verifier();
        console.log("ERC8004Verifier deployed at:", address(erc8004Verifier));

        EscrowRail escrowRail = new EscrowRail(address(nullVerifier));
        console.log("EscrowRail (CELO) deployed at:", address(escrowRail));

        EscrowRailERC20 escrowRailStable = new EscrowRailERC20(
            stableToken,
            address(erc8004Verifier)
        );
        console.log("EscrowRailERC20 (stable) deployed at:", address(escrowRailStable));

        DealRailHook hook = new DealRailHook(
            address(escrowRailStable),
            300
        );
        console.log("DealRailHook deployed at:", address(hook));

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Chain: Celo Sepolia (11142220)");
        console.log("Explorer: https://celo-sepolia.blockscout.com");
        console.log("\nContract Addresses:");
        console.log("-------------------");
        console.log("NullVerifier:           ", address(nullVerifier));
        console.log("ERC8004Verifier:        ", address(erc8004Verifier));
        console.log("EscrowRail (CELO):      ", address(escrowRail));
        console.log("EscrowRailERC20 (stable):", address(escrowRailStable));
        console.log("DealRailHook:           ", address(hook));
    }
}
