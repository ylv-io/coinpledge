import Contract from 'truffle-contract';
import CoinPledgeContract from '../../../../build/contracts/CoinPledge.json';
import Web3 from 'web3';

export const getWeb3js = () => {
  if(typeof web3 != 'undefined') {
    // console.log("Using web3 detected from external source like Metamask")
    return new Web3(web3.currentProvider);
  }
  return null;
}

export const getCoinContractPromise = () => {
  // Using truffle-contract we create the coinpledge object.
  const coinContract = Contract(CoinPledgeContract);
  coinContract.setProvider(getWeb3js().currentProvider);

  // Find contract instance on blockchain and bind
  return coinContract.deployed();

}

export const createChallenge = (name, value, time, mentor) => {

  return getCoinContractPromise().then((instance) => {
    const web3js = getWeb3js();
    const account = web3js.eth.accounts[0];

    return instance.createChallenge(name, mentor, time * 86400, {
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