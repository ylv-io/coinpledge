import Web3 from 'web3';
import { bindContract } from './contract';

import CoinPledgeContract from '../../../../build/contracts/CoinPledge.json';
import { wait } from '../../utils/promise';

let web3js;

export const getWeb3js = () => {
  if (web3js === undefined && typeof web3 !== 'undefined') {
    web3js = new Web3(web3.currentProvider);
  }
  return web3js;
};

export const getAccount = () => {
  const web3 = getWeb3js();

  return web3.eth.accounts[0];
};

export const fromWei = (balance, base) => {
  const web3 = getWeb3js();
  return web3.fromWei(balance, base);
};

export const toWei = (balance, base) => {
  const web3 = getWeb3js();
  return web3.toWei(balance, base);
};

let coinContractInstance;

export const getCoinContractPromise = async () => {
  const web3 = getWeb3js();

  if (coinContractInstance === undefined) {
    coinContractInstance = await bindContract(web3, CoinPledgeContract);
  }
  return coinContractInstance;
};

function getTransactionReceiptPromise(hash) {
  const web3 = getWeb3js();

  return new Promise(((resolve, reject) => {
    web3.eth.getTransactionReceipt(hash, (err, data) => {
      if (err !== null) reject(err);
      else resolve(data);
    });
  }));
}

export const getTransactionReceipt = async (hash) => {
  let receipt = null;
  while (receipt === null) {
    receipt = await getTransactionReceiptPromise(hash);
    await wait(1000);
  }
  return receipt;
};
