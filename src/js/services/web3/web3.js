import Contract from 'truffle-contract';
import Web3 from 'web3';

import CoinPledgeContract from '../../../../build/contracts/CoinPledge.json';
import { wait } from '../../utils/promise';

let web3js;

export const getWeb3js = () => {
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
  // console.log(web3js.version.network);

  // switch (web3js.version.network) {
  //   case "1":
  //     console.log('This is mainnet')
  //     break
  //   case "2":
  //     console.log('This is the deprecated Morden test network.')
  //     break
  //   case "3":
  //     console.log('This is the ropsten test network.')
  //     break
  //   case "4":
  //     console.log('This is the Rinkeby test network.')
  //     break
  //   case "42":
  //     console.log('This is the Kovan test network.')
  //     break
  //   default:
  //     console.log('This is an unknown network.')
  // }

  const desiredNetwork = '5777';
  // const desiredNetwork = '4447';
  // const desiredNetwork = '3';

  return {
    network: web3.version.network,
    desiredNetwork,
    isRightNetwork: web3.version.network === desiredNetwork,
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
    receipt = getTransactionReceiptPromise(hash);
    await wait(1000);
  }
  return receipt;
};
