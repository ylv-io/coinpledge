const { inTransaction } = require('openzeppelin-solidity/test/helpers/expectEvent');
const { reverting } = require('openzeppelin-solidity/test/helpers/shouldFail');
const { ether } = require('openzeppelin-solidity/test/helpers/ether');

const chai = require('chai');
const { expect } = require('chai');

const { BigNumber } = web3;

chai.use(require('chai-bignumber')());

const CoinPledge = artifacts.require('CoinPledge');

contract('CoinPledge', ([owner, user, second, third, ...otherAccounts]) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
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

  describe('createChallenge', () => {
    const invalidStake = ether(0.001);
    const invalidMentorReward = ether(-0.01);

    const validsStake = ether(1);
    const validName = 'eat all donuts';
    const validMentor = 'second';
    const validTime = 999;
    const validMentorReward = ether(0.1);

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
        await reverting(instance.createChallenge(validName, validMentor, validTime, invalidMentorReward, { from: user, value: validsStake }));
      });
    });

    describe('when mentor reward is bigger than stake', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, validMentor, validTime, validMentorReward + validsStake, { from: user, value: validsStake }));
      });
    });

    describe('when mentor does\'t exist', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, 'random', validTime, validMentorReward, { from: user, value: validsStake }));
      });
    });

    describe('when mentor is not defined', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, '', validTime, validMentorReward, { from: user, value: validsStake }));
      });
    });

    describe('when time is zero', () => {
      it('reverts', async () => {
        await reverting(instance.createChallenge(validName, validMentor, 0, validMentorReward, { from: user, value: validsStake }));
      });
    });

    describe('when challenge is valid', () => {
      let createChallengeTx;

      beforeEach(async () => {
        createChallengeTx = await instance.createChallenge(validName, validMentor, validTime, validMentorReward, { from: user, value: validsStake });
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
        expect(value).to.eql(validsStake);
        expect(mentor).to.equal(second);
        expect(startDate).to.eql(new BigNumber(web3.eth.getBlock(web3.eth.blockNumber).timestamp));
        expect(time).to.eql(new BigNumber(validTime));
        expect(mentorFee).to.eql(validMentorReward);
      });
    });
  });
});
