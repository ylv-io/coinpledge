import {
  getWeb3js,
  getAccount,
  getNetwork,
} from './web3';

import {
  setAccount,
  setBonusFund,
  setLocked,
  setInstalled,
  setUsername,
} from '../../actions/web3';

import { addOrUpdateUserChallenges } from '../../actions/userChallenges';
import { addOrUpdateMentorChallenges } from '../../actions/mentorChallenges';
import { addOrUpdateUsers } from '../../actions/users';
import {
  getBonusFund,
  getChallengesForMentor,
  getChallengesForUser,
} from './challenge';

import subscribeToCoinEvents, { pullDonationEvents } from './events';
import { getUsername, getAllUsers } from './user';

import { wait } from '../../utils/promise';

const pullFromWeb3 = async (store, account) => {
  let result = await getChallengesForUser(account);
  store.dispatch(addOrUpdateUserChallenges(result));

  result = await getBonusFund(account);
  store.dispatch(setBonusFund(result));

  result = await getChallengesForMentor(account);
  store.dispatch(addOrUpdateMentorChallenges(result));

  result = await getUsername(account);
  store.dispatch(setUsername(result));

  result = await getAllUsers();
  store.dispatch(addOrUpdateUsers(result));

  result = await pullDonationEvents(store);
};


export default async (store) => {
  try {
    // Update state related to metamask events

    let prevAccount;
    store.dispatch(setInstalled(!!getWeb3js()));
    store.dispatch(setLocked(true));

    if (getWeb3js()) {
      subscribeToCoinEvents(store);

      while (true) {
        const newAccount = getAccount();
        // account changed
        if (newAccount !== prevAccount) {
          if (newAccount === undefined) {
            // account locked
            store.dispatch(setLocked(true));
          } else {
            // account unlocked
            store.dispatch(setLocked(false));
            // pull data once on account unlocked
            pullFromWeb3(store, getAccount());
          }

          store.dispatch(setAccount(newAccount));
          prevAccount = newAccount;
        }
        await wait(1000);
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};
