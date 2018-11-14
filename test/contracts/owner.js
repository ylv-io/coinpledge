const { inTransaction } = require('openzeppelin-solidity/test/helpers/expectEvent');
const { reverting } = require('openzeppelin-solidity/test/helpers/shouldFail');
const { ether } = require('openzeppelin-solidity/test/helpers/ether');

const chai = require('chai');
const { expect } = require('chai');

const { BigNumber } = web3;

chai.use(require('chai-bignumber')());

const CoinPledge = artifacts.require('CoinPledge');

contract('CoinPledge', ([owner, user, second, third, ...otherAccounts]) => {
  let instance;
  beforeEach(async () => {
    instance = await CoinPledge.new(owner);
  });

  describe('when created', () => {
    it('creator is owner', async () => {
      const retVal = await instance.owner();
      expect(retVal).to.equal(owner);
    });
  });

  describe('when owner ends game', () => {
    it('game ends', async () => {
      await instance.gameOver({ from: owner });
      const isGameOver = await instance.isGameOver();
      expect(isGameOver).to.equal(true);
    });
  });
  describe('when user ends game', () => {
    it('reverts', async () => {
      await reverting(instance.gameOver({ from: user }));
    });
  });
});
