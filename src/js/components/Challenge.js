import React from 'react';
import moment from 'moment';

import {
  Link,
} from 'react-router-dom';

import { shortAddress } from '../utils/web3';

export default class Challenge extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <div className="card">
        <header className="card-header ">
          <p className={"card-header-title " + (this.props.challenge.resolved ? this.props.challenge.successed ? "has-background-success" : "has-background-danger" : "")}>
            <span className={this.props.challenge.resolved ? "has-text-white" : ""}> { this.props.challenge.resolved ? this.props.challenge.successed ? "Win" : "Loss" : "Do It" } </span>
          </p>
        </header>
        <div className="card-content">
          <p className="is-size-5">
            I pledge to <strong className="is-size-4">"{this.props.challenge.name}"</strong> before <strong>{moment.unix(this.props.challenge.startDate).add(this.props.challenge.time, 's').format("DD MMM YYYY")}</strong> by staking <strong>{this.props.challenge.value} ether</strong>.
          </p>
          <small>by <Link to={`/${this.props.challenge.user}`}>{shortAddress(this.props.challenge.user)}</Link>/<Link to={`/${this.props.challenge.mentor}`}>{shortAddress(this.props.challenge.mentor)}</Link>
          </small>
        </div>
        <footer className="card-footer">
          { this.props.challenge.canResolve && !this.props.challenge.isSubmitting &&
              <a 
                href="#" 
                className="card-footer-item has-text-success" 
                onClick={this.props.handleWin}
              >
              Win</a>
          }
          { this.props.challenge.canResolve && !this.props.challenge.isSubmitting &&
            <a 
              href="#" 
              className="card-footer-item has-text-danger" 
              onClick={this.props.handleLoss}
            >
              Loss</a>
          }
        </footer>
      </div>
    );
  }
}
