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
    <React.Fragment>

      <footer className="footer">
        <div className="content has-text-centered">
          <div className="columns">
            <div className="column is-offset-one-quarter is-half">
              { donations.length > 2 && (
                <div>
                  <h1 className="title is-4 has-text-centered">Top Donations</h1>
                  <nav className="level">
                    {
                      donations.slice(0, 3).map(o => (
                        <div
                          className="level-item has-text-centered"
                          key={o.timestamp}
                        >
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={o.url}
                          >
                            <span className="is-size-4">{o.name}</span>
                          </a>
                          <br />
                        </div>
                      ))
                    }
                    <div className="level-item has-text-centered">
                      <Link to="/donations">View all</Link>
                    </div>
                    <div className="level-item has-text-centered">
                      <p className="subtitle is-5">
                        <Link to="/donate" className="button is-success">
                          Donate
                        </Link>
                      </p>
                    </div>
                  </nav>
                  <hr />
                </div>
              )}
            </div>
          </div>
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
    </React.Fragment>
  );
};

const mapStateToProps = (state, props) => ({
  donations: getDonations(state.donations),
});

export default connect(mapStateToProps)(Footer);
