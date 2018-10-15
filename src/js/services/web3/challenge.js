import { getWeb3js, getCoinContractPromise } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { isMoment } from 'moment';
import moment from 'moment';

export const createChallenge = async (name, value, time, mentor) => {

  const instance = await getCoinContractPromise();
  const web3js = getWeb3js();
  const account = web3js.eth.accounts[0];

  return await instance.createChallenge.sendTransaction(name, mentor, time - moment().unix(), {
    from: account,
    value: web3js.toWei(value, 'ether')
  })
}

export const resolveChallenge = async (id, decision) => {
  
  const instance = await getCoinContractPromise();
  const web3js = getWeb3js();
  const account = web3js.eth.accounts[0];

  return await instance.resolveChallenge.sendTransaction(id, decision, {
    from: account
  });
}

export const getChallenges = async (user) => {

  const instance = await getCoinContractPromise();
  const web3js = getWeb3js();
  const account = web3js.eth.accounts[0];

  if(instance && account) {
    // check number of challenges
    const numberOfChallenges = (await instance.userToChallengeCount.call(user, {
      from: account
    })).toNumber();

    let indexes;
    if(numberOfChallenges > 0) {
      // get all user challenges indexes
      indexes = await instance.getChallenges.call(user, {
        from: account
      });

      // get all users's challenges objects
      const promises = indexes.map(((o) => instance.challenges.call(o.toNumber(), {
        from: account
      })));

      const challengesRaw = await Promise.all(promises);
      // map all user's challenges to objects
      const challenges = challengesRaw.map((o, i) => arrayToChallenge(o, indexes[i].toNumber(), user));
      return challenges;
    }
  }
}

export const getMentor = async (user) => {
  const instance = await getCoinContractPromise();
  const web3js = getWeb3js();
  const account = web3js.eth.accounts[0];

  if(instance && account) {
    // check number of challenges
    const numberOfEfforts = (await instance.judgeToChallengeCount.call(user, {
      from: account
    })).toNumber();

    let indexes;
    if(numberOfEfforts > 0) {
       // get all user efforts indexes
       indexes = await instance.getCases.call(user, {
        from: account
      });

      // get all users's cases objects
      const promises = indexes.map(((o) => instance.challenges.call(o.toNumber(), {
        from: account
      })));

      const effortsRaw = await Promise.all(promises);
      // map all user's cases to objects
      const efforts = effortsRaw.map((o, i) => arrayToChallenge(o, indexes[i].toNumber(), account));
      return efforts;
    }
  }

}

export const getBonusFund = async (user) => {
  const instance = await getCoinContractPromise();
  const web3js = getWeb3js();
  const account = web3js.eth.accounts[0];

  if(instance && account) {
    const result = await instance.getBonusFund.call(user, {
      from: account
    });
    return web3.fromWei(result.toNumber(), 'ether');
  }
}