import { getWeb3js, getCoinContractPromise } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { setAccount, setBonusFund } from '../../actions/web3';
import { addOrUpdateChallenges, addChallenge, updateChallenge } from '../../actions/challenges';
import { addOrUpdateMentor } from '../../actions/mentor';
import { getBonusFund, getMentor, getChallenges } from '../web3/challenge';
import { wait } from '../../utils/promise';

import { promisify } from 'es6-promisify'

const web3js = getWeb3js();
const account = web3js.eth.accounts[0];

export default async (store) => {

  updateFromWeb3(store);

  const contract = await getCoinContractPromise();
  const web3js = getWeb3js();
  const account = web3js.eth.accounts[0];

  const newChallengeEvent = contract.NewChallenge();
  newChallengeEvent.watch(function(error, result) {

    if (!error) {
      const { challengeId, judge, name, startDate, time, value } = result.args;
      const newChallenge = {
        id: challengeId.toNumber(),
        name: name,
        value: web3js.fromWei(value.toNumber(), 'ether'),
        user: account,
        mentor: judge,
        startDate: startDate.toNumber(),
        time: startDate.toNumber(),
        successed: false,
        resolved: false,
        canResolve: (account === judge),
        isMentor: account == judge,
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
    updateFromWeb3(store);
    await wait(7000);
  }

}

const updateFromWeb3 = async (store) => {
  let result = await getChallenges(account);
  store.dispatch(addOrUpdateChallenges(result));

  result = await getBonusFund(account);
  store.dispatch(setBonusFund(result));

  result = await getMentor(account);
  store.dispatch(addOrUpdateMentor(result));

}