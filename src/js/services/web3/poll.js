import { getWeb3js, getCoinContractPromise, getAccount } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { setAccount, setBonusFund, setLocked } from '../../actions/web3';
import { addOrUpdateChallenges, addChallenge, updateChallenge } from '../../actions/challenges';
import { addOrUpdateMentor } from '../../actions/mentor';
import { getBonusFund, getMentor, getChallenges } from '../web3/challenge';
import { wait } from '../../utils/promise';

import { promisify } from 'es6-promisify'


export default async (store) => {
  try {
    
    const contract = await getCoinContractPromise();
    const web3js = getWeb3js();


    // Generate Account Changed Event
    // todo: Chnage to RX lib

    let prevAccount = getAccount();
    const accountInterval = setInterval(function() {
      const tmp = getAccount();
      if (tmp !== prevAccount) {

        if(tmp === undefined )
          store.dispatch(setLocked(true));
        else store.dispatch(setLocked(false));

        updateFromWeb3(store, tmp);
        store.dispatch(setAccount(tmp));
        prevAccount = tmp;
      }

    }, 1000);
    
    if(web3js && contract)
    {
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

        while(true)
        {
          updateFromWeb3(store, getAccount());
          await wait(7000);
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