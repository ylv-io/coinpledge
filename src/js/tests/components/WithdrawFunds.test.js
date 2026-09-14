import React from 'react';
import { shallow } from 'enzyme';
import WithdrawFunds from '../../components/WithdrawFunds';
import { getWithdrawalBalance, withdrawFunds } from '../../services/web3/payments';
import { getTransactionReceipt } from '../../services/web3/web3';

jest.mock('../../services/web3/payments', () => ({
  getWithdrawalBalance: jest.fn(), withdrawFunds: jest.fn(),
}));
jest.mock('../../services/web3/web3', () => ({ getTransactionReceipt: jest.fn() }));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  getWithdrawalBalance.mockResolvedValue('1.000000000000000001');
});

afterEach(() => { jest.useRealTimers(); });

test('shows exact balance, submits a withdrawal, and refreshes after confirmation', async () => {
  const wrapper = shallow(<WithdrawFunds account="alice" />);
  await wrapper.instance().refreshBalance();
  expect(wrapper.text()).toContain('1.000000000000000001 ether');
  withdrawFunds.mockResolvedValue('hash');
  getTransactionReceipt.mockResolvedValue({ status: '0x1' });
  getWithdrawalBalance.mockResolvedValue('0');
  await wrapper.instance().handleWithdraw();
  expect(withdrawFunds).toHaveBeenCalledWith('alice');
  expect(getTransactionReceipt).toHaveBeenCalledWith('hash');
  expect(wrapper.find('button').prop('disabled')).toBe(true);
  wrapper.unmount();
});

test('keeps funds visible and reports a reverted receipt', async () => {
  const wrapper = shallow(<WithdrawFunds account="alice" />);
  await wrapper.instance().refreshBalance();
  withdrawFunds.mockResolvedValue('hash');
  getTransactionReceipt.mockResolvedValue({ status: '0x0' });
  await wrapper.instance().handleWithdraw();
  expect(wrapper.find('[role="alert"]').text()).toContain('funds remain available');
  expect(wrapper.state('balance')).toBe('1.000000000000000001');
  wrapper.unmount();
});

test('does not display a stale balance after switching accounts', async () => {
  let finishAlice;
  getWithdrawalBalance.mockImplementation(account => (account === 'alice'
    ? new Promise((resolve) => { finishAlice = resolve; }) : Promise.resolve('2')));
  const wrapper = shallow(<WithdrawFunds account="alice" />);
  wrapper.setProps({ account: 'bob' });
  await wrapper.instance().refreshBalance();
  finishAlice('99');
  await Promise.resolve();
  expect(wrapper.state('balance')).toBe('2');
  wrapper.unmount();
});
