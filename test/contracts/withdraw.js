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
  let instance;
  beforeEach(async () => {
    instance = await CoinPledge.new(owner);
  });

  describe('when withdraw while game is on', async () => {
    it('fails', async () => {
      await reverting(instance.withdraw({ from: user }));
    });
  });

  describe('when withdraw while game has ended', async () => {
    describe('when user have no funds', async () => {
      beforeEach(async () => {
        await instance.gameOver({ from: owner });
      });
      it('fails', async () => {
        await reverting(instance.withdraw({ from: user }));
      });
    });
    describe('when user have funds', async () => {
      beforeEach(async () => {
        let createChallengeTx;

        const validChallengeId = 0;
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

        const runChallenge = async (decision, challengeId) => {
          createChallengeTx = await instance.createChallenge(
            validName,
            validMentor,
            validTime,
            validMentorReward,
            { from: user, value: validStake },
          );
          resolveChallengeReceipt = await instance.resolveChallenge(challengeId, decision, { from: mentor });
          resolveChallengeTx = await web3.eth.getTransaction(resolveChallengeReceipt.tx);
        };

        // fail challenge to put ether into bonus fund
        await runChallenge(false, validChallengeId);

        await instance.gameOver({ from: owner });
      });
      it('withdraw funds to user', async () => {
        const userOldBalance = (await ethGetBalance(user)).toNumber();
        const bonusFund = await instance.getBonusFund(user, { from: user });
        const receipt = await instance.withdraw({ from: user });
        const tx = await web3.eth.getTransaction(receipt.tx);
        // gasUsed seems to be wrong and fluctate, or I am missing something
        // also subject to uint rounding in Solidity
        // diff should be less than 1 gwei
        expect(Math.abs(((await ethGetBalance(user)).toNumber() - userOldBalance) - (bonusFund.toNumber() - tx.gasPrice.times(receipt.receipt.gasUsed))))
          .to.lessThan(1000000000);
      });
    });
  });
});
