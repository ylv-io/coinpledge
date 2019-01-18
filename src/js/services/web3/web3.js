import Contract from 'truffle-contract';
import Web3 from 'web3';

import CoinPledgeContract from '../../../../build/contracts/CoinPledge.json';
import { wait } from '../../utils/promise';

let web3js;

export const getWeb3js = () => {
  // if (window.ethereum) {
  //   const { ethereum } = window;
  //   window.web3 = new Web3(ethereum);
  //   try {
  //     // Request account access if needed
  //     await ethereum.enable();
  //   } catch (error) {
  //     // User denied account access...
  //   }
  // }
  if (web3js === undefined && typeof web3 !== 'undefined') {
    // console.log("Using web3 detected from external source like Metamask")
    web3js = new Web3(web3.currentProvider);
  }
  return web3js;
};

export const getAccount = () => {
  const web3 = getWeb3js();

  return web3.eth.accounts[0];
};

export const sendEthToAddress = (addr, value) => {
  const web3 = getWeb3js();
  const account = getAccount();
  return web3.eth.sendTransaction({ from: account, to: addr, value }, (err, ret) => {
    if (!err) {
      return ret;
    }
    return null;
  });
};

export const fromWei = (balance, base) => {
  const web3 = getWeb3js();
  return web3.fromWei(balance, base);
};

export const toWei = (balance, base) => {
  const web3 = getWeb3js();
  return web3.toWei(balance, base);
};

export const getBalance = () => {
  const web3 = getWeb3js();
  if (getAccount()) {
    web3.eth.getBalance(getAccount(), (err, balance) => {
      const balanceInEth = web3.fromWei(balance, 'ether');
      return balanceInEth;
    });
  }
};

export const getNetwork = () => {
  const web3 = getWeb3js();
  return {
    network: web3.version.network,
  };
};

let coinContractInstance;

export const getCoinContractPromise = async () => {
  const web3 = getWeb3js();

  if (coinContractInstance === undefined) {
    // Using truffle-contract we create the coinpledge object.
    const coinContract = Contract(CoinPledgeContract);
    coinContract.setProvider(web3.currentProvider);

    // Find contract instance on blockchain and bind
    coinContractInstance = await coinContract.deployed();
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
