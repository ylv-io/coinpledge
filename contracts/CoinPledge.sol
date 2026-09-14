// SPDX-License-Identifier: MIT
/// @title CoinPledge
/// @author Igor Yalovoy
/// @notice Reach your goals and have fun with friends
/// @custom:web ylv.io
/// @custom:email to@ylv.io
/// @custom:github https://github.com/ylv-io/coinpledge/tree/master
/// @custom:twitter https://twitter.com/ylv_io

// Proofs:
// Public commitment as a motivator for weight loss (https://onlinelibrary.wiley.com/doi/pdf/10.1002/mar.20316)

pragma solidity 0.8.37;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CoinPledge is Ownable {
  constructor() Ownable(msg.sender) {}

  uint256 constant daysToResolve = 7 days;
  uint256 constant bonusPercentage = 50;
  uint256 constant serviceFeePercentage = 10;
  uint256 constant minBonus = 0.001 ether;

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

  // Events
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

  /// @notice indicated is game over or not
  bool public isGameOver;

  /// @notice All Challenges
  Challenge[] public challenges;

  mapping(uint256 => address) public challengeToUser;
  mapping(address => uint256) public userToChallengeCount;

  mapping(uint256 => address) public challengeToMentor;
  mapping(address => uint256) public mentorToChallengeCount;

  /// @notice All Users
  mapping(address => User) public users;
  address[] public allUsers;
  mapping(string => address) private usernameToAddress;

  /// @notice User's bonuses
  mapping(address => uint256) public bonusFund;

  /// @notice Can access only if game is not over
  modifier gameIsNotOver() {
    require(!isGameOver, "Game should be not over");
    _;
  }

  /// @notice Can access only if game is over
  modifier gameIsOver() {
    require(isGameOver, "Game should be over");
    _;
  }

  /// @notice Get Bonus Fund For User
  function getBonusFund(address user) external view returns (uint256) {
    return bonusFund[user];
  }

  /// @notice Get Users Lenght
  function getUsersCount() external view returns (uint256) {
    return allUsers.length;
  }

  /// @notice Get Challenges For User
  function getChallengesForUser(address user) external view returns (uint256[] memory) {
    require(userToChallengeCount[user] > 0, "Has zero challenges");

    uint256[] memory result = new uint256[](userToChallengeCount[user]);
    uint256 counter = 0;
    for (uint256 i = 0; i < challenges.length; i++) {
      if (challengeToUser[i] == user) {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }

  /// @notice Get Challenges For Mentor
  function getChallengesForMentor(address mentor) external view returns (uint256[] memory) {
    require(mentorToChallengeCount[mentor] > 0, "Has zero challenges");

    uint256[] memory result = new uint256[](mentorToChallengeCount[mentor]);
    uint256 counter = 0;
    for (uint256 i = 0; i < challenges.length; i++) {
      if (challengeToMentor[i] == mentor) {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }

  /// @notice Ends game
  function gameOver() external gameIsNotOver onlyOwner {
    isGameOver = true;
  }

  /// @notice Set Username
  function setUsername(string calldata name) external gameIsNotOver {
    require(bytes(name).length > 2, "Provide a name longer than 2 chars");
    require(bytes(name).length <= 32, "Provide a name shorter than 33 chars");
    require(users[msg.sender].addr == address(0x0), "You already have a name");
    require(usernameToAddress[name] == address(0x0), "Name already taken");

    users[msg.sender] = User(msg.sender, name);
    usernameToAddress[name] = msg.sender;
    allUsers.push(msg.sender);

    emit NewUsername(msg.sender, name);
  }

  /// @notice Creates Challenge
  function createChallenge(
    string calldata name,
    string calldata mentor,
    uint256 time,
    uint256 mentorFee
  ) external payable gameIsNotOver returns (uint256 retId) {
    require(msg.value >= 0.01 ether, "Has to stake more than 0.01 ether");
    require(mentorFee >= 0 ether, "Can't be negative");
    require(mentorFee <= msg.value, "Can't be bigger than stake");
    require(bytes(mentor).length > 0, "Has to be a mentor");
    require(usernameToAddress[mentor] != address(0x0), "Mentor has to be registered");
    require(time > 0, "Time has to be greater than zero");

    address mentorAddr = usernameToAddress[mentor];

    require(msg.sender != mentorAddr, "Can't be mentor to yourself");

    uint256 startDate = block.timestamp;
    uint256 id = challenges.length;
    challenges.push(
      Challenge(msg.sender, name, msg.value, mentorAddr, startDate, time, mentorFee, false, false)
    );

    challengeToUser[id] = msg.sender;
    userToChallengeCount[msg.sender]++;

    challengeToMentor[id] = mentorAddr;
    mentorToChallengeCount[mentorAddr]++;

    emit NewChallenge(id, msg.sender, name, msg.value, mentorAddr, startDate, time, mentorFee);

    return id;
  }

  /// @notice Resolves Challenge
  function resolveChallenge(uint256 challengeId, bool decision) external gameIsNotOver {
    Challenge storage challenge = challenges[challengeId];

    require(challenge.resolved == false, "Challenge already resolved.");

    // if more time passed than endDate + daysToResolve, then user can resolve himself
    if (block.timestamp < (challenge.startDate + challenge.time + daysToResolve)) {
      require(challenge.mentor == msg.sender, "You are not the mentor for this challenge.");
    } else {
      require(
        (challenge.user == msg.sender) || (challenge.mentor == msg.sender),
        "You are not the user or mentor for this challenge."
      );
    }

    uint256 mentorFee;
    uint256 serviceFee;

    address user = challengeToUser[challengeId];
    address mentor = challengeToMentor[challengeId];

    // write decision
    challenge.successed = decision;
    challenge.resolved = true;

    uint256 remainingValue = challenge.value;

    // mentor & service fee
    if (challenge.mentorFee > 0) {
      serviceFee = (challenge.mentorFee / 100) * serviceFeePercentage;
      mentorFee = (challenge.mentorFee / 100) * (100 - serviceFeePercentage);
    }

    if (challenge.mentorFee > 0) {
      remainingValue = challenge.value - challenge.mentorFee;
    }

    uint256 valueToPay;

    if (decision) {
      // value to pay back to user
      valueToPay = remainingValue;
      // credit bouns if any
      uint256 currentBonus = bonusFund[user];
      if (currentBonus > 0) {
        uint256 bonusValue = (bonusFund[user] / 100) * bonusPercentage;
        if (currentBonus <= minBonus) {
          bonusValue = currentBonus;
        }
        bonusFund[user] -= bonusValue;
        emit BonusFundChanged(user, bonusFund[user]);

        valueToPay += bonusValue;
      }
    } else {
      bonusFund[user] += remainingValue;
      emit BonusFundChanged(user, bonusFund[user]);
    }

    // pay back to the challenger
    if (valueToPay > 0) {
      payable(user).transfer(valueToPay);
    }

    if (mentorFee > 0) {
      payable(mentor).transfer(mentorFee);
    }

    if (serviceFee > 0) {
      payable(owner()).transfer(serviceFee);
    }

    emit ChallengeResolved(challengeId, user, mentor, decision);
  }

  function withdraw() external gameIsOver {
    require(bonusFund[msg.sender] > 0, "You do not have any funds");

    uint256 funds = bonusFund[msg.sender];
    bonusFund[msg.sender] = 0;
    payable(msg.sender).transfer(funds);
  }

  function donate(string calldata name, string calldata url) external payable gameIsNotOver {
    payable(owner()).transfer(msg.value);
    emit Donation(name, url, msg.value, block.timestamp);
  }
}
