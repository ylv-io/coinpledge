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
          <NavLink className="navbar-item" to="/create" activeClassName="is-active" exact={true}>Create</NavLink>
          <NavLink className="navbar-item" to="/challenges" activeClassName="is-active" exact={true}>Challenges</NavLink>
          <NavLink className="navbar-item" to="/mentor" activeClassName="is-active" exact={true}>Mentor</NavLink>
          <NavLink className="navbar-item" to="/FAQ" activeClassName="is-active" exact={true}>FAQ</NavLink>
        </div>
        <div className="navbar-end">
          <a className="navbar-item" target="_blank" href={`https://ropsten.etherscan.io/address/${props.account}`}>{props.account.substring(0, 10)}</a>
          <div className="navbar-item">{props.bonusFund} ether</div>
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

export default connect(mapStateToProps)(Header);