import { getWeb3js, getCoinContractPromise } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { setAccount, setBonusFund } from '../../actions/web3';
import { addOrUpdateChallenges } from '../../actions/challenges';


const getAllChallenges = (store) => {

  getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    if(instance) {
      // check number of challenges
      instance.userToChallengeCount.call(web3js.eth.accounts[0], {
        from: web3js.eth.accounts[0]
      })
      .then((result) => {
        const numberOfChallenges = result.toNumber();
        // console.log(`User has ${numberOfChallenges} challenges`);
        if(numberOfChallenges > 0)
        // get all user challenges indexes
          return instance.getChallenges.call(web3js.eth.accounts[0], {
            from: web3js.eth.accounts[0]
          });
        else return Promise.reject("User has zero challenges");
      })
      .then((result) => {
        // get all users's challenges objects
        const promises = result.map(((o) => instance.challenges.call(o.toNumber(), {
          from: web3js.eth.accounts[0]
        })));

        // push indexes down the chain
        promises.push(result);

        return Promise.all(promises);
      })
      .then((result) => {
        //pop indexes
        const indexes = result.pop();
        // map all user's challenges to objects
        const challenges = result.map((o, i) => arrayToChallenge(o, indexes[i].toNumber(), web3js.eth.accounts[0]));
        // console.log(`User challenges:`);
        // console.log(challenges);
        store.dispatch(addOrUpdateChallenges(challenges));
      })
      .catch(function(e) {
        console.log(e);
      });
    }
  });

}

const getBonusFund = (store) => {
  getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    const account = web3js.eth.accounts[0];
    if(instance) {
      return instance.getBonusFund.call(account, {
        from: account
      })
      .then((result) => {
        const bonusFund = web3.fromWei(result.toNumber(), 'ether');
        // console.log(`User has ${bonusFund} ether in bonus fund`);
        store.dispatch(setBonusFund(bonusFund));
      })
      .catch((e) => {
        console.log(e);
      });
    }
  });
}

export default (store) => {
  setInterval(() => {
    getAllChallenges(store);
    getBonusFund(store);
  }, 7e3);
  getAllChallenges(store);
  getBonusFund(store);
}