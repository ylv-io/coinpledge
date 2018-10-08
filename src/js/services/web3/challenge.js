import { getWeb3js, getCoinContractPromise } from './web3';
import { arrayToChallenge } from '../../utils/web3';
import { isMoment } from 'moment';
import moment from 'moment';

export const createChallenge = (name, value, time, mentor) => {

  return getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    const account = web3js.eth.accounts[0];

    return instance.createChallenge(name, mentor, time - moment().unix(), {
      from: account,
      value: web3js.toWei(value, 'ether')
    })
    .then((result) => {
      console.log(result);
      return result;
    })
    .catch(function(e) {
      console.log(e);
      throw e;
    });

  });
}

export const resolveChallenge = (id, decision) => {
  
  return getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    const account = web3js.eth.accounts[0];

    instance.resolveChallenge(id, decision, {
      from: account
    })
    .then((result) => {
      console.log(result);
      return result;
    })
    .catch(function(e) {
      console.log(e);
      throw e;
    });

  });

}

export const getChallenges = (user) => {

  return getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    const account = web3js.eth.accounts[0];

    if(instance && account) {
      // check number of challenges
      return instance.userToChallengeCount.call(user, {
        from: account
      })
      .then((result) => {
        const numberOfChallenges = result.toNumber();
        // console.log(`User has ${numberOfChallenges} challenges`);
        if(numberOfChallenges > 0)
        // get all user challenges indexes
          return instance.getChallenges.call(user, {
            from: account
          });
        else return Promise.reject("User has zero challenges");
      })
      .then((result) => {
        // get all users's challenges objects
        const promises = result.map(((o) => instance.challenges.call(o.toNumber(), {
          from: account
        })));

        // push indexes down the chain
        promises.push(result);

        return Promise.all(promises);
      })
      .then((result) => {
        //pop indexes
        const indexes = result.pop();
        // map all user's challenges to objects
        const challenges = result.map((o, i) => arrayToChallenge(o, indexes[i].toNumber(), user));
        // console.log(`User challenges:`);
        // console.log(challenges);
        return challenges;
      })
      .catch(function(e) {
        console.log(e);
        throw e;
      });
    }
  });

}

export const getMentor = (user) => {
  return getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    const account = web3js.eth.accounts[0];

    if(instance && account) {
      // check number of challenges
      return instance.judgeToChallengeCount.call(user, {
        from: account
      })
      .then((result) => {
        const numberOfCases = result.toNumber();
        // console.log(`User has ${numberOfCases} cases`);
        if(numberOfCases > 0)
        // get all user cases indexes
          return instance.getCases.call(user, {
            from: account
          });
        else return Promise.reject("User has zero cases");
      })
      .then((result) => {
        // get all users's cases objects
        const promises = result.map(((o) => instance.challenges.call(o.toNumber(), {
          from: account
        })));
  
        // push indexes down the chain
        promises.push(result);
  
        return Promise.all(promises);
      })
      .then((result) => {
        //pop indexes
        const indexes = result.pop();
        // map all user's cases to objects
        const cases = result.map((o, i) => arrayToChallenge(o, indexes[i].toNumber(), account));
        // console.log(`User cases:`);
        // console.log(cases);
        return cases;
      })
      .catch(function(e) {
        console.log(e);
        throw e;
      });
    }

  });

}

export const getBonusFund = (user) => {
  return getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    const account = web3js.eth.accounts[0];
    if(instance && account) {
      return instance.getBonusFund.call(user, {
        from: account
      })
      .then((result) => {
        const bonusFund = web3.fromWei(result.toNumber(), 'ether');
        // console.log(`User has ${bonusFund} ether in bonus fund`);
        return bonusFund;
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });
    }
  });
}