// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EscrowRailERC20.sol";
import "../src/DealRailHook.sol";
import "../src/identity/NullVerifier.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("MockUSDC", "mUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract RevertingHook is IACPHook {
    bool public revertBeforeFund;
    bool public revertAfterComplete;

    bytes4 internal constant FUND_SELECTOR = bytes4(keccak256("fund(uint256,uint256)"));
    bytes4 internal constant COMPLETE_SELECTOR = bytes4(keccak256("complete(uint256,bytes32)"));

    function setRevertBeforeFund(bool value) external {
        revertBeforeFund = value;
    }

    function setRevertAfterComplete(bool value) external {
        revertAfterComplete = value;
    }

    function beforeAction(uint256, bytes4 action, bytes calldata) external view override {
        if (action == FUND_SELECTOR && revertBeforeFund) revert("before-fund-revert");
    }

    function afterAction(uint256, bytes4 action, bytes calldata) external view override {
        if (action == COMPLETE_SELECTOR && revertAfterComplete) revert("after-complete-revert");
    }
}

contract EscrowRailERC20HookTest is Test {
    EscrowRailERC20 internal escrow;
    NullVerifier internal verifier;
    MockUSDC internal usdc;
    RevertingHook internal hook;

    address internal client = address(0x1111);
    address internal provider = address(0x2222);
    address internal evaluator = address(0x3333);

    uint256 internal constant BUDGET = 100_000; // 0.1 token @ 6 decimals

    function setUp() public {
        verifier = new NullVerifier();
        usdc = new MockUSDC();
        hook = new RevertingHook();

        escrow = new EscrowRailERC20(address(usdc), address(verifier));

        usdc.mint(client, 10_000_000); // 10 tokens
        vm.prank(client);
        usdc.approve(address(escrow), type(uint256).max);
    }

    function _createJob(address hookAddress) internal returns (uint256) {
        vm.prank(client);
        return escrow.createJob(provider, evaluator, block.timestamp + 1 days, hookAddress);
    }

    function test_RevertIf_FundMissingJob() public {
        vm.prank(client);
        vm.expectRevert("EscrowRailERC20: job not found");
        escrow.fund(999, BUDGET);
    }

    function test_RevertIf_ClaimRefundMissingJob() public {
        vm.warp(block.timestamp + 2 days);
        vm.expectRevert("EscrowRailERC20: job not found");
        escrow.claimRefund(999);
    }

    function test_BeforeHookCanBlockFund() public {
        uint256 jobId = _createJob(address(hook));
        hook.setRevertBeforeFund(true);

        vm.prank(client);
        vm.expectRevert("before-fund-revert");
        escrow.fund(jobId, BUDGET);
    }

    function test_AfterHookCanBlockCompleteAndPreserveState() public {
        uint256 jobId = _createJob(address(hook));

        vm.prank(client);
        escrow.fund(jobId, BUDGET);

        vm.prank(provider);
        escrow.submit(jobId, keccak256("deliverable"));

        hook.setRevertAfterComplete(true);

        vm.prank(evaluator);
        vm.expectRevert("after-complete-revert");
        escrow.complete(jobId, keccak256("reason"));

        IEIP8183AgenticCommerce.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.state), uint8(IEIP8183AgenticCommerce.State.Submitted), "state should remain Submitted");
    }

    function test_HookMustBeContract() public {
        vm.prank(client);
        vm.expectRevert("EscrowRailERC20: hook must be contract");
        escrow.createJob(provider, evaluator, block.timestamp + 1 days, address(0xBEEF));
    }
}
