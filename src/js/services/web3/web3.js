import Contract from 'truffle-contract';
import CoinPledgeContract from '../../../../build/contracts/CoinPledge.json';
import Web3 from 'web3';

let web3js;

export const getWeb3js = () => {
  if(web3js === undefined && typeof web3 != 'undefined') {
    // console.log("Using web3 detected from external source like Metamask")
    web3js = new Web3(web3.currentProvider);
  }
  return web3js;
}

let coinContractInstance;

export const getCoinContractPromise = () => {
  if(coinContractInstance === undefined)
  {
    // Using truffle-contract we create the coinpledge object.
    const coinContract = Contract(CoinPledgeContract);
    coinContract.setProvider(getWeb3js().currentProvider);

    // Find contract instance on blockchain and bind
    return coinContract.deployed()
    .then((result) => {
      coinContractInstance = result;
      return result;
    })
    .catch(function(e) {
      console.log(e);
      throw e;
    });
  }
  return new Promise(function(resolve, reject) {
    resolve(coinContractInstance);
  });
}