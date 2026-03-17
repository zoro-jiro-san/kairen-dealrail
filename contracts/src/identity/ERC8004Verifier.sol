// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IIdentityVerifier.sol";
import "../interfaces/IERC8004Registries.sol";

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

        uint256 agentId = _resolveAgentId(agent);
        if (agentId == 0) {
            return VerificationResult({isVerified: false, reputationScore: 0, tier: "unverified", isSuspended: false});
        }

        (bool ok, uint256 reputation) = _resolveReputation(agentId);
        if (!ok) {
            reputation = 0;
        }

        return VerificationResult({
            isVerified: true,
            reputationScore: reputation,
            tier: _tierFor(reputation),
            isSuspended: false
        });
    }

    /**
     * @inheritdoc IIdentityVerifier
     */
    function verifierName() external pure override returns (string memory) {
        return "ERC-8004";
    }

    function _resolveAgentId(address agent) internal view returns (uint256) {
        try IERC8004IdentityRegistry(ERC8004_IDENTITY_REGISTRY).agentIdOf(agent) returns (uint256 id) {
            if (id > 0) return id;
        } catch {}

        try IERC8004IdentityRegistryLegacy(ERC8004_IDENTITY_REGISTRY).getTokenId(agent) returns (uint256 tokenId) {
            return tokenId;
        } catch {}

        return 0;
    }

    function _resolveReputation(uint256 agentId) internal view returns (bool ok, uint256 reputation) {
        try IERC8004ReputationRegistry(ERC8004_REPUTATION_REGISTRY).getReputation(agentId) returns (uint256 rep) {
            return (true, rep);
        } catch {}

        try IERC8004ReputationRegistryLegacy(ERC8004_REPUTATION_REGISTRY).getAggregateScore(agentId) returns (
            int128 score
        ) {
            if (score < 0) return (true, 0);
            return (true, uint256(uint128(score)));
        } catch {}

        return (false, 0);
    }

    function _tierFor(uint256 reputation) internal pure returns (string memory) {
        if (reputation >= 800) return "platinum";
        if (reputation >= 600) return "gold";
        if (reputation >= 400) return "silver";
        if (reputation >= 200) return "bronze";
        return "verified";
    }
}
