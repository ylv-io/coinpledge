// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";

/// @title CoinPledge
/// @author Igor Yalovoy
/// @notice Stake ether on a goal judged by a registered mentor.
/// @dev New deployments only: storage is not compatible with the historical contract.
///      Settlement credits balances; recipients withdraw independently. Targets Osaka EVM.
contract CoinPledge is Ownable2Step, ReentrancyGuardTransient {
  uint256 public constant RESOLUTION_GRACE_PERIOD = 7 days;
  uint256 public constant MIN_STAKE = 0.01 ether;
  uint256 public constant MIN_BONUS = 0.001 ether;

  // Field order and the historical spelling of successed are part of the browser ABI.
  struct Challenge {
    address user;
    string name;
    uint256 value;
    address mentor;
    uint256 startDate;
    uint256 time;
    uint256 mentorFee;
    bool successed;
    bool resolved;
  }

  struct User {
    address addr;
    string name;
  }

  error GameHasEnded();
  error InvalidUsernameLength();
  error UserAlreadyRegistered();
  error UsernameTaken();
  error StakeTooSmall();
  error RewardExceedsStake();
  error UnknownMentor();
  error InvalidDuration();
  error SelfMentoring();
  error UnknownChallenge();
  error ChallengeAlreadyResolved();
  error UnauthorizedResolver();
  error NothingToWithdraw();
  error InvalidRecipient();
  error EtherTransferFailed();
  error OwnershipRenunciationDisabled();

  event NewChallenge(
    uint256 indexed challengeId,
    address indexed user,
    string name,
    uint256 value,
    address indexed mentor,
    uint256 startDate,
    uint256 time,
    uint256 mentorFee
  );
  event ChallengeResolved(
    uint256 indexed challengeId, address indexed user, address indexed mentor, bool decision
  );
  event BonusFundChanged(address indexed user, uint256 value);
  event NewUsername(address indexed addr, string name);
  event Donation(string name, string url, uint256 value, uint256 timestamp);
  event GameEnded();
  event PaymentAccrued(address indexed recipient, uint256 value);
  event PaymentWithdrawn(address indexed user, address indexed recipient, uint256 value);

  bool public isGameOver;
  Challenge[] public challenges;
  mapping(address => User) public users;
  address[] public allUsers;
  mapping(string => address) private usernameToAddress;
  mapping(address => uint256[]) private userChallenges;
  mapping(address => uint256[]) private mentorChallenges;

  /// @notice Failed stakes, locked until later success or shutdown.
  mapping(address => uint256) public bonusFund;
  /// @notice Settled payouts, fees and donations, withdrawable at any time.
  mapping(address => uint256) public pendingWithdrawals;

  constructor() Ownable(msg.sender) {}

  modifier gameIsNotOver() {
    if (isGameOver) revert GameHasEnded();
    _;
  }

  function getBonusFund(address user) external view returns (uint256) {
    return bonusFund[user];
  }

  function getUsersCount() external view returns (uint256) {
    return allUsers.length;
  }

  // Retain the original public lookup ABI without duplicating challenge storage.
  function challengeToUser(uint256 id) external view returns (address) {
    return id < challenges.length ? challenges[id].user : address(0);
  }

  function challengeToMentor(uint256 id) external view returns (address) {
    return id < challenges.length ? challenges[id].mentor : address(0);
  }

  function userToChallengeCount(address user) external view returns (uint256) {
    return userChallenges[user].length;
  }

  function mentorToChallengeCount(address mentor) external view returns (uint256) {
    return mentorChallenges[mentor].length;
  }

  /// @notice Return this user's IDs in creation order; an unknown user gets an empty array.
  function getChallengesForUser(address user) external view returns (uint256[] memory) {
    return userChallenges[user];
  }

  function getChallengesForMentor(address mentor) external view returns (uint256[] memory) {
    return mentorChallenges[mentor];
  }

  /// @notice Stop new activity permanently and unlock bonuses; existing challenges still settle.
  function gameOver() external onlyOwner gameIsNotOver {
    isGameOver = true;
    emit GameEnded();
  }

  /// @notice Ownership must remain available for shutdown and donation/service-fee attribution.
  function renounceOwnership() public view override onlyOwner {
    revert OwnershipRenunciationDisabled();
  }

  /// @notice Register a unique, immutable, case-sensitive name of 3 to 32 UTF-8 bytes.
  function setUsername(string calldata name) external gameIsNotOver {
    uint256 length = bytes(name).length;
    if (length < 3 || length > 32) revert InvalidUsernameLength();
    if (users[msg.sender].addr != address(0)) revert UserAlreadyRegistered();
    if (usernameToAddress[name] != address(0)) revert UsernameTaken();

    users[msg.sender] = User(msg.sender, name);
    usernameToAddress[name] = msg.sender;
    allUsers.push(msg.sender);
    emit NewUsername(msg.sender, name);
  }

  /// @param time Duration in seconds, not an absolute deadline.
  /// @param mentorFee Total reward in wei, including the 10% service fee.
  function createChallenge(
    string calldata name,
    string calldata mentor,
    uint256 time,
    uint256 mentorFee
  ) external payable gameIsNotOver returns (uint256 id) {
    if (msg.value < MIN_STAKE) revert StakeTooSmall();
    if (mentorFee > msg.value) revert RewardExceedsStake();
    address mentorAddr = usernameToAddress[mentor];
    if (mentorAddr == address(0)) revert UnknownMentor();
    if (mentorAddr == msg.sender) revert SelfMentoring();
    if (time == 0 || time > type(uint256).max - block.timestamp - RESOLUTION_GRACE_PERIOD) {
      revert InvalidDuration();
    }

    id = challenges.length;
    challenges.push(
      Challenge(
        msg.sender, name, msg.value, mentorAddr, block.timestamp, time, mentorFee, false, false
      )
    );
    userChallenges[msg.sender].push(id);
    mentorChallenges[mentorAddr].push(id);
    emit NewChallenge(id, msg.sender, name, msg.value, mentorAddr, block.timestamp, time, mentorFee);
  }

  /// @notice Mentors can settle at any time; users can also settle at deadline + seven days.
  /// @dev No external calls: a rejecting recipient cannot block settlement or other recipients.
  function resolveChallenge(uint256 challengeId, bool decision) external {
    if (challengeId >= challenges.length) revert UnknownChallenge();
    Challenge storage challenge = challenges[challengeId];
    if (challenge.resolved) revert ChallengeAlreadyResolved();
    if (
      msg.sender != challenge.mentor
        && (msg.sender != challenge.user
          || block.timestamp < challenge.startDate + challenge.time + RESOLUTION_GRACE_PERIOD)
    ) revert UnauthorizedResolver();

    challenge.successed = decision;
    challenge.resolved = true;

    // Assign every wei: floor 10% to owner, all reward remainder to the mentor.
    uint256 serviceFee = challenge.mentorFee / 10;
    uint256 remainingValue = challenge.value - challenge.mentorFee;
    if (decision) {
      uint256 currentBonus = bonusFund[challenge.user];
      uint256 bonus = currentBonus <= MIN_BONUS ? currentBonus : currentBonus / 2;
      if (bonus > 0) {
        bonusFund[challenge.user] = currentBonus - bonus;
        emit BonusFundChanged(challenge.user, currentBonus - bonus);
      }
      _credit(challenge.user, remainingValue + bonus);
    } else {
      bonusFund[challenge.user] += remainingValue;
      emit BonusFundChanged(challenge.user, bonusFund[challenge.user]);
    }

    _credit(challenge.mentor, challenge.mentorFee - serviceFee);
    _credit(owner(), serviceFee);
    emit ChallengeResolved(challengeId, challenge.user, challenge.mentor, decision);
  }

  /// @notice Includes unlocked bonus funds after shutdown.
  function withdrawableBalance(address user) public view returns (uint256) {
    return pendingWithdrawals[user] + (isGameOver ? bonusFund[user] : 0);
  }

  function withdraw() external nonReentrant {
    _withdraw(payable(msg.sender));
  }

  /// @notice Claim your own balance to another recipient, e.g. if your wallet rejects ETH.
  function withdrawTo(address payable recipient) external nonReentrant {
    if (recipient == address(0) || recipient == address(this)) revert InvalidRecipient();
    _withdraw(recipient);
  }

  /// @notice Credit the current owner's withdrawal balance without calling their wallet.
  function donate(string calldata name, string calldata url) external payable gameIsNotOver {
    _credit(owner(), msg.value);
    emit Donation(name, url, msg.value, block.timestamp);
  }

  function _credit(address recipient, uint256 value) private {
    if (value == 0) return;
    pendingWithdrawals[recipient] += value;
    emit PaymentAccrued(recipient, value);
  }

  function _withdraw(address payable recipient) private {
    uint256 funds = withdrawableBalance(msg.sender);
    if (funds == 0) revert NothingToWithdraw();
    pendingWithdrawals[msg.sender] = 0;
    if (isGameOver && bonusFund[msg.sender] > 0) {
      bonusFund[msg.sender] = 0;
      emit BonusFundChanged(msg.sender, 0);
    }
    emit PaymentWithdrawn(msg.sender, recipient, funds);
    (bool success,) = recipient.call{value: funds}("");
    if (!success) revert EtherTransferFailed();
  }
}
