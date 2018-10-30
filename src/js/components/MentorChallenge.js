import React from 'react';
import moment from 'moment';

import { Link } from 'react-router-dom';

import { shortAddress } from '../utils/web3';
import { fromWei } from '../services/web3/web3';

export default class MentorChallenge extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const {
      challenge,
      handleWin,
      handleLoss,
    } = this.props;

    return (
      <div className="card">
        <header className="card-header ">
          <p className={`card-header-title ${challenge.resolved ? challenge.successed ? 'has-background-success' : 'has-background-danger' : ''}`}>
            <span className={challenge.resolved ? 'has-text-white' : ''}>
              { challenge.resolved ? challenge.successed ? 'Win' : 'Loss' : 'Make World Better Place' }
            </span>
          </p>
        </header>
        <div className="card-content">
          <p className="is-size-5">
            <span>I pledge to mentor </span>
            <Link to={`/${challenge.user}`}>{ challenge.username }</Link>
            <span> to </span>
            <strong>
              {challenge.name}
            </strong>
            <span> before </span>
            <span>{moment.unix(challenge.startDate).add(challenge.time, 's').format('DD MMM YYYY')}</span>
            <span> for </span>
            {challenge.mentorFee}
            <span> ether </span>
            reward.
          </p>
        </div>
        <footer className="card-footer">
          { challenge.canResolve && !challenge.isSubmitting && handleWin
            && (
            <a
              href="#"
              className="card-footer-item has-text-success"
              onClick={handleWin}
            >
              Win
            </a>
            )
          }
          { challenge.canResolve && !challenge.isSubmitting && handleLoss
            && (
              <a
                href="#"
                className="card-footer-item has-text-danger"
                onClick={handleLoss}
              >
              Loss
              </a>
            )
          }
        </footer>
      </div>
    );
  }
}
