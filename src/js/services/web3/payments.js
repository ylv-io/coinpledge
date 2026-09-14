import { getCoinContractPromise, fromWei } from './web3';

export const getWithdrawalBalance = async (account) => {
  const instance = await getCoinContractPromise();
  const balance = await instance.withdrawableBalance.call(account, { from: account });
  return fromWei(balance.toString(10), 'ether').toString();
};

export const withdrawFunds = async (account) => {
  const instance = await getCoinContractPromise();
  return instance.withdraw.sendTransaction({ from: account });
};
