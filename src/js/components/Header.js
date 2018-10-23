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


const Header = props => (
  <header>
    <nav className="navbar is-success" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img src={logo} alt="logo" />
        </Link>

        <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div className="navbar-menu">
        
        { props.installed && !props.locked && props.isRightNetwork && 
          (
            <div className="navbar-start">
              <NavLink className="navbar-item" to="/new" activeClassName="is-active" exact={true}>New</NavLink>
              <NavLink className="navbar-item" to="/challenges" activeClassName="is-active" exact={true}>Challenges</NavLink>
              <NavLink className="navbar-item" to="/mentor" activeClassName="is-active" exact={true}>Mentor</NavLink>
            </div>
          )}
        
        <div className="navbar-end">
          { props.installed ?
            (
              !props.locked ?
              (
                props.isRightNetwork ?
                (
                  <NavLink className="navbar-item" to="/account" activeClassName="is-active" exact={true}>{props.username? props.username : props.account? props.account.substring(0, 10): ''}</NavLink>
                ):
                <div className="navbar-item">
                  Switch to Ropsten
                </div>  
              ):
              <div className="navbar-item">
                Unlock MetaMask
              </div>
            ):
              <div className="navbar-item">
                Install&nbsp;<a target="_blank" href="https://metamask.io/">MetaMask</a>
              </div>
          }
        { props.installed && !props.locked && props.account && props.isRightNetwork && <div className="navbar-item">{Math.round(props.bonusFund * 100) / 100} ether</div>}
        </div>
      </div>
    </nav>
  </header>
);

const mapStateToProps = (state, props) => {
  let network, desiredNetwork, isRightNetwork;
  if (getWeb3js()) ({ network, desiredNetwork, isRightNetwork } = getNetwork());
  return {
    ...state.blockchain,
    isRightNetwork,
  };
};

export default connect(mapStateToProps, null, null, { pure: false })(Header);
