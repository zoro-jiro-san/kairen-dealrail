// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IEIP8183AgenticCommerce.sol";
import "./interfaces/IACPHook.sol";
import "./interfaces/IIdentityVerifier.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EscrowRailERC20
 * @notice EIP-8183 compliant agentic commerce escrow for ERC-20 tokens
 * @dev Variant of EscrowRail that uses ERC-20 tokens (USDC, cUSD) instead of native ETH
 *
 * Key Features:
 *   - EIP-8183 state machine (Open → Funded → Submitted → Completed)
 *   - Pluggable identity verification (ERC-8004, SignetID, or none)
 *   - ReentrancyGuard for all fund-moving functions
 *   - Deadline enforcement with permissionless refund
 *   - Optional hook system for extensibility
 *   - SafeERC20 for secure token handling
 *
 * Use Cases:
 *   - USDC escrow on Base
 *   - cUSD escrow on Celo
 *   - Any ERC-20 settlement token
 *
 * Security Model:
 *   - CEI (Checks-Effects-Interactions) pattern
 *   - ReentrancyGuard on fund(), complete(), reject(), claimRefund()
 *   - Explicit state checks before all transitions
 *   - SafeERC20 prevents reentrancy via token callbacks
 */
contract EscrowRailERC20 is IEIP8183AgenticCommerce, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    /// @notice The ERC-20 token used for settlements (e.g., USDC, cUSD)
    IERC20 public immutable settlementToken;

    /// @notice Mapping from job ID to Job struct
    mapping(uint256 => Job) private _jobs;

    /// @notice Next job ID (auto-incrementing)
    uint256 public nextJobId;

    /// @notice Optional identity verifier contract
    IIdentityVerifier public identityVerifier;

    /// @notice Minimum reputation score required for providers (0 = disabled)
    uint256 public minimumReputation;

    // ============ Events ============

    event IdentityVerifierUpdated(address indexed newVerifier);
    event MinimumReputationUpdated(uint256 newMinimum);
    event SettlementTokenSet(address indexed token);

    // ============ Constructor ============

    /**
     * @notice Initialize with settlement token and optional identity verifier
     * @param _settlementToken ERC-20 token address (e.g., USDC, cUSD)
     * @param _identityVerifier Address of identity verifier (address(0) for none)
     */
    constructor(address _settlementToken, address _identityVerifier) Ownable(msg.sender) {
        require(_settlementToken != address(0), "EscrowRailERC20: zero token address");
        settlementToken = IERC20(_settlementToken);
        identityVerifier = IIdentityVerifier(_identityVerifier);
        nextJobId = 1; // Start job IDs at 1

        emit SettlementTokenSet(_settlementToken);
    }

    // ============ Core EIP-8183 Functions ============

    /**
     * @inheritdoc IEIP8183AgenticCommerce
     */
    function createJob(
        address provider,
        address evaluator,
        uint256 expiry,
        address hook
    ) external returns (uint256 jobId) {
        require(provider != address(0), "EscrowRailERC20: zero provider");
        require(evaluator != address(0), "EscrowRailERC20: zero evaluator");
        require(expiry > block.timestamp, "EscrowRailERC20: expiry must be in future");
        if (hook != address(0)) {
            require(hook.code.length > 0, "EscrowRailERC20: hook must be contract");
        }

        // Optional: Verify provider identity
        if (address(identityVerifier) != address(0)) {
            IIdentityVerifier.VerificationResult memory result = identityVerifier.verify(provider);

            require(!result.isSuspended, "EscrowRailERC20: provider is suspended");

            // Optional: Enforce minimum reputation
            if (minimumReputation > 0) {
                require(
                    result.reputationScore >= minimumReputation,
                    "EscrowRailERC20: insufficient reputation"
                );
            }
        }

        jobId = nextJobId++;

        _jobs[jobId] = Job({
            client: msg.sender,
            provider: provider,
            evaluator: evaluator,
            budget: 0,
            expiry: expiry,
            state: State.Open,
            deliverable: bytes32(0),
            hook: hook
        });

        emit JobCreated(jobId, msg.sender, provider, evaluator, expiry, hook);
    }

    /**
     * @notice Fund an existing job with ERC-20 tokens
     * @dev Transfers tokens from client to this contract
     * @param jobId The job identifier
     * @param expectedBudget The amount being escrowed
     */
    function fund(uint256 jobId, uint256 expectedBudget) external payable nonReentrant {
        Job storage job = _jobs[jobId];

        require(job.client != address(0), "EscrowRailERC20: job not found");
        require(job.state == State.Open, "EscrowRailERC20: job not open");
        require(msg.sender == job.client, "EscrowRailERC20: only client can fund");
        require(expectedBudget > 0, "EscrowRailERC20: budget must be > 0");
        require(msg.value == 0, "EscrowRailERC20: ETH not accepted");

        _callBeforeAction(jobId, bytes4(keccak256("fund(uint256,uint256)")), abi.encode(expectedBudget), job.hook);

        // Transfer tokens from client to this contract
        settlementToken.safeTransferFrom(msg.sender, address(this), expectedBudget);

        job.budget = expectedBudget;
        job.state = State.Funded;

        _callAfterAction(jobId, bytes4(keccak256("fund(uint256,uint256)")), abi.encode(expectedBudget), job.hook);
        emit JobFunded(jobId, expectedBudget);
    }

    /**
     * @inheritdoc IEIP8183AgenticCommerce
     */
    function submit(uint256 jobId, bytes32 deliverable) external {
        Job storage job = _jobs[jobId];

        require(job.client != address(0), "EscrowRailERC20: job not found");
        require(job.state == State.Funded, "EscrowRailERC20: job not funded");
        require(msg.sender == job.provider, "EscrowRailERC20: only provider can submit");
        require(deliverable != bytes32(0), "EscrowRailERC20: empty deliverable");

        _callBeforeAction(jobId, bytes4(keccak256("submit(uint256,bytes32)")), abi.encode(deliverable), job.hook);

        job.deliverable = deliverable;
        job.state = State.Submitted;

        _callAfterAction(jobId, bytes4(keccak256("submit(uint256,bytes32)")), abi.encode(deliverable), job.hook);
        emit JobSubmitted(jobId, deliverable);
    }

    /**
     * @inheritdoc IEIP8183AgenticCommerce
     */
    function complete(uint256 jobId, bytes32 reason) external nonReentrant {
        Job storage job = _jobs[jobId];

        require(job.client != address(0), "EscrowRailERC20: job not found");
        require(job.state == State.Submitted, "EscrowRailERC20: job not submitted");
        require(msg.sender == job.evaluator, "EscrowRailERC20: only evaluator can complete");

        _callBeforeAction(jobId, bytes4(keccak256("complete(uint256,bytes32)")), abi.encode(reason), job.hook);

        job.state = State.Completed;

        // Release payment to provider
        settlementToken.safeTransfer(job.provider, job.budget);

        _callAfterAction(jobId, bytes4(keccak256("complete(uint256,bytes32)")), abi.encode(reason), job.hook);
        emit JobCompleted(jobId, reason);
    }

    /**
     * @inheritdoc IEIP8183AgenticCommerce
     */
    function reject(uint256 jobId, bytes32 reason) external nonReentrant {
        Job storage job = _jobs[jobId];
        require(job.client != address(0), "EscrowRailERC20: job not found");

        // Determine who can reject based on state
        if (job.state == State.Open) {
            require(msg.sender == job.client, "EscrowRailERC20: only client can reject open job");
        } else if (job.state == State.Funded || job.state == State.Submitted) {
            require(msg.sender == job.evaluator, "EscrowRailERC20: only evaluator can reject");
        } else {
            revert("EscrowRailERC20: cannot reject in this state");
        }

        _callBeforeAction(jobId, bytes4(keccak256("reject(uint256,bytes32)")), abi.encode(reason), job.hook);

        job.state = State.Rejected;

        // Refund to client if funded
        if (job.budget > 0) {
            settlementToken.safeTransfer(job.client, job.budget);
        }

        _callAfterAction(jobId, bytes4(keccak256("reject(uint256,bytes32)")), abi.encode(reason), job.hook);
        emit JobRejected(jobId, reason);
    }

    /**
     * @inheritdoc IEIP8183AgenticCommerce
     */
    function claimRefund(uint256 jobId) external nonReentrant {
        Job storage job = _jobs[jobId];

        require(job.client != address(0), "EscrowRailERC20: job not found");
        require(block.timestamp > job.expiry, "EscrowRailERC20: not expired yet");
        require(
            job.state == State.Open || job.state == State.Funded || job.state == State.Submitted,
            "EscrowRailERC20: invalid state for refund"
        );

        _callBeforeAction(jobId, bytes4(keccak256("claimRefund(uint256)")), bytes(""), job.hook);

        job.state = State.Expired;

        // Refund to client if funded
        if (job.budget > 0) {
            settlementToken.safeTransfer(job.client, job.budget);
        }

        _callAfterAction(jobId, bytes4(keccak256("claimRefund(uint256)")), bytes(""), job.hook);
        emit JobExpired(jobId);
    }

    function _callBeforeAction(uint256 jobId, bytes4 action, bytes memory data, address hook) internal {
        if (hook == address(0)) return;
        IACPHook(hook).beforeAction(jobId, action, data);
    }

    function _callAfterAction(uint256 jobId, bytes4 action, bytes memory data, address hook) internal {
        if (hook == address(0)) return;
        IACPHook(hook).afterAction(jobId, action, data);
    }

    // ============ View Functions ============

    /**
     * @inheritdoc IEIP8183AgenticCommerce
     */
    function getJob(uint256 jobId) external view returns (Job memory) {
        return _jobs[jobId];
    }

    /**
     * @inheritdoc IEIP8183AgenticCommerce
     */
    function getState(uint256 jobId) external view returns (State) {
        return _jobs[jobId].state;
    }

    // ============ Admin Functions ============

    /**
     * @notice Set a new identity verifier contract
     * @param _newVerifier Address of new verifier (address(0) to disable)
     */
    function setIdentityVerifier(address _newVerifier) external onlyOwner {
        identityVerifier = IIdentityVerifier(_newVerifier);
        emit IdentityVerifierUpdated(_newVerifier);
    }

    /**
     * @notice Set minimum reputation score for providers
     * @param _minimumReputation Minimum score (0 to disable check)
     */
    function setMinimumReputation(uint256 _minimumReputation) external onlyOwner {
        minimumReputation = _minimumReputation;
        emit MinimumReputationUpdated(_minimumReputation);
    }
}
