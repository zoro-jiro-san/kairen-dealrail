// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EscrowRail.sol";
import "../src/EscrowRailERC20.sol";
import "../src/DealRailHook.sol";
import "../src/identity/NullVerifier.sol";
import "../src/identity/ERC8004Verifier.sol";

/**
 * @title DeployCeloAlfajores
 * @notice Deployment script for Celo Alfajores testnet
 * @dev Deploys:
 *      1. NullVerifier (for permissionless testing)
 *      2. ERC8004Verifier (for reputation-gated testing)
 *      3. EscrowRail (native CELO variant)
 *      4. EscrowRailERC20 (cUSD variant)
 *      5. DealRailHook (reputation gates + post-settlement feedback)
 *
 * Usage:
 *   source .env
 *   forge script script/DeployCeloAlfajores.s.sol:DeployCeloAlfajores \
 *     --rpc-url $CELO_ALFAJORES_RPC \
 *     --broadcast \
 *     --legacy
 *
 * Expected env vars:
 *   - CELO_ALFAJORES_RPC
 *   - DEPLOYER_PRIVATE_KEY
 *
 * Note: Use --legacy flag for Celo (EIP-1559 not fully supported)
 */
contract DeployCeloAlfajores is Script {
    // Celo Alfajores cUSD address (official testnet stablecoin)
    address constant CUSD_ALFAJORES = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Deploying to Celo Alfajores ===");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy NullVerifier (permissionless)
        NullVerifier nullVerifier = new NullVerifier();
        console.log("NullVerifier deployed at:", address(nullVerifier));

        // 2. Deploy ERC8004Verifier (reputation-gated)
        ERC8004Verifier erc8004Verifier = new ERC8004Verifier();
        console.log("ERC8004Verifier deployed at:", address(erc8004Verifier));

        // 3. Deploy EscrowRail (native CELO)
        EscrowRail escrowRail = new EscrowRail(address(nullVerifier));
        console.log("EscrowRail (CELO) deployed at:", address(escrowRail));

        // 4. Deploy EscrowRailERC20 (cUSD)
        EscrowRailERC20 escrowRailCUSD = new EscrowRailERC20(
            CUSD_ALFAJORES,
            address(erc8004Verifier)
        );
        console.log("EscrowRailERC20 (cUSD) deployed at:", address(escrowRailCUSD));

        // 5. Deploy DealRailHook for cUSD escrow
        // Minimum reputation: 300 out of 1000
        DealRailHook hook = new DealRailHook(
            address(escrowRailCUSD),
            300 // minimumReputation
        );
        console.log("DealRailHook deployed at:", address(hook));

        vm.stopBroadcast();

        // Print deployment summary
        console.log("\n=== Deployment Complete ===");
        console.log("Chain: Celo Alfajores (44787)");
        console.log("Explorer: https://alfajores.celoscan.io");
        console.log("\nContract Addresses:");
        console.log("-------------------");
        console.log("NullVerifier:          ", address(nullVerifier));
        console.log("ERC8004Verifier:       ", address(erc8004Verifier));
        console.log("EscrowRail (CELO):     ", address(escrowRail));
        console.log("EscrowRailERC20 (cUSD):", address(escrowRailCUSD));
        console.log("DealRailHook:          ", address(hook));
        console.log("\nSettlement Token (cUSD):", CUSD_ALFAJORES);
        console.log("\nNext Steps:");
        console.log("1. Update .env with deployed contract addresses");
        console.log("2. Get test cUSD from faucet: https://faucet.celo.org/alfajores");
        console.log("3. Fund test wallets with cUSD");
        console.log("4. Test full deal lifecycle");
    }
}
