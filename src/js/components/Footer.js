import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import {
  Link,
  NavLink,
} from 'react-router-dom';

import getDonations from '../selectors/donations';

const Footer = (props) => {
  const { donations } = props;
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        { donations.length > 2 && (
          <div>
            <storng className="is-size-4">Top Donations</storng>
            <br />
            {
              donations.slice(0, 3).map(o => (
                <div
                  key={o.timestamp}
                >
                  <a
                    className="is-size-4"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={o.url}
                  >
                    {o.name}
                  </a>
                  <br />
                </div>
              ))
            }
            <small>
              <Link to="/donations">View all</Link>
            </small>
          </div>
        )}
        <br />
        <div>
          <p className="title is-5">Donate</p>
          <p className="subtitle is-5">
            <Link to="/donate">
              <small>0x4632F4120DC68F225e7d24d973Ee57478389e9Fd</small>
            </Link>
          </p>
        </div>
        <hr />
        <p>
          <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/ylv_io">Twitter</a>
          <span> | </span>
          <a target="_blank" rel="noopener noreferrer" href="https://medium.com/@ylv">Medium </a>
          <span> | </span>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/ylv-io/coinpledge">Github</a>
          <span> | </span>
          <a target="_blank" rel="noopener noreferrer" href="https://t.me/ylv_public">Telegram</a>
          <span> | </span>
          <a target="_blank" rel="noopener noreferrer" href="https://etherscan.io/address/0x896F11b2628208e09BD5CFdD0C4f7C28C0349d61">Etherscan</a>
          <span> | </span>
          <a target="_blank" rel="noopener noreferrer" href="https://www.stateofthedapps.com/dapps/coinpledge">State of dApps</a>
        </p>
        <p>
          <span>Built by </span>
          <a href="https://ylv.io/">Igor Yalovoy</a>
        </p>
      </div>
    </footer>
  );
};

const mapStateToProps = (state, props) => ({
  donations: getDonations(state.donations),
});

export default connect(mapStateToProps)(Footer);
