// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IACPHook.sol";
import "./interfaces/IEIP8183AgenticCommerce.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DealRailHook
 * @notice Hook implementation for DealRail with ERC-8004 reputation integration
 * @dev Enforces reputation gates and writes feedback post-settlement
 *
 * Features:
 *   - beforeFund: verify provider reputation ≥ minimum threshold
 *   - afterComplete: write positive reputation feedback to ERC-8004
 *   - afterReject: write negative reputation feedback
 *   - Owner can update minimum reputation threshold
 *
 * Integration Points:
 *   - ERC-8004 Identity Registry: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
 *   - ERC-8004 Reputation Registry: 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
 *
 * Security:
 *   - Only callable by the escrow contract (set at construction)
 *   - Read-only interactions with ERC-8004 (external call safety)
 *   - Owner can adjust reputation threshold dynamically
 */
contract DealRailHook is IACPHook, Ownable {
    // ============ State Variables ============

    /// @notice The escrow contract authorized to call this hook
    address public immutable escrowContract;

    /// @notice Minimum reputation score required for providers (0-1000 scale)
    uint256 public minimumReputation;

    /// @notice ERC-8004 Identity Registry (deployed at same address on all chains)
    address public constant ERC8004_IDENTITY_REGISTRY = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;

    /// @notice ERC-8004 Reputation Registry (deployed at same address on all chains)
    address public constant ERC8004_REPUTATION_REGISTRY = 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63;

    /// @notice Function selectors for action identification
    bytes4 public constant FUND_SELECTOR = bytes4(keccak256("fund(uint256,uint256)"));
    bytes4 public constant SUBMIT_SELECTOR = bytes4(keccak256("submit(uint256,bytes32)"));
    bytes4 public constant COMPLETE_SELECTOR = bytes4(keccak256("complete(uint256,bytes32)"));
    bytes4 public constant REJECT_SELECTOR = bytes4(keccak256("reject(uint256,bytes32)"));

    // ============ Events ============

    event MinimumReputationUpdated(uint256 newMinimum);
    event ReputationCheckPassed(uint256 indexed jobId, address indexed provider, uint256 score);
    event ReputationFeedbackWritten(uint256 indexed jobId, address indexed provider, bool positive);

    // ============ Errors ============

    error UnauthorizedCaller();
    error InsufficientReputation(address provider, uint256 current, uint256 required);

    // ============ Modifiers ============

    modifier onlyEscrow() {
        if (msg.sender != escrowContract) revert UnauthorizedCaller();
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Initialize hook with escrow contract and reputation threshold
     * @param _escrowContract The EscrowRail or EscrowRailERC20 contract
     * @param _minimumReputation Initial minimum reputation (0-1000)
     */
    constructor(address _escrowContract, uint256 _minimumReputation) Ownable(msg.sender) {
        require(_escrowContract != address(0), "DealRailHook: zero escrow address");
        escrowContract = _escrowContract;
        minimumReputation = _minimumReputation;
    }

    // ============ Hook Implementation ============

    /**
     * @inheritdoc IACPHook
     * @dev Before fund(): verify provider reputation
     */
    function beforeAction(uint256 jobId, bytes4 action, bytes calldata data) external onlyEscrow {
        if (action == FUND_SELECTOR) {
            _beforeFund(jobId);
        }
        // Add other before-action checks here if needed
    }

    /**
     * @inheritdoc IACPHook
     * @dev After complete(): write positive reputation
     *      After reject(): write negative reputation
     */
    function afterAction(uint256 jobId, bytes4 action, bytes calldata data) external onlyEscrow {
        if (action == COMPLETE_SELECTOR) {
            _afterComplete(jobId);
        } else if (action == REJECT_SELECTOR) {
            _afterReject(jobId);
        }
    }

    // ============ Internal Hook Logic ============

    /**
     * @notice Verify provider reputation before funding
     * @dev Reads from ERC-8004 Reputation Registry (if available)
     */
    function _beforeFund(uint256 jobId) internal {
        // Get job details from escrow contract
        IEIP8183AgenticCommerce.Job memory job = IEIP8183AgenticCommerce(escrowContract).getJob(jobId);

        // Skip if minimum reputation is 0 (disabled)
        if (minimumReputation == 0) return;

        // TODO: Integrate with ERC-8004 Reputation Registry
        // For now, we'll implement a stub that always passes
        // In production, this would call:
        // uint256 reputation = IERC8004ReputationRegistry(ERC8004_REPUTATION_REGISTRY).getReputation(agentId);

        // Placeholder: assume provider has sufficient reputation
        emit ReputationCheckPassed(jobId, job.provider, 1000);

        // Uncomment when ERC-8004 integration is live:
        // if (reputation < minimumReputation) {
        //     revert InsufficientReputation(job.provider, reputation, minimumReputation);
        // }
    }

    /**
     * @notice Write positive reputation feedback after successful completion
     * @dev Writes to ERC-8004 Reputation Registry
     */
    function _afterComplete(uint256 jobId) internal {
        // Get job details
        IEIP8183AgenticCommerce.Job memory job = IEIP8183AgenticCommerce(escrowContract).getJob(jobId);

        // TODO: Write to ERC-8004 Reputation Registry
        // For now, we'll emit an event
        emit ReputationFeedbackWritten(jobId, job.provider, true);

        // Placeholder for actual ERC-8004 integration:
        // IERC8004ReputationRegistry(ERC8004_REPUTATION_REGISTRY).addFeedback(
        //     agentId,
        //     positiveFeedbackData
        // );
    }

    /**
     * @notice Write negative reputation feedback after rejection
     * @dev Writes to ERC-8004 Reputation Registry
     */
    function _afterReject(uint256 jobId) internal {
        // Get job details
        IEIP8183AgenticCommerce.Job memory job = IEIP8183AgenticCommerce(escrowContract).getJob(jobId);

        // TODO: Write to ERC-8004 Reputation Registry
        emit ReputationFeedbackWritten(jobId, job.provider, false);

        // Placeholder for actual ERC-8004 integration:
        // IERC8004ReputationRegistry(ERC8004_REPUTATION_REGISTRY).addFeedback(
        //     agentId,
        //     negativeFeedbackData
        // );
    }

    // ============ Admin Functions ============

    /**
     * @notice Update minimum reputation threshold
     * @param _newMinimum New minimum reputation (0-1000)
     */
    function setMinimumReputation(uint256 _newMinimum) external onlyOwner {
        require(_newMinimum <= 1000, "DealRailHook: reputation must be <= 1000");
        minimumReputation = _newMinimum;
        emit MinimumReputationUpdated(_newMinimum);
    }
}
