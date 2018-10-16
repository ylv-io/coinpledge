import { getWeb3js, getCoinContractPromise, getAccount } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { isMoment } from 'moment';
import moment from 'moment';

export const createChallenge = async (name, value, time, mentor) => {

  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();
  const account = web3js.eth.accounts[0];

  return await instance.createChallenge.sendTransaction(name, mentor, time - moment().unix(), {
    from: account,
    value: web3js.toWei(value, 'ether')
  })
}

export const resolveChallenge = async (id, decision) => {
  
  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();
  
  const account = getAccount();

  return await instance.resolveChallenge.sendTransaction(id, decision, {
    from: account
  });
}

export const getChallenges = async (user) => {

  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();
  const account = getAccount();

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
  return [];
}

export const getMentor = async (user) => {

  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();
  const account = getAccount();

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
  return [];
}

export const getBonusFund = async (user) => {

  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();
  const account = getAccount();

  const result = await instance.getBonusFund.call(user, {
    from: account
  });
  return web3.fromWei(result.toNumber(), 'ether');
}

export const subscribeToCoinEvents = async () => {

  const web3js = getWeb3js();
  const contract = await getCoinContractPromise();

  const newChallengeEvent = contract.NewChallenge();
  newChallengeEvent.watch(function(error, result) {

    if (!error) {
      const { challengeId, judge, name, startDate, time, value } = result.args;
      const newChallenge = {
        id: challengeId.toNumber(),
        name: name,
        value: web3js.fromWei(value.toNumber(), 'ether'),
        user: getAccount(),
        mentor: judge,
        startDate: startDate.toNumber(),
        time: startDate.toNumber(),
        successed: false,
        resolved: false,
        canResolve: (getAccount() === judge),
        isMentor: getAccount() == judge,
      };
      store.dispatch(addChallenge(newChallenge));
    } else {
      console.log(error);
    }
  });

  const challengeResolvedEvent = contract.ChallengeResolved();
  challengeResolvedEvent.watch(function(error, result) {
    if (!error) {
      const { challengeId, decision } = result.args;
      const updates = {
        successed: decision,
        resolved: true,
        canResolve: false,
      };
      store.dispatch(updateChallenge(challengeId.toNumber(), updates));
    } else {
      console.log(error);
    }
  });

  return { newChallengeEvent, challengeResolvedEvent };
}