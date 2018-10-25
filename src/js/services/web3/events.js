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

const subscribeToCoinEvents = async (store) => {
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
      if (account === user) {
        const exst = store.getState().userChallenges.filter(o => o.id === newChallenge.id)[0];
        if (!exst) store.dispatch(addUserChallenge(newChallenge));
      }
      if (account === mentor) {
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
      if (account === user) {
        const exst = store.getState().userChallenges.filter(o => o.id === challengeId)[0];
        if (!exst) store.dispatch(updateUserChallenge(challengeId.toNumber(), updates));
      }
      if (account === mentor) {
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

export default subscribeToCoinEvents;
