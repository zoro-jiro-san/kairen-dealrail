// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC8004IdentityRegistry
 * @notice Minimal interface for ERC-8004 identity resolution
 */
interface IERC8004IdentityRegistry {
    function agentIdOf(address agent) external view returns (uint256);
}

/**
 * @title IERC8004IdentityRegistryLegacy
 * @notice Legacy compatibility interface (some implementations expose getTokenId)
 */
interface IERC8004IdentityRegistryLegacy {
    function getTokenId(address agentWallet) external view returns (uint256);
}

/**
 * @title IERC8004ReputationRegistry
 * @notice Minimal interface for score lookup and feedback submission
 */
interface IERC8004ReputationRegistry {
    function getReputation(uint256 agentId) external view returns (uint256);

    function submitFeedback(
        uint256 agentId,
        int128 score,
        string calldata signalName,
        string calldata evidenceUri
    ) external;
}

/**
 * @title IERC8004ReputationRegistryLegacy
 * @notice Legacy compatibility interface (aggregate score naming differs)
 */
interface IERC8004ReputationRegistryLegacy {
    function getAggregateScore(uint256 agentId) external view returns (int128);
}
