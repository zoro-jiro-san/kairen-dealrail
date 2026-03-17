// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IACPHook.sol";
import "./interfaces/IEIP8183AgenticCommerce.sol";
import "./interfaces/IERC8004Registries.sol";
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
    event ProviderUnregistered(uint256 indexed jobId, address indexed provider);
    event ReputationLookupFailed(uint256 indexed jobId, address indexed provider, uint256 agentId);
    event ReputationWriteResult(
        uint256 indexed jobId, address indexed provider, uint256 agentId, bool positive, bool success
    );

    // ============ Errors ============

    error UnauthorizedCaller();
    error InsufficientReputation(address provider, uint256 current, uint256 required);
    error ReputationLookupUnavailable(address provider, uint256 agentId);
    error ProviderNotRegistered(address provider);
    error FeedbackWriteFailed(uint256 agentId, bool positive);

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
        data;
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
        data;
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

        uint256 agentId = _resolveAgentId(job.provider);
        if (agentId == 0) {
            emit ProviderUnregistered(jobId, job.provider);
            revert ProviderNotRegistered(job.provider);
        }

        (bool ok, uint256 reputation) = _resolveReputation(agentId);
        if (!ok) {
            emit ReputationLookupFailed(jobId, job.provider, agentId);
            revert ReputationLookupUnavailable(job.provider, agentId);
        }

        if (reputation < minimumReputation) {
            revert InsufficientReputation(job.provider, reputation, minimumReputation);
        }

        emit ReputationCheckPassed(jobId, job.provider, reputation);
    }

    /**
     * @notice Write positive reputation feedback after successful completion
     * @dev Writes to ERC-8004 Reputation Registry
     */
    function _afterComplete(uint256 jobId) internal {
        // Get job details
        IEIP8183AgenticCommerce.Job memory job = IEIP8183AgenticCommerce(escrowContract).getJob(jobId);
        emit ReputationFeedbackWritten(jobId, job.provider, true);
        _writeFeedback(jobId, job.provider, true);
    }

    /**
     * @notice Write negative reputation feedback after rejection
     * @dev Writes to ERC-8004 Reputation Registry
     */
    function _afterReject(uint256 jobId) internal {
        // Get job details
        IEIP8183AgenticCommerce.Job memory job = IEIP8183AgenticCommerce(escrowContract).getJob(jobId);
        emit ReputationFeedbackWritten(jobId, job.provider, false);
        _writeFeedback(jobId, job.provider, false);
    }

    function _writeFeedback(uint256 jobId, address provider, bool positive) internal {
        uint256 agentId = _resolveAgentId(provider);
        if (agentId == 0) {
            emit ProviderUnregistered(jobId, provider);
            emit ReputationWriteResult(jobId, provider, 0, positive, false);
            revert ProviderNotRegistered(provider);
        }

        int128 score = positive ? int128(10) : int128(-10);
        string memory signalName = positive ? "dealrail_complete" : "dealrail_reject";

        bool success = _submitFeedback(agentId, score, signalName, "");
        emit ReputationWriteResult(jobId, provider, agentId, positive, success);
        if (!success) {
            revert FeedbackWriteFailed(agentId, positive);
        }
    }

    function _resolveAgentId(address provider) internal view returns (uint256 agentId) {
        // Preferred interface
        try IERC8004IdentityRegistry(ERC8004_IDENTITY_REGISTRY).agentIdOf(provider) returns (uint256 id) {
            if (id > 0) return id;
        } catch {}

        // Legacy compatibility
        try IERC8004IdentityRegistryLegacy(ERC8004_IDENTITY_REGISTRY).getTokenId(provider) returns (uint256 tokenId) {
            return tokenId;
        } catch {}

        return 0;
    }

    function _resolveReputation(uint256 agentId) internal view returns (bool ok, uint256 reputation) {
        try IERC8004ReputationRegistry(ERC8004_REPUTATION_REGISTRY).getReputation(agentId) returns (uint256 rep) {
            return (true, rep);
        } catch {}

        // Legacy compatibility: signed aggregate score
        try IERC8004ReputationRegistryLegacy(ERC8004_REPUTATION_REGISTRY).getAggregateScore(agentId) returns (
            int128 score
        ) {
            if (score < 0) return (true, 0);
            return (true, uint256(uint128(score)));
        } catch {}

        return (false, 0);
    }

    function _submitFeedback(uint256 agentId, int128 score, string memory signalName, string memory evidenceUri)
        internal
        returns (bool)
    {
        try IERC8004ReputationRegistry(ERC8004_REPUTATION_REGISTRY).submitFeedback(
            agentId, score, signalName, evidenceUri
        ) {
            return true;
        } catch {
            return false;
        }
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
