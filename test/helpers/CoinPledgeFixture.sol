// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {CoinPledge} from "../../contracts/CoinPledge.sol";

abstract contract CoinPledgeFixture is Test {
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
}
