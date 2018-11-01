/// @title CoinPledge
/// @author Igor Yalovoy
/// @notice Reach your goals and have fun with friends
/// @dev All function calls are currently implement without side effects
/// @web: ylv.io
/// @email: to@ylv.io
/// @gitHub: https://github.com/ylv-io/coinpledge/tree/master
/// @twitter: https://twitter.com/ylv_io

// Proofs:
// Public commitment as a motivator for weight loss (https://onlinelibrary.wiley.com/doi/pdf/10.1002/mar.20316)


pragma solidity ^0.4.17;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/payment/PullPayment.sol";
import "openzeppelin-solidity/contracts/ownership/CanReclaimToken.sol";

contract CoinPledge is Ownable, CanReclaimToken {

  using SafeMath for uint256;

  uint constant daysToResolve = 7 days;
  uint constant bonusPercentage = 50;
  uint constant serviceFeePercentage = 10;
  uint constant minBonus = 1 finney;

  struct Challenge {
    address user;
    string name;
    uint value;
    address mentor;
    uint startDate;
    uint time;
    uint mentorFee;

    bool successed;
    bool resolved;
  }

  struct User {
    address addr;
    string name;
  }

  // Events
  event NewChallenge(
    uint indexed challengeId,
    address indexed user,
    string name,
    uint value,
    address indexed mentor,
    uint startDate,
    uint time,
    uint mentorFee
  );

  event ChallengeResolved(
    uint indexed challengeId,
    address indexed user,
    address indexed mentor,
    bool decision
  );

  event BonusFundChanged(
    address indexed user,
    uint value
  );

  event NewUsername(
    address indexed addr,
    string name
  );

  /// @notice All Challenges
  Challenge[] public challenges;

  mapping(uint => address) public challengeToUser;
  mapping(address => uint) public userToChallengeCount;

  mapping(uint => address) public challengeToMentor;
  mapping(address => uint) public mentorToChallengeCount;

  /// @notice All Users
  mapping(address => User) public users;
  address[] public allUsers;
  mapping(string => address) private usernameToAddress;
  
  /// @notice User's bonuses
  mapping(address => uint) public bonusFund;

  /// @notice Get Bonus Fund For User
  function getBonusFund(address user)
  external
  view
  returns(uint) {
    return bonusFund[user];
  }


  /// @notice Get Users Lenght
  function getUsersCount()
  external
  view
  returns(uint) {
    return allUsers.length;
  }


  /// @notice Get Challenges For User
  function getChallengesForUser(address user)
  external
  view
  returns(uint[]) {
    require(userToChallengeCount[user] > 0, "Has zero challenges");

    uint[] memory result = new uint[](userToChallengeCount[user]);
    uint counter = 0;
    for (uint i = 0; i < challenges.length; i++) {
      if (challengeToUser[i] == user)
      {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }

  /// @notice Get Challenges For Mentor
  function getChallengesForMentor(address mentor)
  external
  view
  returns(uint[]) {
    require(mentorToChallengeCount[mentor] > 0, "Has zero challenges");

    uint[] memory result = new uint[](mentorToChallengeCount[mentor]);
    uint counter = 0;
    for (uint i = 0; i < challenges.length; i++) {
      if (challengeToMentor[i] == mentor)
      {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }

  /// @notice Set Username

  function setUsername(string name)
  external {
    require(bytes(name).length > 2, "Provide a name longer than 2 chars");
    require(bytes(name).length < 32, "Provide a name shorter than 32 chars");
    require(users[msg.sender].addr == address(0x0), "You already have a name");
    require(usernameToAddress[name] == address(0x0), "Name already taken");

    users[msg.sender] = User(msg.sender, name);
    usernameToAddress[name] = msg.sender;
    allUsers.push(msg.sender);

    emit NewUsername(msg.sender, name);
  }

  /// @notice Creates Challenge
  function createChallenge(string name, string mentor, uint time, uint mentorFee)
  external
  payable
  returns (uint retId) {
    require(msg.value >= 0.01 ether, "Has to stake more than 0.01 ether");
    require(mentorFee >= 0 ether, "Can't be negative");
    require(mentorFee <= msg.value, "Can't be bigger than stake");
    require(bytes(mentor).length > 0, "Has to be a mentor");
    require(usernameToAddress[mentor] != address(0x0), "Mentor has to be registered");
    require(time > 0, "Time has to be greater than zero");

    address mentorAddr = usernameToAddress[mentor];

    require(msg.sender != mentorAddr, "Can't be mentor to yourself");

    uint startDate = block.timestamp;
    uint id = challenges.push(Challenge(msg.sender, name, msg.value, mentorAddr, startDate, time, mentorFee, false, false)) - 1;

    challengeToUser[id] = msg.sender;
    userToChallengeCount[msg.sender]++;

    challengeToMentor[id] = mentorAddr;
    mentorToChallengeCount[mentorAddr]++;

    emit NewChallenge(id, msg.sender, name, msg.value, mentorAddr, startDate, time, mentorFee);

    return id;
  }

  /// @notice Resolves Challenge
  function resolveChallenge(uint challengeId, bool decision)
  external {
    Challenge storage challenge = challenges[challengeId];
    
    require(challenge.resolved == false, "Challenge already resolved.");

    // if more time passed than endDate + daysToResolve, then user can resolve himself
    if(block.timestamp < (challenge.startDate + challenge.time + daysToResolve))
      require(challenge.mentor == msg.sender, "You are not the mentor for this challenge.");
    else require((challenge.user == msg.sender) || (challenge.mentor == msg.sender), "You are not the user or mentor for this challenge.");

    uint mentorFee;
    uint serviceFee;
    
    address user = challengeToUser[challengeId];
    address mentor = challengeToMentor[challengeId];

    // write decision
    challenge.successed = decision;
    challenge.resolved = true;

    uint remainingValue = challenge.value;

    // mentor & service fee
    if(challenge.mentorFee > 0) {
      serviceFee = challenge.mentorFee.div(100).mul(serviceFeePercentage);
      mentorFee = challenge.mentorFee.div(100).mul(100 - serviceFeePercentage);
    }
    
    if(challenge.mentorFee > 0)
      remainingValue = challenge.value.sub(challenge.mentorFee);

    uint valueToPay;

    if(decision) {
      // value to pay back to user
      valueToPay = remainingValue;
      // credit bouns if any
      uint currentBonus = bonusFund[user];
      if(currentBonus > 0)
      {
        uint bonusValue = bonusFund[user].div(100).mul(bonusPercentage);
        if(currentBonus <= minBonus)
          bonusValue = currentBonus;
        bonusFund[user] -= bonusValue;
        emit BonusFundChanged(user, bonusFund[user]);

        valueToPay += bonusValue;
      }
    }
    else {
      bonusFund[user] += remainingValue;
      emit BonusFundChanged(user, bonusFund[user]);
    }

    // pay back to the challenger
    if(valueToPay > 0)
      user.transfer(valueToPay);

    if(mentorFee > 0)
      mentor.transfer(mentorFee);

    if(serviceFee > 0)
      owner.transfer(serviceFee);

    emit ChallengeResolved(challengeId, user, mentor, decision);
  }

}