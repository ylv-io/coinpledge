const { inTransaction } = require('openzeppelin-solidity/test/helpers/expectEvent');
const { reverting, throwing } = require('openzeppelin-solidity/test/helpers/shouldFail');
const { increaseTo, increase } = require('openzeppelin-solidity/test/helpers/time');
const { ether } = require('openzeppelin-solidity/test/helpers/ether');
const { ethGetBalance } = require('openzeppelin-solidity/test/helpers/web3.js');

const chai = require('chai');
const { expect } = require('chai');

const { BigNumber } = web3;

chai.use(require('chai-bignumber')());

const CoinPledge = artifacts.require('CoinPledge');

let instance;
let resolveChallengeReceipt;
let resolveChallengeTx;

const emitsChallengedResolved = async ({
  validChallengeId,
  user,
  mentor,
  decision,
}) => {
  it('emits ChallengeResolved event', async () => {
    const { args } = (await inTransaction(resolveChallengeReceipt, 'ChallengeResolved'));

    expect(args.challengeId).to.eql(new BigNumber(validChallengeId));
    expect(args.user).to.eql(user);
    expect(args.mentor).to.eql(mentor);
    expect(args.decision).to.eql(decision);
  });
};

const emitsBonusFundChanged = async ({
  user,
  value,
}) => {
  it('emits BonusFundChanged event', async () => {
    const { args } = (await inTransaction(resolveChallengeReceipt, 'BonusFundChanged'));

    expect(args.user).to.eql(user);
    expect(args.value).to.eql(value);
  });
};

const updatesChallenge = async ({
  validChallengeId,
  decision,
}) => {
  it('updates Challange', async () => {
    const challenge = await instance.challenges.call(validChallengeId);
    const [
      user,
      name,
      value,
      mentor,
      startDate,
      time,
      mentorFee,
      successed,
      resolved,
    ] = challenge;
    expect(resolved).to.eql(true);
    expect(successed).to.eql(decision);
  });
};

contract('CoinPledge', async ([owner, user, mentor, third, ...otherAccounts]) => {
  const daysToResolve = 7 * 24 * 60 * 60;
  beforeEach(async () => {
    instance = await CoinPledge.new(owner);
  });

  describe('resolveChallenge', async () => {
    let createChallengeTx;
    const invalidStake = ether(0.001);
    const invalidMentorReward = ether(-0.01);

    const validChallengeId = 0;
    const validStake = ether(1);
    const validName = 'eat all donuts';
    const validMentor = 'second';
    const validTime = 999;
    const validMentorReward = ether(0.1);

    beforeEach(async () => {
      await instance.setUsername(validMentor, { from: mentor });
      createChallengeTx = await instance.createChallenge(
        validName,
        validMentor,
        validTime,
        validMentorReward,
        { from: user, value: validStake },
      );
    });

    describe('when challenge id is wrong', () => {
      it('throws', async () => {
        await throwing(instance.resolveChallenge(999, true, { from: mentor }));
      });
    });
    describe('when challenge is resolved', () => {
      it('reverts', async () => {
        await instance.resolveChallenge(0, true, { from: mentor });
        await reverting(instance.resolveChallenge(0, true, { from: mentor }));
      });
    });
    describe('when user is not mentor', () => {
      it('reverts', async () => {
        await reverting(instance.resolveChallenge(0, true, { from: user }));
      });
    });
    describe('when challenge is old and not user/mentor', () => {
      it('reverts', async () => {
        increase(validTime + daysToResolve);
        await reverting(instance.resolveChallenge(0, true, { from: third }));
      });
    });
    describe('when challenge is valid', async () => {
      let userOldBalance;
      let mentorOldBalance;
      let ownerOldBalance;
      describe('when success', async () => {
        const decision = true;
        beforeEach(async () => {
          userOldBalance = (await ethGetBalance(user)).toNumber();
          mentorOldBalance = (await ethGetBalance(mentor)).toNumber();
          ownerOldBalance = (await ethGetBalance(owner)).toNumber();
          resolveChallengeReceipt = await instance.resolveChallenge(validChallengeId, decision, { from: mentor });
          resolveChallengeTx = await web3.eth.getTransaction(resolveChallengeReceipt.tx);
        });
        emitsChallengedResolved({
          resolveChallengeReceipt,
          validChallengeId,
          user,
          mentor,
          decision,
        });
        updatesChallenge({
          validChallengeId,
          decision,
        });
        it('transfer ether to user, mentor and owner', async () => {
          expect((await ethGetBalance(user)).toNumber() - userOldBalance).to.eql((validStake - validMentorReward));
          // for some reason there is 8200 wei difference
          expect((await ethGetBalance(mentor)).toNumber() - mentorOldBalance).to.eql(validMentorReward.mul(0.9).toNumber() - resolveChallengeReceipt.receipt.gasUsed * resolveChallengeTx.gasPrice.toNumber() + 8200);
          expect((await ethGetBalance(owner)).toNumber() - ownerOldBalance).to.eql(validMentorReward.mul(0.1).toNumber());
        });
      });

      describe('when fail', async () => {
        const decision = false;
        beforeEach(async () => {
          userOldBalance = (await ethGetBalance(user)).toNumber();
          mentorOldBalance = (await ethGetBalance(mentor)).toNumber();
          ownerOldBalance = (await ethGetBalance(owner)).toNumber();
          resolveChallengeReceipt = await instance.resolveChallenge(validChallengeId, decision, { from: mentor });
          resolveChallengeTx = await web3.eth.getTransaction(resolveChallengeReceipt.tx);
        });
        emitsChallengedResolved({
          resolveChallengeReceipt,
          validChallengeId,
          user,
          mentor,
          decision,
        });
        emitsBonusFundChanged({
          user,
          value: new BigNumber(validStake - validMentorReward),
        });
        updatesChallenge({
          validChallengeId,
          decision,
        });
        it('transfer ether to user, mentor and owner', async () => {
          expect((await ethGetBalance(user)).toNumber() - userOldBalance).to.eql(0);
          expect((await ethGetBalance(mentor)).toNumber() - mentorOldBalance).to.eql(validMentorReward.times(0.9) - resolveChallengeTx.gasPrice.times(resolveChallengeReceipt.receipt.gasUsed));
          expect((await ethGetBalance(owner)).toNumber() - ownerOldBalance).to.eql(validMentorReward.times(0.1).toNumber());
        });
      });
    });
  });
});
