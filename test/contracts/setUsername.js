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

  describe('setUsername', () => {
    describe('when username is valid', () => {
      const username = 'runner';
      let setUsernameTx;
      beforeEach(async () => {
        setUsernameTx = await instance.setUsername(username, { from: user });
      });
      it('creates User struct', async () => {
        const userResult = await instance.users.call(user);
        expect(userResult).to.eql([user, username]);
      });

      it('addes users address to mapping', async () => {
        const userAddress = await instance.allUsers.call(0);
        expect(userAddress).to.equal(user);
      });

      it('emits NewUsername event', async () => {
        const { addr, name } = (await inTransaction(setUsernameTx, 'NewUsername')).args;
        expect(addr).to.equal(user);
        expect(name).to.equal(username);
      });
    });
    describe('when username is less than 3 letters', () => {
      it('reverts', async () => {
        await reverting(instance.setUsername('01', { from: user }));
      });
    });
    describe('when username is more than 32 letters', () => {
      it('reverts', async () => {
        await reverting(instance.setUsername('012345678901234567890123456789012', { from: user }));
      });
    });
    describe('when user already have a username', () => {
      it('reverts', async () => {
        await instance.setUsername('valid', { from: user });
        await reverting(instance.setUsername('valid', { from: user }));
      });
    });
    describe('when username is already take', () => {
      it('reverts', async () => {
        await instance.setUsername('valid', { from: user });
        await reverting(instance.setUsername('valid', { from: second }));
      });
    });
  });
});
