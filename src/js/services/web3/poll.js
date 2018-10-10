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

    // address: "0x97babd178e227d99c225db960289ced8899b5e52"
    // args:
    //   challengeId: BigNumber {s: 1, e: 1, c: Array(1)}
    //   judge: "0xf0083dca53282b299b5e937c209c2615d62474ab"
    //   name: "evetns"
    //   startDate: BigNumber {s: 1, e: 9, c: Array(1)}
    //   time: BigNumber {s: 1, e: 5, c: Array(1)}
    //   value: BigNumber {s: 1, e: 17, c: Array(1)}
    // __proto__: Object
    // blockHash: "0xaf3cd349d6a91274c8ff7b49872ddc067d4d31850f19cf1d8ab33cba12f0c4af"
    // blockNumber: 4206205
    // event: "NewChallenge"
    // logIndex: 10
    // removed: false
    // transactionHash: "0x31671e92467d9b9b36ba68e61f46a3046a4a54d81a35be8e2db21af02695c233"
    // transactionIndex: 21

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
    const result = await getBonusFund(account);
    store.dispatch(setBonusFund(result));
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