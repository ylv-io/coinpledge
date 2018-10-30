import React from 'react';

import {
  Link,
  NavLink,
} from 'react-router-dom';

import { connect } from 'react-redux';

import {
  getWeb3js,
  getNetwork,
} from '../services/web3/web3';

import logo from '../../img/logo.png';


const Header = (props) => {
  const {
    installed,
    locked,
    isRightNetwork,
    username,
    account,
    bonusFund,
  } = props;

  return (
    <header>
      <nav className="navbar is-success" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">
            <img src={logo} alt="logo" />
          </Link>

          <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </a>
        </div>
        <div className="navbar-menu">

          { installed && !locked && isRightNetwork
            && (
              <div className="navbar-start">
                <NavLink className="navbar-item" to="/new" activeClassName="is-active" exact>New</NavLink>
                <NavLink className="navbar-item" to="/challenges" activeClassName="is-active" exact>Challenges</NavLink>
                <NavLink className="navbar-item" to="/mentor" activeClassName="is-active" exact>Mentor</NavLink>
              </div>
            )}

          <div className="navbar-end">
            { installed
              ? (!locked
                ? (isRightNetwork
                  ? (<NavLink className="navbar-item" to="/account" activeClassName="is-active" exact>{ !username ? account.substring(0, 10) : username }</NavLink>)
                  : (
                    <div className="navbar-item">
                      Switch to Ropsten
                    </div>
                  )
                )
                : (
                  <div className="navbar-item">
                    Unlock MetaMask
                  </div>
                )
              )
              : (
                <div className="navbar-item">
                  Install&nbsp;
                  <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/">MetaMask</a>
                </div>
              )}
            { installed && !locked && account && isRightNetwork && (
              <div className="navbar-item">
                <span>
                  {Math.round(bonusFund * 100) / 100 }
                  &nbsp;ether
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

const mapStateToProps = (state, props) => {
  let isRightNetwork;
  if (getWeb3js()) ({ isRightNetwork } = getNetwork());
  return {
    ...state.blockchain,
    isRightNetwork,
  };
};

export default connect(mapStateToProps, null, null, { pure: false })(Header);
