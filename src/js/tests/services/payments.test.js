import { getWithdrawalBalance, withdrawFunds } from '../../services/web3/payments';
import { getCoinContractPromise, fromWei } from '../../services/web3/web3';

jest.mock('../../services/web3/web3', () => ({
  getCoinContractPromise: jest.fn(), fromWei: jest.fn(),
}));

test('converts wei using decimal strings without a JavaScript number round-trip', async () => {
  const call = jest.fn().mockResolvedValue({ toString: () => '1000000000000000001' });
  getCoinContractPromise.mockResolvedValue({ withdrawableBalance: { call } });
  fromWei.mockReturnValue('1.000000000000000001');
  expect(await getWithdrawalBalance('alice')).toBe('1.000000000000000001');
  expect(fromWei).toHaveBeenCalledWith('1000000000000000001', 'ether');
});

test('submits the withdrawal from the displayed account', async () => {
  const sendTransaction = jest.fn().mockResolvedValue('hash');
  getCoinContractPromise.mockResolvedValue({ withdraw: { sendTransaction } });
  expect(await withdrawFunds('alice')).toBe('hash');
  expect(sendTransaction).toHaveBeenCalledWith({ from: 'alice' });
});
