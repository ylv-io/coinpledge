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


class Header extends React.Component {
  onBurgerClicked = () => {
    const toggle = document.querySelector('.navbar-burger');
    const menu = document.querySelector('.navbar-menu');
    toggle.classList.toggle('is-active');
    menu.classList.toggle('is-active');
  }

  render() {
    const {
      installed,
      locked,
      username,
      account,
      bonusFund,
    } = this.props;

    return (
      <header>
        <nav className="navbar is-success" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <Link to="/" className="navbar-item">
              <img src={logo} alt="logo" />
            </Link>

            <a
              href="#"
              role="button"
              className="navbar-burger"
              aria-label="menu"
              aria-expanded="false"
              onClick={this.onBurgerClicked}
              onKeyPress={this.onBurgerClicked}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </a>
          </div>
          <div className="navbar-menu">

            { installed && !locked
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
                  ? (
                    <NavLink className="navbar-item" to="/account" activeClassName="is-active" exact>
                      { !username ? account.substring(0, 10) : username }
                    </NavLink>
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
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  ...state.blockchain,
});

export default connect(mapStateToProps, null, null, { pure: false })(Header);
