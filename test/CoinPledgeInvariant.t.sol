// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {CoinPledge} from "../contracts/CoinPledge.sol";

contract CoinPledgeHandler is Test {
  CoinPledge public immutable pledge;
  address public immutable owner;
  address public immutable mentor;
  address public immutable user;
  uint256 public created;
  uint256 public deposited;
  uint256 public withdrawn;

  constructor(CoinPledge target, address initialOwner) {
    pledge = target;
    owner = initialOwner;
    mentor = makeAddr("invariant mentor");
    user = makeAddr("invariant user");
    vm.prank(mentor);
    pledge.setUsername("mentor");
  }

  function create(uint96 rawValue, uint96 rawFee) external {
    if (pledge.isGameOver()) return;
    uint256 value = bound(rawValue, 0.01 ether, 100 ether);
    uint256 fee = bound(rawFee, 0, value);
    vm.deal(user, value);
    vm.prank(user);
    pledge.createChallenge{value: value}("goal", "mentor", 1 days, fee);
    ++created;
    deposited += value;
  }

  function resolve(uint256 seed, bool decision, bool selfResolve) external {
    if (created == 0) return;
    uint256 id = seed % created;
    (,,,,,,,, bool resolved) = pledge.challenges(id);
    if (resolved) return;
    if (selfResolve) vm.warp(block.timestamp + 8 days);
    vm.prank(selfResolve ? user : mentor);
    pledge.resolveChallenge(id, decision);
  }

  function donate(uint96 rawValue) external {
    if (pledge.isGameOver()) return;
    uint256 value = bound(rawValue, 0, 100 ether);
    vm.deal(user, value);
    vm.prank(user);
    pledge.donate{value: value}("donor", "");
    deposited += value;
  }

  function withdraw(uint256 seed) external {
    address actor = seed % 3 == 0 ? owner : seed % 3 == 1 ? user : mentor;
    uint256 value = pledge.withdrawableBalance(actor);
    if (value == 0) return;
    vm.prank(actor);
    pledge.withdraw();
    withdrawn += value;
  }

  function shutdown(uint256 seed) external {
    if (pledge.isGameOver() || seed % 13 != 0) return;
    vm.prank(owner);
    pledge.gameOver();
  }
}

contract CoinPledgeInvariantTest is Test {
  CoinPledge private pledge;
  CoinPledgeHandler private handler;

  function setUp() public {
    address owner = makeAddr("invariant owner");
    vm.prank(owner);
    pledge = new CoinPledge();
    handler = new CoinPledgeHandler(pledge, owner);
    bytes4[] memory selectors = new bytes4[](5);
    selectors[0] = handler.create.selector;
    selectors[1] = handler.resolve.selector;
    selectors[2] = handler.donate.selector;
    selectors[3] = handler.withdraw.selector;
    selectors[4] = handler.shutdown.selector;
    targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    targetContract(address(handler));
  }

  function invariant_AllDepositsAreHeldOrWithdrawn() public view {
    assertEq(address(pledge).balance + handler.withdrawn(), handler.deposited());
  }

  function invariant_BalanceExactlyCoversActiveStakesBonusesAndPayments() public view {
    uint256 liabilities;
    for (uint256 i; i < handler.created(); ++i) {
      (,, uint256 value,,,,,, bool resolved) = pledge.challenges(i);
      if (!resolved) liabilities += value;
    }
    liabilities += pledge.bonusFund(handler.user()) + pledge.pendingWithdrawals(handler.user())
    + pledge.pendingWithdrawals(handler.mentor()) + pledge.pendingWithdrawals(handler.owner());
    assertEq(address(pledge).balance, liabilities);
  }

  function invariant_ChallengeIndexesStayConsistent() public view {
    assertEq(pledge.userToChallengeCount(handler.user()), handler.created());
    assertEq(pledge.mentorToChallengeCount(handler.mentor()), handler.created());
  }
}
