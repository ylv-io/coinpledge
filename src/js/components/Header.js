import React from 'react';
import { BrowserRouter, Route, Switch, Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import logo from '../../img/logo.png'


const Header = (props) => (
  <header>
    <nav className="navbar is-success" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to={'/'} className="navbar-item">
          <img src={logo} alt="logo" />
        </Link>

        <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div className="navbar-menu">
        <div className="navbar-start">
          { props.installed && !props.locked && <NavLink className="navbar-item" to="/new" activeClassName="is-active" exact={true}>New</NavLink>}
          { props.installed && !props.locked && <NavLink className="navbar-item" to="/challenges" activeClassName="is-active" exact={true}>Challenges</NavLink>}
          { props.installed && !props.locked && <NavLink className="navbar-item" to="/mentor" activeClassName="is-active" exact={true}>Mentor</NavLink>}
        </div>
        <div className="navbar-end">
        { props.installed ? 
            (
              !props.locked ?
              <a className="navbar-item" target="_blank" href={`https://ropsten.etherscan.io/address/${props.account}`}>{props.account? props.account.substring(0, 10): ''}</a>:
              <div className="navbar-item">
                Unlock MetaMask
              </div>
            ):
            <div className="navbar-item">
              Install&nbsp;<a target="_blank" href="https://metamask.io/">MetaMask</a>
            </div>
        }
        { props.account && <div className="navbar-item">{Math.round(props.bonusFund * 100) / 100} ether</div>}
        </div>
      </div>
    </nav>
  </header>
);

const mapStateToProps = (state, props) => {
  return {
    ...state.blockchain
  }
};

export default connect(mapStateToProps, null, null, { pure: false })(Header);