// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {CoinPledge} from "../contracts/CoinPledge.sol";

contract CoinPledgeTest is Test {
  CoinPledge internal pledge;
  address internal owner = makeAddr("owner");
  address internal user = makeAddr("user");
  address internal mentor = makeAddr("mentor");

  function setUp() public {
    vm.warp(1_800_000_000);
    vm.prank(owner);
    pledge = new CoinPledge();
    vm.prank(mentor);
    pledge.setUsername("mentor");
    vm.deal(user, 100 ether);
  }

  function create(uint256 value, uint256 fee) internal returns (uint256) {
    vm.prank(user);
    return pledge.createChallenge{value: value}("Run a marathon", "mentor", 1 days, fee);
  }

  function resolve(uint256 id, bool success) internal {
    vm.prank(mentor);
    pledge.resolveChallenge(id, success);
  }

  function test_DeploymentAndRegistration() public view {
    assertEq(pledge.owner(), owner);
    assertFalse(pledge.isGameOver());
    (address addr, string memory name) = pledge.users(mentor);
    assertEq(addr, mentor);
    assertEq(name, "mentor");
    assertEq(pledge.getUsersCount(), 1);
    assertEq(pledge.allUsers(0), mentor);
  }

  function test_ChallengeTupleAndIndexes() public {
    uint256 id = create(1 ether, 0.1 ether);
    assertEq(id, 0);
    (
      address challenger,
      string memory name,
      uint256 value,
      address judge,
      uint256 startDate,
      uint256 time,
      uint256 fee,
      bool successed,
      bool resolved
    ) = pledge.challenges(id);
    assertEq(challenger, user);
    assertEq(name, "Run a marathon");
    assertEq(value, 1 ether);
    assertEq(judge, mentor);
    assertEq(startDate, block.timestamp);
    assertEq(time, 1 days);
    assertEq(fee, 0.1 ether);
    assertFalse(successed);
    assertFalse(resolved);
    assertEq(pledge.challengeToUser(id), user);
    assertEq(pledge.challengeToMentor(id), mentor);
    assertEq(pledge.userToChallengeCount(user), 1);
    assertEq(pledge.mentorToChallengeCount(mentor), 1);
    assertEq(pledge.getChallengesForUser(user)[0], id);
    assertEq(pledge.getChallengesForMentor(mentor)[0], id);
  }

  function test_SuccessPaysStakeAndFees() public {
    uint256 id = create(1 ether, 0.1 ether);
    resolve(id, true);
    assertEq(user.balance, 99.9 ether);
    assertEq(mentor.balance, 0.09 ether);
    assertEq(owner.balance, 0.01 ether);
    assertEq(address(pledge).balance, 0);
  }

  function test_FailureAccumulatesBonusAndSuccessReleasesHalf() public {
    resolve(create(1 ether, 0), false);
    assertEq(pledge.getBonusFund(user), 1 ether);
    resolve(create(0.01 ether, 0), true);
    assertEq(pledge.getBonusFund(user), 0.5 ether);
    assertEq(user.balance, 99.5 ether);
  }

  function test_SmallBonusIsReleasedCompletely() public {
    resolve(create(0.01 ether, 0.009 ether), false);
    assertEq(pledge.getBonusFund(user), 0.001 ether);
    resolve(create(0.01 ether, 0), true);
    assertEq(pledge.getBonusFund(user), 0);
  }

  function test_UserMayResolveAtSevenDayBoundary() public {
    uint256 id = create(1 ether, 0);
    vm.warp(block.timestamp + 8 days);
    vm.prank(user);
    pledge.resolveChallenge(id, true);
    (,,,,,,, bool successed, bool resolved) = pledge.challenges(id);
    assertTrue(successed);
    assertTrue(resolved);
  }

  function test_ShutdownReleasesBonus() public {
    resolve(create(1 ether, 0), false);
    vm.prank(owner);
    pledge.gameOver();
    vm.prank(user);
    pledge.withdraw();
    assertEq(user.balance, 100 ether);
    assertEq(pledge.bonusFund(user), 0);
  }
}
