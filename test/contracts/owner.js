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

  describe('owner', () => {
    it('is first account', async () => {
      const retVal = await instance.owner();
      expect(retVal).to.equal(owner);
    });
  });
});
