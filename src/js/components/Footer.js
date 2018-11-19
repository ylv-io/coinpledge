import React from 'react';

import { toWei } from '../services/web3/web3';
import { donate } from '../services/web3/challenge';

class Footer extends React.Component {
  handleDonate = (e) => {
    e.preventDefault();
    donate('ylv', 'ylv.io', toWei(0.1, 'ether'));
  };

  render() {
    return (
      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <a href="https://twitter.com/ylv_io">Twitter</a>
            <span> | </span>
            <a href="https://medium.com/@ylv">Medium </a>
            <span> | </span>
            <a href="https://github.com/ylv-io/coinpledge">Github</a>
            <span> | </span>
            <a href="https://t.me/ylv_public">Telegram</a>
          </p>
          <p>
            Donate
            <br />
            <a onClick={this.handleDonate} href="#"><small>0x4632F4120DC68F225e7d24d973Ee57478389e9Fd</small></a>
          </p>
          <p>
            <span>Built by </span>
            <a href="https://ylv.io/">Igor Yalovoy</a>
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
