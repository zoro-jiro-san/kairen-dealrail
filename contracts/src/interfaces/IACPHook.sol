// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IACPHook
 * @notice Hook interface for EIP-8183 Agentic Commerce Protocol
 * @dev Allows custom logic before/after state transitions
 *
 * Use Cases:
 *   - Reputation checks before funding
 *   - Delegation verification (MetaMask ERC-7710)
 *   - Post-settlement reputation updates (ERC-8004)
 *   - Custom escrow rules
 *   - Compliance checks
 *
 * Hook Points:
 *   - beforeFund: verify reputation, check delegations
 *   - afterComplete: write positive reputation
 *   - afterReject: write negative reputation
 *   - beforeSubmit: verify provider is still registered
 */
interface IACPHook {
    /**
     * @notice Called before a state-changing action
     * @dev Should revert if the action is not allowed
     * @param jobId The job identifier
     * @param action The function selector being called (e.g., fund, submit)
     * @param data ABI-encoded additional data (varies by action)
     */
    function beforeAction(uint256 jobId, bytes4 action, bytes calldata data) external;

    /**
     * @notice Called after a state-changing action succeeds
     * @dev Implementations MAY revert to enforce strict post-action invariants.
     *      If it reverts, the parent action is rolled back atomically.
     * @param jobId The job identifier
     * @param action The function selector that was called
     * @param data ABI-encoded additional data (varies by action)
     */
    function afterAction(uint256 jobId, bytes4 action, bytes calldata data) external;
}
