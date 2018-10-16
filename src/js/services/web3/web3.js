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

export const getBalance = () => {
  const web3js = getWeb3js();
  if(getAccount()) {
    web3js.eth.getBalance(getAccount(), (err, balance) => {
      const balanceInEth = web3js.fromWei(balance, "ether");
      console.log(`balance ${balanceInEth} ether`);
      return balanceInEth;
    });
  }
}

export const getNetwork = () => {
  const web3js = getWeb3js();

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

  const desiredNetwork = "3";
  return { network: web3js.version.network, desiredNetwork, isRightNetwork: web3js.version.network === desiredNetwork};

}

let coinContractInstance;

export const getCoinContractPromise = async () => {
  const web3js = getWeb3js();

  if(coinContractInstance === undefined)
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
  const web3js = getWeb3js();
  
  return web3js.eth.accounts[0];
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
  const web3js = getWeb3js();
  
  return new Promise(function(resolve, reject) {
      web3js.eth.getTransactionReceipt(hash, function(err, data) {
          if (err !== null) reject(err);
          else resolve(data);
      });
  });
}