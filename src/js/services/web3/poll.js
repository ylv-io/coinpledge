import { getWeb3js, getCoinContractPromise, getAccount, getNetwork } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { setAccount, setBonusFund, setLocked, setNetwork, setInstalled } from '../../actions/web3';
import { addOrUpdateChallenges, addChallenge, updateChallenge } from '../../actions/challenges';
import { addOrUpdateMentor } from '../../actions/mentor';
import { getBonusFund, getMentor, getChallenges, subscribeToCoinEvents } from '../web3/challenge';
import { wait } from '../../utils/promise';

import { promisify } from 'es6-promisify'


export default async (store) => {
  try {
      // Update state related to metamask events

      let prevAccount;
      let counter = 7;
      
      store.dispatch(setInstalled(!!getWeb3js()));
      store.dispatch(setLocked(true));

      if(getWeb3js())
      {
        const { newChallengeEvent, challengeResolvedEvent } = subscribeToCoinEvents(store);

        const { network, desiredNetwork, isRightNetwork } = getNetwork();
        store.dispatch(setNetwork(network));

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
            }

            store.dispatch(setAccount(newAccount));
            prevAccount = newAccount;
          }

          {
            if(counter == 7)
            {
              const { installed, network, locked, account } = store.getState().blockchain;
              if(installed && (network === desiredNetwork) && !locked && account) {
                updateFromWeb3(store, getAccount());
              }
              counter = 0;
            }
            counter++;
          }
          await wait(1000);
        }
      }
    }

  catch(e) {
    console.log(e);
    throw e;
  }

}

const updateFromWeb3 = async (store, account) => {
  let result = await getChallenges(account);
  store.dispatch(addOrUpdateChallenges(result));

  result = await getBonusFund(account);
  store.dispatch(setBonusFund(result));

  result = await getMentor(account);
  store.dispatch(addOrUpdateMentor(result));

}