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

import { addDonation } from '../../actions/donations';

import {
  addMentorChallenge,
  updateMentorChallenge,
} from '../../actions/mentorChallenges';

import { addUser } from '../../actions/users';

import { setBonusFund } from '../../actions/web3';

export const pullDonationEvents = async (store) => {
  const web3js = getWeb3js();
  const instance = await getCoinContractPromise();

  instance.Donation({}, { fromBlock: 0, toBlock: 'latest' }).get((error, result) => {
    if (error) {
      console.log(error);
    } else {
      result.forEach((event) => {
        const {
          name,
          url,
          value,
          timestamp,
        } = event.args;
        const timestampNumber = timestamp.toNumber();
        const exst = store.getState().donations.filter(o => o.timestamp === timestampNumber)[0];
        if (!exst) {
          store.dispatch(addDonation({
            name,
            url,
            value: fromWei(value.toNumber(), 'ether'),
            timestamp: timestampNumber,
          }));
        }
      });
    }
  });
};

const subscribeToDonationEvent = async (store) => {
  const instance = await getCoinContractPromise();

  const donationEvent = instance.Donation();
  donationEvent.watch((error, result) => {
    if (!error) {
      const {
        name,
        url,
        value,
        timestamp,
      } = result.args;
      const timestampNumber = timestamp.toNumber();
      const exst = store.getState().donations.filter(o => o.timestamp === timestampNumber)[0];
      if (!exst) {
        store.dispatch(addDonation({
          name,
          url,
          value: fromWei(value.toNumber(), 'ether'),
          timestamp: timestampNumber,
        }));
      }
    } else {
      console.log(error);
    }
  });
};

const subscribeToNewChallengeEvents = async (store) => {
  const web3js = getWeb3js();
  const contract = await getCoinContractPromise();

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
        mentorFee,
        value,
      } = result.args;
      const account = getAccount();
      const newChallenge = {
        id: challengeId.toNumber(),
        user,
        name,
        value: web3js.fromWei(value.toNumber(), 'ether'),
        mentor,
        startDate: startDate.toNumber(),
        time: time.toNumber(),
        mentorFee: web3js.fromWei(mentorFee.toNumber(), 'ether'),
        successed: false,
        resolved: false,
        canResolve: (getAccount() === mentor),
        isMentor: getAccount() === mentor,
        isUser: getAccount() === user,
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
};

const subscribeToChallengeResolvedEvents = async (store) => {
  const web3js = getWeb3js();
  const contract = await getCoinContractPromise();

  const challengeResolvedEvent = contract.ChallengeResolved();
  challengeResolvedEvent.watch((error, result) => {
    if (!error) {
      const {
        challengeId,
        user,
        mentor,
        decision,
      } = result.args;
      const account = getAccount();
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
};

const subscribeToBonusFundEvents = async (store) => {
  const web3js = getWeb3js();
  const contract = await getCoinContractPromise();

  const bonusFundChangedEvent = contract.BonusFundChanged();
  bonusFundChangedEvent.watch((error, result) => {
    if (!error) {
      const account = getAccount();
      const { user, value } = result.args;
      if (user === account) store.dispatch(setBonusFund(fromWei(value.toNumber(), 'ether')));
    } else {
      console.log(error);
    }
  });
};

const subscribeToNewUsernameEvents = async (store) => {
  const web3js = getWeb3js();
  const contract = await getCoinContractPromise();

  const newUsernameEvent = contract.NewUsername();
  newUsernameEvent.watch((error, result) => {
    if (!error) {
      const account = getAccount();
      const state = store.getState();
      const { addr, name } = result.args;
      if (!state.users.find(user => user.addr === addr)) {
        store.dispatch(addUser({ addr, username: name }));
      }
    } else {
      console.log(error);
    }
  });
};

const subscribeToCoinEvents = async (store) => {
  try {
    await subscribeToDonationEvent(store);
    await subscribeToNewChallengeEvents(store);
    await subscribeToChallengeResolvedEvents(store);
    await subscribeToBonusFundEvents(store);
    await subscribeToNewUsernameEvents(store);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default subscribeToCoinEvents;
