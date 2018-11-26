import moment from 'moment';

import { arrayToChallenge } from '../../utils/web3';

import {
  getWeb3js,
  getCoinContractPromise,
  getAccount,
  fromWei,
} from './web3';

export const createChallenge = async (name, value, time, mentor, mentorFee) => {
  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();
  const account = getAccount();

  return instance.createChallenge.sendTransaction(name, mentor, time - moment().unix(), mentorFee, {
    from: account,
    value: web3js.toWei(value, 'ether'),
  });
};

export const resolveChallenge = async (id, decision) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  return instance.resolveChallenge.sendTransaction(id, decision, {
    from: account,
  });
};

export const getChallengesForUser = async (user) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  // check number of challenges
  const numberOfChallenges = (await instance.userToChallengeCount.call(user, {
    from: account,
  })).toNumber();

  let indexes;
  if (numberOfChallenges > 0) {
    // get all user challenges indexes
    indexes = await instance.getChallengesForUser.call(user, {
      from: account,
    });

    // get all users's challenges objects
    const promises = indexes.map((o => instance.challenges.call(o.toNumber(), {
      from: account,
    })));

    const challengesRaw = await Promise.all(promises);
    // map all user's challenges to objects
    const challenges = challengesRaw
      .map((o, i) => arrayToChallenge(o, indexes[i].toNumber(), account));
    return challenges;
  }
  return [];
};

export const getChallengesForMentor = async (user) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  // check number of challenges
  const numberOfEfforts = (await instance.mentorToChallengeCount.call(user, {
    from: account,
  })).toNumber();

  let indexes;
  if (numberOfEfforts > 0) {
    // get all user efforts indexes
    indexes = await instance.getChallengesForMentor.call(user, {
      from: account,
    });

    // get all users's challenges objects
    const promises = indexes.map((o => instance.challenges.call(o.toNumber(), {
      from: account,
    })));

    const effortsRaw = await Promise.all(promises);
    // map all user's challenges to objects
    const efforts = effortsRaw.map((o, i) => arrayToChallenge(o, indexes[i].toNumber(), account));
    return efforts;
  }
  return [];
};

export const getBonusFund = async (user) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  const result = await instance.getBonusFund.call(user, {
    from: account,
  });
  return fromWei(result.toNumber(), 'ether');
};

export const donate = async (name, url, value) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  return instance.donate.sendTransaction(name, url, {
    from: account,
    value,
  });
};
