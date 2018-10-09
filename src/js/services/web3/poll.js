import { getWeb3js, getCoinContractPromise } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { setAccount, setBonusFund } from '../../actions/web3';
import { addOrUpdateChallenges } from '../../actions/challenges';
import { addOrUpdateMentor } from '../../actions/mentor';
import { getBonusFund, getMentor, getChallenges } from '../web3/challenge';

const web3js = getWeb3js();
const account = web3js.eth.accounts[0];

export default (store) => {

  setInterval(() => {
    updateFromWeb3(store);
  }, 7e3);

  updateFromWeb3(store);
}

const updateFromWeb3 = async (store) => {
  let result = await getChallenges(account);
  store.dispatch(addOrUpdateChallenges(result));

  result = await getBonusFund(account);
  store.dispatch(setBonusFund(result));

  result = await getMentor(account);
  store.dispatch(addOrUpdateMentor(result));

}