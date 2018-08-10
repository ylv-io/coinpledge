// Author: Igor Yalovoy
// Web: ylv.io
// Email: to@ylv.io
// GitHub: https://github.com/ylv-io/coinpledge/tree/master
// Twitter: https://twitter.com/ylv_io

// Coin Pledge
// Archive your goals and have fun with friends. Powered by security of smart contracts.


// Proofs:
// Public commitment as a motivator for weight loss (https://onlinelibrary.wiley.com/doi/pdf/10.1002/mar.20316)


pragma solidity ^0.4.17;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/payment/PullPayment.sol";
import "openzeppelin-solidity/contracts/ownership/CanReclaimToken.sol";

contract CoinPledge is Ownable, CanReclaimToken, PullPayment {

  uint constant daysToJudge = 7 days;
  uint constant bonusPercentage = 50;
  uint constant feePercentage = 1;

  struct Challenge {
    string name;
    uint value;
    address judge;
    uint startDate;
    uint time;

    bool successed;
    bool resolved;
  }

  event NewChallenge(uint challengeId, string name, uint value, address judge, uint startDate, uint time);
  event ChallengeResolved(uint challengeId, bool decision);

  Challenge[] public challenges;

  mapping(uint => address) public challengeToUser;
  mapping(address => uint) public userToChallengeCount;

  mapping(uint => address) public challengeToJudge;
  mapping(address => uint) public judgeToChallengeCount;

  mapping(address => uint) public bonusFund;

  function getBonusFund(address user)
  external
  view
  returns(uint) {
    return bonusFund[user];
  }

  function getChallenges(address user) 
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

  function getCases(address judge) 
  external 
  view 
  returns(uint[]) {
    require(judgeToChallengeCount[judge] > 0, "Has zero cases");

    uint[] memory result = new uint[](judgeToChallengeCount[judge]);
    uint counter = 0;
    for (uint i = 0; i < challenges.length; i++) {
      if (challengeToJudge[i] == judge)
      {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }

  function createChallenge(string name, address judge, uint time) 
  external 
  payable 
  returns (uint retId) {
    require(msg.value >= 0.01 ether, "Has to stake more than 0.01 ether");
    require(judge != 0x0, "Has to be a judge");
    require(time > 0, "Time has to be greater than zero");

    uint startDate = block.timestamp;
    uint id = challenges.push(Challenge(name, msg.value, judge, startDate, time, false, false)) - 1;

    challengeToUser[id] = msg.sender;
    userToChallengeCount[msg.sender]++;

    challengeToJudge[id] = judge;
    judgeToChallengeCount[judge]++;

    emit NewChallenge(id, name, msg.value, judge, startDate, time);

    return id;
  }

  function resolveChallenge(uint challengeId, bool decision)
  external
  {
    Challenge storage challenge = challenges[challengeId];
    address challenger = challengeToUser[challengeId];

    require(challenge.resolved == false, "Challenge already resolved.");
    require(block.timestamp > (challenge.startDate + challenge.time), "It is not time yet to judge.");

    // if more time passed than endDate + daysToJudge, then challenger can resolve himself
    if(block.timestamp > (challenge.startDate + challenge.time + daysToJudge))
      require(challenge.judge == msg.sender || challenger == msg.sender, "You are not the judge for this challenge.");
    else
      require(challenge.judge == msg.sender, "You are not the judge for this challenge.");

    // write decision
    challenge.successed = decision;
    challenge.resolved = true;

    // pay 1% fee
    uint fee = SafeMath.mul(SafeMath.div(challenge.value, 100), feePercentage);
    asyncTransfer(owner, fee);

    uint remainingValue = SafeMath.sub(challenge.value, fee);

    uint valueToPay;

    if(decision) {
      // value to pay back to challenger
      valueToPay = remainingValue;
      // credit bouns if any
      if(bonusFund[challenger] > 0)
      {
        uint bonusValue = SafeMath.mul(SafeMath.div(bonusFund[challenger], 100), bonusPercentage);
        bonusFund[challenger] -= bonusValue;
      }
    }
    else 
        // if failed to archive goal, put money to bonus fund
        bonusFund[challenger] += remainingValue;

    // pay back to the challenger
    if(valueToPay > 0)
        challenger.transfer(valueToPay);

    emit ChallengeResolved(challengeId, decision);
  }

}