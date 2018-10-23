import moment from 'moment';

import { arrayToChallenge } from '../../utils/web3';

import {
  getWeb3js,
  getCoinContractPromise,
  getAccount,
  fromWei,
} from './web3';

import {
  addUserChallenge,
  updateUserChallenge,
} from '../../actions/userChallenges';

import {
  addMentorChallenge,
  updateMentorChallenge,
} from '../../actions/mentorChallenges';

import { setBonusFund } from '../../actions/web3';

export const createChallenge = async (name, value, time, mentor) => {
  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();
  const account = getAccount();

  return instance.createChallenge.sendTransaction(name, mentor, time - moment().unix(), {
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

export const getUsername = async (user) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  const result = await instance.users.call(user, {
    from: account,
  });
  const [, username] = result;
  return username;
};

export const setUsername = async (username) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  return instance.setUsername.sendTransaction(username, {
    from: account,
  });
};

export const subscribeToCoinEvents = async (store) => {
  const web3js = getWeb3js();
  const contract = await getCoinContractPromise();
  const account = getAccount();

  const newChallengeEvent = contract.NewChallenge();
  newChallengeEvent.watch((error, result) => {
    if (!error) {
      const {
        challengeId,
        user,
        mentor,
        name,
        startDate,
        time,
        value,
      } = result.args;
      const newChallenge = {
        id: challengeId.toNumber(),
        user,
        name,
        value: web3js.fromWei(value.toNumber(), 'ether'),
        mentor,
        startDate: startDate.toNumber(),
        time: time.toNumber(),
        successed: false,
        resolved: false,
        canResolve: (getAccount() === mentor),
        isMentor: getAccount() === mentor,
      };
      if (user === account) {
        const exst = store.getState().userChallenges.filter(o => o.id === newChallenge.id)[0];
        if (!exst) store.dispatch(addUserChallenge(newChallenge));
      }
      if (user === mentor) {
        const exst = store.getState().mentorChallenges.filter(o => o.id === newChallenge.id)[0];
        if (!exst) store.dispatch(addMentorChallenge(newChallenge));
      }
    } else {
      console.log(error);
    }
  });

  const challengeResolvedEvent = contract.ChallengeResolved();
  challengeResolvedEvent.watch((error, result) => {
    if (!error) {
      const {
        challengeId,
        user,
        mentor,
        decision,
      } = result.args;
      const updates = {
        successed: decision,
        resolved: true,
        canResolve: false,
      };
      if (user === account) {
        const exst = store.getState().userChallenges.filter(o => o.id === challengeId)[0];
        if (!exst) store.dispatch(updateUserChallenge(challengeId.toNumber(), updates));
      }
      if (user === mentor) {
        const exst = store.getState().mentorChallenges.filter(o => o.id === challengeId)[0];
        if (!exst) store.dispatch(updateMentorChallenge(challengeId.toNumber(), updates));
      }
    } else {
      console.log(error);
    }
  });

  const bonusFundChangedEvent = contract.BonusFundChanged();
  bonusFundChangedEvent.watch((error, result) => {
    if (!error) {
      const { user, value } = result.args;
      if (user === account) store.dispatch(setBonusFund(fromWei(value.toNumber(), 'ether')));
    } else {
      console.log(error);
    }
  });

  return { newChallengeEvent, challengeResolvedEvent };
};
