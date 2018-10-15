import Contract from 'truffle-contract';
import CoinPledgeContract from '../../../../build/contracts/CoinPledge.json';
import Web3 from 'web3';
import { wait } from '../../utils/promise';

let web3js;

export const getWeb3js = () => {
  if(web3js === undefined && typeof web3 != 'undefined') {
    // console.log("Using web3 detected from external source like Metamask")
    web3js = new Web3(web3.currentProvider);
  }
  return web3js;
}

let coinContractInstance;

export const getCoinContractPromise = async () => {
  const web3js = getWeb3js();
  if(coinContractInstance === undefined && web3js)
  {
    // Using truffle-contract we create the coinpledge object.
    const coinContract = Contract(CoinPledgeContract);
    coinContract.setProvider(web3js.currentProvider);

    // Find contract instance on blockchain and bind
    coinContractInstance = await coinContract.deployed();
  }
  return coinContractInstance;
}

export const getAccount = () => {
  if(web3js)
    return web3js.eth.accounts[0];
  return undefined;
}

export const getTransactionReceipt = async (hash) => {
  let receipt = null;
  while(receipt === null)
  {
    receipt = await getTransactionReceiptPromise(hash);
    await wait(1000);
  }
  return receipt;
}

function getTransactionReceiptPromise(hash) {
  return new Promise(function(resolve, reject) {
      web3js.eth.getTransactionReceipt(hash, function(err, data) {
          if (err !== null) reject(err);
          else resolve(data);
      });
  });
}