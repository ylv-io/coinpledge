const { inTransaction } = require('openzeppelin-solidity/test/helpers/expectEvent');
const { reverting } = require('openzeppelin-solidity/test/helpers/shouldFail');
const { ether } = require('openzeppelin-solidity/test/helpers/ether');

const chai = require('chai');
const { expect } = require('chai');

const { BigNumber } = web3;

chai.use(require('chai-bignumber')());

const CoinPledge = artifacts.require('CoinPledge');

let instance;

const testCreateChallengeValid = ({
  validMentor,
  validName,
  validTime,
  validMentorReward,
  validStake,
  user,
  second,
}) => {
  let createChallengeTx;

  beforeEach(async () => {
    createChallengeTx = await instance.createChallenge(
      validName,
      validMentor,
      validTime,
      validMentorReward,
      { from: user, value: validStake },
    );
  });

  it('creates Challenge struct', async () => {
    const challenge = await instance.challenges.call(0);
    expect(challenge).to.eql([
      user,
      validName,
      validStake,
      second,
      new BigNumber(web3.eth.getBlock(web3.eth.blockNumber).timestamp),
      new BigNumber(validTime),
      validMentorReward,
      false,
      false,
    ]);
  });

  it('assigns user', async () => {
    const userAddr = await instance.challengeToUser.call(0);
    expect(userAddr).to.equal(user);

    const challengeCount = await instance.userToChallengeCount.call(user);
    expect(challengeCount).to.eql(new BigNumber(1));
  });

  it('assigns mentor', async () => {
    const mentorAddr = await instance.challengeToMentor.call(0);
    expect(mentorAddr).to.equal(second);

    const challengeCount = await instance.mentorToChallengeCount.call(second);
    expect(challengeCount).to.eql(new BigNumber(1));
  });

  it('emits NewChallenge event', async () => {
    const {
      challengeId,
      user: userAddr,
      name,
      value,
      mentor,
      startDate,
      time,
      mentorFee,
    } = (await inTransaction(createChallengeTx, 'NewChallenge')).args;

    expect(challengeId).to.eql(new BigNumber(0));
    expect(userAddr).to.equal(user);
    expect(name).to.equal(validName);
    expect(value).to.eql(validStake);
    expect(mentor).to.equal(second);
    expect(startDate).to.eql(new BigNumber(web3.eth.getBlock(web3.eth.blockNumber).timestamp));
    expect(time).to.eql(new BigNumber(validTime));
    expect(mentorFee).to.eql(validMentorReward);
  });
};


contract('CoinPledge', ([owner, user, second, third, ...otherAccounts]) => {
  beforeEach(async () => {
    instance = await CoinPledge.new(owner);
  });

  describe('createChallenge', () => {
    const invalidStake = ether(0.001);
    const invalidMentorReward = ether(-0.01);

    const validStake = ether(1);
    const validName = 'eat all donuts';
    const validMentor = 'second';
    const validTime = 999;
    const validMentorReward = ether(0.1);

    const data = {
      invalidStake,
      invalidMentorReward,

      validStake,
      validName,
      validMentor,
      validTime,
      validMentorReward,

      user,
      second,
    };

    beforeEach(async () => {
      await instance.setUsername(validMentor, { from: second });
    });

    describe('when value is less than 0.01', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, validMentor, validTime, validMentorReward, { from: user, value: invalidStake }));
      });
    });

    describe('when mentor reward is less than 0', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, validMentor, validTime, invalidMentorReward, { from: user, value: validStake }));
      });
    });

    describe('when mentor reward is bigger than stake', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, validMentor, validTime, validMentorReward + validStake, { from: user, value: validStake }));
      });
    });

    describe('when mentor does\'t exist', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, 'random', validTime, validMentorReward, { from: user, value: validStake }));
      });
    });

    describe('when mentor is not defined', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, '', validTime, validMentorReward, { from: user, value: validStake }));
      });
    });

    describe('when time is zero', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, validMentor, 0, validMentorReward, { from: user, value: validStake }));
      });
    });

    describe('when challenge is valid', () => {
      describe('when mentor fee is zero', () => {
        testCreateChallengeValid({
          ...data,
          validMentorReward: new BigNumber(0),
        });
      });
      describe('when mentor fee is not zero', () => {
        testCreateChallengeValid({
          ...data,
        });
      });
    });
  });
});
