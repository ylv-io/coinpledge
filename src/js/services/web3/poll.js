import { getWeb3js, getCoinContractPromise, getAccount, getNetwork } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { setAccount, setBonusFund, setLocked, setNetwork, setInstalled } from '../../actions/web3';
import { addOrUpdateUserChallenges } from '../../actions/userChallenges';
import { addOrUpdateMentorChallenges } from '../../actions/mentorChallenges';
import { getBonusFund, getChallengesForMentor, getChallengesForUser, subscribeToCoinEvents } from '../web3/challenge';
import { wait } from '../../utils/promise';

import { promisify } from 'es6-promisify'


export default async (store) => {
  try {
      // Update state related to metamask events

      let prevAccount;
      
      store.dispatch(setInstalled(!!getWeb3js()));
      store.dispatch(setLocked(true));

      if(getWeb3js())
      {
        const { network, desiredNetwork, isRightNetwork } = getNetwork();
        store.dispatch(setNetwork(network));

        if(isRightNetwork) {

          const { newChallengeEvent, challengeResolvedEvent } = subscribeToCoinEvents(store);

          while(true)
          {
            const newAccount = getAccount();

            // account changed
            if (newAccount !== prevAccount) {
              if(newAccount === undefined) {
                // account locked
                store.dispatch(setLocked(true));
              }
              else {
                // account unlocked
                store.dispatch(setLocked(false));
                // pull data once on account unlocked
                updateFromWeb3(store, getAccount());
              }

              store.dispatch(setAccount(newAccount));
              prevAccount = newAccount;
            }
           
            await wait(1000);
          }

        }

      }
    }

  catch(e) {
    console.log(e);
    throw e;
  }

}

const updateFromWeb3 = async (store, account) => {
  let result = await getChallengesForUser(account);
  store.dispatch(addOrUpdateUserChallenges(result));

  result = await getBonusFund(account);
  store.dispatch(setBonusFund(result));

  result = await getChallengesForMentor(account);
  store.dispatch(addOrUpdateMentorChallenges(result));

}