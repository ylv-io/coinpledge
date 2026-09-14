import React from 'react';
import { getWithdrawalBalance, withdrawFunds } from '../services/web3/payments';
import { getTransactionReceipt } from '../services/web3/web3';

export default class WithdrawFunds extends React.Component {
  state = {
    balance: '0', loading: true, submitting: false, error: '',
  };

  componentDidMount() {
    this.active = true;
    this.refreshBalance();
    this.timer = setInterval(this.refreshBalance, 5000);
  }

  componentDidUpdate(prevProps) {
    const { account } = this.props;
    if (prevProps.account !== account) this.refreshBalance(true);
  }

  componentWillUnmount() {
    this.active = false;
    clearInterval(this.timer);
  }

  isCurrentAccount = (account) => {
    const { account: currentAccount } = this.props;
    return this.active && account === currentAccount;
  };

  refreshBalance = async (reset = false) => {
    const { account } = this.props;
    if (reset) this.setState({ balance: '0', loading: true, error: '' });
    if (!account) return;
    try {
      const balance = await getWithdrawalBalance(account);
      if (this.isCurrentAccount(account)) {
        this.setState({ balance, loading: false });
      }
    } catch (error) {
      if (this.isCurrentAccount(account)) {
        this.setState({ loading: false, error: error.message });
      }
    }
  };

  handleWithdraw = async () => {
    const { account } = this.props;
    this.setState({ submitting: true, error: '' });
    try {
      const hash = await withdrawFunds(account);
      const receipt = await getTransactionReceipt(hash);
      if (receipt.status === false || receipt.status === 0 || receipt.status === '0x0') {
        throw new Error('The withdrawal failed. Your funds remain available.');
      }
      await this.refreshBalance();
    } catch (error) {
      if (this.isCurrentAccount(account)) this.setState({ error: error.message });
    } finally {
      if (this.active) this.setState({ submitting: false });
    }
  };

  render() {
    const { account } = this.props;
    const {
      balance, loading, submitting, error,
    } = this.state;
    return (
      <div>
        <p className="title is-4">Available to withdraw</p>
        <p className="subtitle is-5">{loading ? 'Loading…' : `${balance} ether`}</p>
        <p>Payouts, rewards, and donations are collected here. Bonus funds also unlock when the game ends.</p>
        <button
          type="button"
          className={`button is-primary ${submitting ? 'is-loading' : ''}`}
          disabled={!account || loading || submitting || balance === '0'}
          onClick={this.handleWithdraw}
        >
          {submitting ? 'Waiting for confirmation' : 'Withdraw to wallet'}
        </button>
        {error && <p className="has-text-danger" role="alert">{error}</p>}
      </div>
    );
  }
}
