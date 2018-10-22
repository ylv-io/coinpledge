// Author: Igor Yalovoy
// Web: ylv.io
// Email: to@ylv.io
// GitHub: https://github.com/ylv-io/coinpledge/tree/master
// Twitter: https://twitter.com/ylv_io

// Coin Pledge
// Reach your goals and have fun with friends. Powered by security of smart contracts.


// Proofs:
// Public commitment as a motivator for weight loss (https://onlinelibrary.wiley.com/doi/pdf/10.1002/mar.20316)


pragma solidity ^0.4.17;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/payment/PullPayment.sol";
import "openzeppelin-solidity/contracts/ownership/CanReclaimToken.sol";

contract CoinPledge is Ownable, CanReclaimToken, PullPayment {

  using SafeMath for uint256;

  uint constant daysToResolve = 7 days;
  uint constant bonusPercentage = 50;
  uint constant feePercentage = 1;
  uint constant mentorPercentage = 4;
  uint constant minBonus = 1 finney;

  struct Challenge {
    address user;
    string name;
    uint value;
    address mentor;
    uint startDate;
    uint time;

    bool successed;
    bool resolved;
  }

  event NewChallenge(uint indexed challengeId, address indexed user, string name, uint value, address indexed mentor, uint startDate, uint time);
  event ChallengeResolved(uint indexed challengeId, address indexed user, address indexed mentor, bool decision);
  event BonusFundChanged(address indexed user, uint value);

  Challenge[] public challenges;

  mapping(uint => address) public challengeToUser;
  mapping(address => uint) public userToChallengeCount;

  mapping(uint => address) public challengeToMentor;
  mapping(address => uint) public mentorToChallengeCount;

  mapping(address => uint) public bonusFund;

  function getBonusFund(address user)
  external
  view
  returns(uint) {
    return bonusFund[user];
  }

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

  function getChallengesForMentor(address mentor) 
  external 
  view 
  returns(uint[]) {
    require(mentorToChallengeCount[mentor] > 0, "Has zero cases");

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

  function createChallenge(string name, address mentor, uint time) 
  external 
  payable 
  returns (uint retId) {
    require(msg.value >= 0.01 ether, "Has to stake more than 0.01 ether");
    require(mentor != 0x0, "Has to be a mentor");
    require(time > 0, "Time has to be greater than zero");

    uint startDate = block.timestamp;
    uint id = challenges.push(Challenge(msg.sender, name, msg.value, mentor, startDate, time, false, false)) - 1;

    challengeToUser[id] = msg.sender;
    userToChallengeCount[msg.sender]++;

    challengeToMentor[id] = mentor;
    mentorToChallengeCount[mentor]++;

    emit NewChallenge(id, msg.sender, name, msg.value, mentor, startDate, time);

    return id;
  }

  function resolveChallenge(uint challengeId, bool decision)
  external
  {
    Challenge storage challenge = challenges[challengeId];
    address user = challengeToUser[challengeId];
    address mentor = challengeToMentor[challengeId];

    require(challenge.resolved == false, "Challenge already resolved.");

    // if more time passed than endDate + daysToResolve, then user can resolve himself
    if(block.timestamp < (challenge.startDate + challenge.time + daysToResolve))
      require(challenge.mentor == msg.sender, "You are not the mentor for this challenge.");
    else require(challenge.user == msg.sender, "You are not the user for this challenge.");

    // write decision
    challenge.successed = decision;
    challenge.resolved = true;

    // pay service fee
    uint serviceFee = challenge.value.div(100).mul(feePercentage);
    owner.transfer(serviceFee);

    // pay mentor fee
    uint mentorFee = challenge.value.div(100).mul(mentorPercentage);
    mentor.transfer(mentorFee);

    uint remainingValue = challenge.value.sub(serviceFee).sub(mentorFee);

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
    else 
        // if failed to achieve goal, put money to bonus fund
        bonusFund[user] += remainingValue;

    // pay back to the challenger
    if(valueToPay > 0)
        user.transfer(valueToPay);

    emit ChallengeResolved(challengeId, user, mentor, decision);
  }

}