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

contract('CoinPledge', async ([owner, user, mentor, third, ...otherAccounts]) => {
  const daysToResolve = 7 * 24 * 60 * 60;
  let instance;
  beforeEach(async () => {
    instance = await CoinPledge.new(owner);
  });

  describe('when fails challenge and then wins many times after', async () => {
    it('gets all ether back', async () => {
      let createChallengeTx;

      let validChallengeId = 0;
      const validStake = ether(1);
      const validName = 'eat all donuts';
      const validMentor = 'second';
      const validTime = 999;
      const validMentorReward = ether(0.1);
      const minBonus = ether(0.001);

      let resolveChallengeReceipt;
      let resolveChallengeTx;
      let bonusFund;

      await instance.setUsername(validMentor, { from: mentor });

      const runChallenge = async (decision, challengeId, pow) => {
        const prevBonusFund = bonusFund ? bonusFund.toNumber() : Number.MAX_SAFE_INTEGER;
        createChallengeTx = await instance.createChallenge(
          validName,
          validMentor,
          validTime,
          validMentorReward,
          { from: user, value: validStake },
        );
        resolveChallengeReceipt = await instance.resolveChallenge(challengeId, decision, { from: mentor });
        resolveChallengeTx = await web3.eth.getTransaction(resolveChallengeReceipt.tx);

        bonusFund = await instance.getBonusFund(user, { from: user });
        const expectedBonusFund = (validStake - validMentorReward) / (2 ** pow);
        expect(bonusFund.toNumber()).to.eql(prevBonusFund >= minBonus ? expectedBonusFund : 0);
      };

      // fail challenge to put ether into bonus fund
      await runChallenge(false, validChallengeId, validChallengeId);

      // keep winning until bonus fund is 0 ether
      while (bonusFund > 0) {
        await runChallenge(true, ++validChallengeId, validChallengeId);
      }
    });
  });
});
