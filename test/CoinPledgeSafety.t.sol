// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {CoinPledge} from "../contracts/CoinPledge.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CoinPledgeFixture} from "./helpers/CoinPledgeFixture.sol";

contract RejectingWallet {
  receive() external payable {
    revert("reject ether");
  }
}

contract ReenteringWallet {
  CoinPledge private immutable pledge;
  uint256 public received;
  bool public reentered;

  constructor(CoinPledge target) {
    pledge = target;
  }

  receive() external payable {
    received += msg.value; // Requires more gas than transfer's historical stipend.
    (bool success,) = address(pledge).call(abi.encodeCall(pledge.withdraw, ()));
    reentered = success;
  }
}

contract CoinPledgeSafetyTest is CoinPledgeFixture {
  function test_UsernameValidation() public {
    vm.startPrank(user);
    vm.expectRevert(CoinPledge.InvalidUsernameLength.selector);
    pledge.setUsername("ab");
    vm.expectRevert(CoinPledge.InvalidUsernameLength.selector);
    pledge.setUsername("123456789012345678901234567890123");
    vm.expectRevert(CoinPledge.UsernameTaken.selector);
    pledge.setUsername("mentor");
    pledge.setUsername("12345678901234567890123456789012");
    vm.expectRevert(CoinPledge.UserAlreadyRegistered.selector);
    pledge.setUsername("other");
    vm.stopPrank();
  }

  function test_UsernameEventAndThreeByteMinimum() public {
    vm.expectEmit(true, false, false, true, address(pledge));
    emit CoinPledge.NewUsername(user, "abc");
    vm.prank(user);
    pledge.setUsername("abc");
  }

  function test_ChallengeInputValidation() public {
    vm.startPrank(user);
    vm.expectRevert(CoinPledge.StakeTooSmall.selector);
    pledge.createChallenge{value: 0.01 ether - 1}("goal", "mentor", 1, 0);
    vm.expectRevert(CoinPledge.RewardExceedsStake.selector);
    pledge.createChallenge{value: 0.01 ether}("goal", "mentor", 1, 0.01 ether + 1);
    vm.expectRevert(CoinPledge.UnknownMentor.selector);
    pledge.createChallenge{value: 0.01 ether}("goal", "", 1, 0);
    vm.expectRevert(CoinPledge.UnknownMentor.selector);
    pledge.createChallenge{value: 0.01 ether}("goal", "unknown", 1, 0);
    vm.expectRevert(CoinPledge.InvalidDuration.selector);
    pledge.createChallenge{value: 0.01 ether}("goal", "mentor", 0, 0);
    vm.expectRevert(CoinPledge.InvalidDuration.selector);
    pledge.createChallenge{value: 0.01 ether}("goal", "mentor", type(uint256).max, 0);
    vm.stopPrank();
    vm.deal(mentor, 1 ether);
    vm.prank(mentor);
    vm.expectRevert(CoinPledge.SelfMentoring.selector);
    pledge.createChallenge{value: 0.01 ether}("goal", "mentor", 1, 0);
  }

  function test_MaximumValidDurationDoesNotOverflowOnResolution() public {
    vm.prank(user);
    uint256 id = pledge.createChallenge{value: 0.01 ether}(
      "goal", "mentor", type(uint256).max - block.timestamp - 7 days, 0
    );
    resolve(id, true);
  }

  function test_CreationEventRetainsBrowserABI() public {
    vm.expectEmit(true, true, true, true, address(pledge));
    emit CoinPledge.NewChallenge(
      0, user, "Run a marathon", 1 ether, mentor, block.timestamp, 1 days, 0.1 ether
    );
    create(1 ether, 0.1 ether);
  }

  function test_IndexesOnlyContainRelevantChallenges() public {
    address other = makeAddr("other");
    vm.prank(other);
    pledge.setUsername("other");
    create(1 ether, 0);
    vm.deal(other, 1 ether);
    vm.prank(other);
    pledge.createChallenge{value: 1 ether}("goal", "mentor", 1, 0);
    vm.prank(user);
    pledge.createChallenge{value: 1 ether}("goal", "other", 1, 0);
    uint256[] memory ids = pledge.getChallengesForUser(user);
    assertEq(ids.length, 2);
    assertEq(ids[0], 0);
    assertEq(ids[1], 2);
    ids = pledge.getChallengesForMentor(mentor);
    assertEq(ids.length, 2);
    assertEq(ids[1], 1);
    assertEq(pledge.getChallengesForUser(owner).length, 0);
    assertEq(pledge.getChallengesForMentor(owner).length, 0);
    assertEq(pledge.challengeToUser(999), address(0));
    assertEq(pledge.challengeToMentor(999), address(0));
  }

  function test_ResolutionAuthorizationAndExactDeadline() public {
    uint256 id = create(1 ether, 0);
    vm.prank(user);
    vm.expectRevert(CoinPledge.UnauthorizedResolver.selector);
    pledge.resolveChallenge(id, true);
    vm.warp(block.timestamp + 8 days - 1);
    vm.prank(user);
    vm.expectRevert(CoinPledge.UnauthorizedResolver.selector);
    pledge.resolveChallenge(id, true);
    vm.warp(block.timestamp + 1);
    vm.prank(owner);
    vm.expectRevert(CoinPledge.UnauthorizedResolver.selector);
    pledge.resolveChallenge(id, true);
    vm.prank(user);
    pledge.resolveChallenge(id, true);
    vm.expectRevert(CoinPledge.ChallengeAlreadyResolved.selector);
    pledge.resolveChallenge(id, false);
    vm.expectRevert(CoinPledge.UnknownChallenge.selector);
    pledge.resolveChallenge(999, true);
  }

  function test_MentorMayStillResolveAfterGracePeriod() public {
    uint256 id = create(1 ether, 0);
    vm.warp(block.timestamp + 9 days);
    resolve(id, false);
    assertEq(pledge.bonusFund(user), 1 ether);
  }

  function test_ResolutionAndBonusEvents() public {
    uint256 id = create(1 ether, 0);
    vm.expectEmit(true, false, false, true, address(pledge));
    emit CoinPledge.BonusFundChanged(user, 1 ether);
    vm.expectEmit(true, true, true, true, address(pledge));
    emit CoinPledge.ChallengeResolved(id, user, mentor, false);
    resolve(id, false);
  }

  function test_RewardRemainderIsPaidToMentor() public {
    resolve(create(0.01 ether, 99), true);
    assertEq(pledge.pendingWithdrawals(mentor), 90);
    assertEq(pledge.pendingWithdrawals(owner), 9);
    assertEq(pledge.pendingWithdrawals(user), 0.01 ether - 99);
  }

  function test_BonusRoundingRetainsOddWei() public {
    uint256 bonus = 0.001 ether + 101;
    resolve(create(0.01 ether, 0.01 ether - bonus), false);
    resolve(create(0.01 ether, 0), true);
    assertEq(pledge.bonusFund(user), (bonus + 1) / 2);
    assertEq(pledge.pendingWithdrawals(user), 0.01 ether + bonus / 2);
  }

  function test_RepeatedSuccessEventuallyReleasesAllBonus() public {
    resolve(create(1 ether, 0), false);
    for (uint256 i; i < 11; ++i) {
      resolve(create(0.01 ether, 0), true);
    }
    assertEq(pledge.bonusFund(user), 0);
    assertEq(pledge.pendingWithdrawals(user), 1.11 ether);
  }

  function test_WholeStakeMayBeReward() public {
    resolve(create(0.01 ether, 0.01 ether), true);
    assertEq(pledge.pendingWithdrawals(user), 0);
    assertEq(pledge.pendingWithdrawals(mentor), 0.009 ether);
    assertEq(pledge.pendingWithdrawals(owner), 0.001 ether);
  }

  function test_WithdrawPaysExactlyOnceAndEmitsEvent() public {
    resolve(create(1 ether, 0.1 ether), true);
    vm.expectEmit(true, true, false, true, address(pledge));
    emit CoinPledge.PaymentWithdrawn(user, user, 0.9 ether);
    vm.startPrank(user);
    pledge.withdraw();
    assertEq(user.balance, 99.9 ether);
    assertEq(pledge.pendingWithdrawals(user), 0);
    vm.expectRevert(CoinPledge.NothingToWithdraw.selector);
    pledge.withdraw();
    vm.stopPrank();
    vm.prank(mentor);
    pledge.withdraw();
    vm.prank(owner);
    pledge.withdraw();
    assertEq(address(pledge).balance, 0);
  }

  function test_BonusStaysLockedDuringGame() public {
    resolve(create(1 ether, 0), false);
    vm.prank(user);
    vm.expectRevert(CoinPledge.NothingToWithdraw.selector);
    pledge.withdraw();
    resolve(create(0.01 ether, 0), true);
    vm.prank(user);
    pledge.withdraw();
    assertEq(pledge.bonusFund(user), 0.5 ether);
    assertEq(address(pledge).balance, 0.5 ether);
  }

  function test_RejectingMentorCannotBlockSettlementOrOtherWithdrawals() public {
    RejectingWallet wallet = new RejectingWallet();
    vm.prank(address(wallet));
    pledge.setUsername("rejecting");
    vm.prank(user);
    uint256 id = pledge.createChallenge{value: 1 ether}("goal", "rejecting", 1, 0.1 ether);
    vm.prank(address(wallet));
    pledge.resolveChallenge(id, true);
    vm.prank(address(wallet));
    vm.expectRevert(CoinPledge.EtherTransferFailed.selector);
    pledge.withdraw();
    assertEq(pledge.pendingWithdrawals(address(wallet)), 0.09 ether);
    vm.prank(user);
    pledge.withdraw();
    vm.prank(address(wallet));
    pledge.withdrawTo(payable(mentor));
    assertEq(mentor.balance, 0.09 ether);
    assertEq(pledge.pendingWithdrawals(address(wallet)), 0);
  }

  function test_RejectingChallengerDoesNotBlockFees() public {
    RejectingWallet wallet = new RejectingWallet();
    vm.deal(address(wallet), 1 ether);
    vm.prank(address(wallet));
    uint256 id = pledge.createChallenge{value: 1 ether}("goal", "mentor", 1, 0.1 ether);
    resolve(id, true);
    assertEq(pledge.pendingWithdrawals(address(wallet)), 0.9 ether);
    vm.prank(mentor);
    pledge.withdraw();
    assertEq(mentor.balance, 0.09 ether);
  }

  function test_WithdrawCannotBeReenteredAndSupportsSmartWallets() public {
    ReenteringWallet wallet = new ReenteringWallet(pledge);
    vm.deal(address(wallet), 1 ether);
    vm.prank(address(wallet));
    uint256 id = pledge.createChallenge{value: 1 ether}("goal", "mentor", 1, 0);
    resolve(id, true);
    vm.prank(address(wallet));
    pledge.withdraw();
    assertEq(wallet.received(), 1 ether);
    assertFalse(wallet.reentered());
    assertEq(pledge.pendingWithdrawals(address(wallet)), 0);
  }

  function test_WithdrawToRejectsInvalidRecipientsAndCannotStealOthersFunds() public {
    resolve(create(1 ether, 0), true);
    vm.prank(owner);
    vm.expectRevert(CoinPledge.NothingToWithdraw.selector);
    pledge.withdrawTo(payable(owner));
    vm.startPrank(user);
    vm.expectRevert(CoinPledge.InvalidRecipient.selector);
    pledge.withdrawTo(payable(address(0)));
    vm.expectRevert(CoinPledge.InvalidRecipient.selector);
    pledge.withdrawTo(payable(address(pledge)));
    vm.stopPrank();
    assertEq(pledge.pendingWithdrawals(user), 1 ether);
  }

  function test_ShutdownStopsNewActivityButPreservesResolution() public {
    uint256 id = create(1 ether, 0);
    vm.prank(owner);
    vm.expectEmit(false, false, false, true, address(pledge));
    emit CoinPledge.GameEnded();
    pledge.gameOver();
    vm.startPrank(user);
    vm.expectRevert(CoinPledge.GameHasEnded.selector);
    pledge.createChallenge{value: 1 ether}("goal", "mentor", 1, 0);
    vm.expectRevert(CoinPledge.GameHasEnded.selector);
    pledge.setUsername("user");
    vm.expectRevert(CoinPledge.GameHasEnded.selector);
    pledge.donate{value: 1}("user", "");
    vm.expectRevert(CoinPledge.UnauthorizedResolver.selector);
    pledge.resolveChallenge(id, true);
    vm.warp(block.timestamp + 8 days);
    pledge.resolveChallenge(id, false);
    assertEq(pledge.withdrawableBalance(user), 1 ether);
    pledge.withdraw();
    vm.stopPrank();
    assertEq(user.balance, 100 ether);
  }

  function test_ShutdownWithdrawalCombinesPendingAndBonus() public {
    resolve(create(1 ether, 0), false);
    resolve(create(0.01 ether, 0), true);
    vm.prank(owner);
    pledge.gameOver();
    assertEq(pledge.withdrawableBalance(user), 1.01 ether);
    vm.prank(user);
    pledge.withdraw();
    assertEq(pledge.bonusFund(user), 0);
    assertEq(pledge.pendingWithdrawals(user), 0);
    assertEq(user.balance, 100 ether);
  }

  function test_RejectedShutdownWithdrawalRestoresBothBalances() public {
    resolve(create(1 ether, 0), false);
    resolve(create(0.01 ether, 0), true);
    vm.prank(owner);
    pledge.gameOver();
    RejectingWallet wallet = new RejectingWallet();
    vm.prank(user);
    vm.expectRevert(CoinPledge.EtherTransferFailed.selector);
    pledge.withdrawTo(payable(address(wallet)));
    assertEq(pledge.bonusFund(user), 0.5 ether);
    assertEq(pledge.pendingWithdrawals(user), 0.51 ether);
  }

  function test_OnlyOwnerCanEndGameAndShutdownIsPermanent() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user));
    pledge.gameOver();
    vm.startPrank(owner);
    pledge.gameOver();
    vm.expectRevert(CoinPledge.GameHasEnded.selector);
    pledge.gameOver();
    vm.stopPrank();
  }

  function test_OwnershipRequiresAcceptanceAndCannotBeRenounced() public {
    vm.prank(owner);
    pledge.transferOwnership(user);
    assertEq(pledge.owner(), owner);
    assertEq(pledge.pendingOwner(), user);
    vm.prank(mentor);
    vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, mentor));
    pledge.acceptOwnership();
    vm.prank(user);
    pledge.acceptOwnership();
    assertEq(pledge.owner(), user);
    vm.prank(user);
    vm.expectRevert(CoinPledge.OwnershipRenunciationDisabled.selector);
    pledge.renounceOwnership();
  }

  function test_RejectingOwnerCanReceiveFeesAndDonationsAfterOwnershipTransfer() public {
    RejectingWallet wallet = new RejectingWallet();
    vm.prank(owner);
    pledge.donate{value: 0}("zero", "");
    vm.prank(user);
    pledge.donate{value: 1 ether}("before", "");
    vm.prank(owner);
    pledge.transferOwnership(address(wallet));
    vm.prank(address(wallet));
    pledge.acceptOwnership();
    vm.prank(user);
    pledge.donate{value: 1 ether}("after", "");
    resolve(create(1 ether, 0.1 ether), true);
    assertEq(pledge.pendingWithdrawals(owner), 1 ether);
    assertEq(pledge.pendingWithdrawals(address(wallet)), 1.01 ether);
  }

  function test_DonationEvent() public {
    vm.expectEmit(false, false, false, true, address(pledge));
    emit CoinPledge.Donation("user", "https://example.com", 1 ether, block.timestamp);
    vm.prank(user);
    pledge.donate{value: 1 ether}("user", "https://example.com");
    assertEq(pledge.pendingWithdrawals(owner), 1 ether);
  }

  function testFuzz_SettlementAccountsForEveryWei(uint96 rawStake, uint96 rawFee, bool decision)
    public
  {
    uint256 stake = bound(rawStake, 0.01 ether, 100 ether);
    uint256 fee = bound(rawFee, 0, stake);
    resolve(create(stake, fee), decision);
    assertEq(pledge.pendingWithdrawals(owner), fee / 10);
    assertEq(pledge.pendingWithdrawals(mentor), fee - fee / 10);
    assertEq(pledge.pendingWithdrawals(user), decision ? stake - fee : 0);
    assertEq(pledge.bonusFund(user), decision ? 0 : stake - fee);
    assertEq(
      pledge.pendingWithdrawals(owner) + pledge.pendingWithdrawals(mentor)
        + pledge.pendingWithdrawals(user) + pledge.bonusFund(user),
      stake
    );
  }
}
