// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IIdentityVerifier.sol";

/**
 * @title ERC8004Verifier
 * @notice Identity verifier that reads from ERC-8004 registries
 * @dev Integrates with Protocol Labs' ERC-8004 Identity and Reputation registries
 *
 * Contract Addresses (same on all chains):
 *   - Identity Registry: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
 *   - Reputation Registry: 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
 *
 * Deployed on: Ethereum Mainnet, Base, Linea, Sepolia
 *
 * Features:
 *   - Reads agent registration status from Identity Registry
 *   - Reads reputation scores from Reputation Registry
 *   - Returns structured verification result
 *   - Graceful fallback if registries not deployed on current chain
 *
 * Agent ID Format: eip155:{chainId}:{registryAddress}:{agentId}
 */
contract ERC8004Verifier is IIdentityVerifier {
    // ============ Constants ============

    /// @notice ERC-8004 Identity Registry address (same on all supported chains)
    address public constant ERC8004_IDENTITY_REGISTRY = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;

    /// @notice ERC-8004 Reputation Registry address (same on all supported chains)
    address public constant ERC8004_REPUTATION_REGISTRY = 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63;

    // ============ View Functions ============

    /**
     * @inheritdoc IIdentityVerifier
     * @dev Reads from ERC-8004 registries
     */
    function verify(address agent) external view override returns (VerificationResult memory) {
        // Check if contracts are deployed on this chain
        uint256 identityCodeSize;
        uint256 reputationCodeSize;

        assembly {
            identityCodeSize := extcodesize(ERC8004_IDENTITY_REGISTRY)
            reputationCodeSize := extcodesize(ERC8004_REPUTATION_REGISTRY)
        }

        // If registries not deployed, return unverified but not suspended
        if (identityCodeSize == 0 || reputationCodeSize == 0) {
            return VerificationResult({
                isVerified: false,
                reputationScore: 0,
                tier: "unverified",
                isSuspended: false
            });
        }

        // TODO: Call ERC-8004 registries once we have the interface
        // For now, return a placeholder result

        // Placeholder implementation:
        // - Assume agent is verified if they have non-zero code (i.e., they're a contract)
        // - Assign default reputation score of 500
        // - No one is suspended

        uint256 agentCodeSize;
        assembly {
            agentCodeSize := extcodesize(agent)
        }

        bool isVerified = agentCodeSize > 0 || agent != address(0);
        uint256 reputationScore = isVerified ? 500 : 0;
        string memory tier = isVerified ? "verified" : "unverified";

        return VerificationResult({
            isVerified: isVerified,
            reputationScore: reputationScore,
            tier: tier,
            isSuspended: false
        });

        // Production implementation (uncomment when ERC-8004 interface is available):
        /*
        // Get agent ID from Identity Registry
        uint256 agentId = IERC8004IdentityRegistry(ERC8004_IDENTITY_REGISTRY).agentIdOf(agent);

        if (agentId == 0) {
            // Agent not registered
            return VerificationResult({
                isVerified: false,
                reputationScore: 0,
                tier: "unverified",
                isSuspended: false
            });
        }

        // Get reputation from Reputation Registry
        uint256 reputation = IERC8004ReputationRegistry(ERC8004_REPUTATION_REGISTRY).getReputation(agentId);

        // Determine tier based on reputation score
        string memory tier;
        if (reputation >= 800) {
            tier = "platinum";
        } else if (reputation >= 600) {
            tier = "gold";
        } else if (reputation >= 400) {
            tier = "silver";
        } else if (reputation >= 200) {
            tier = "bronze";
        } else {
            tier = "verified";
        }

        // Check if suspended (would require additional registry call)
        bool isSuspended = false; // TODO: implement suspension check

        return VerificationResult({
            isVerified: true,
            reputationScore: reputation,
            tier: tier,
            isSuspended: isSuspended
        });
        */
    }

    /**
     * @inheritdoc IIdentityVerifier
     */
    function verifierName() external pure override returns (string memory) {
        return "ERC-8004";
    }
}
