import React from 'react';
import moment from 'moment';

import { Link } from 'react-router-dom';

import { shortAddress } from '../utils/web3';
import { fromWei } from '../services/web3/web3';

export default class UserChallenge extends React.Component {
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
              { challenge.resolved ? challenge.successed ? 'Win' : 'Loss' : 'Be Better Version of Yourself' }
            </span>
          </p>
        </header>
        <div className="card-content">
          <p className="is-size-5">
            <span>I pledge to </span>
            <strong>
              {challenge.name}
            </strong>
            <span> before </span>
            {moment.unix(challenge.startDate).add(challenge.time, 's').format('DD MMM YYYY')}
            <span> by staking </span>
            {challenge.value}
            <span> ether</span>
            <span> with </span>
            <Link to={`/${challenge.mentor}`}>{challenge.mentorname}</Link>
            <span> as mentor.</span>
          </p>
        </div>
        <footer className="card-footer">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I pledge to "${challenge.name}" before ${moment.unix(challenge.startDate).add(challenge.time, 's').format('DD MMM YYYY')} by staking ${challenge.value} ether at coinpledge.ylv.io.`)}&hashtags=coinpledge`}
            target="_blank"
            rel="noopener noreferrer"
            className="card-footer-item"
          >
            <span className="icon">
              <i className="fab fa-twitter" />
            </span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=coinpledge.ylv.io&quote=${encodeURIComponent(`I pledge to "${challenge.name}" before ${moment.unix(challenge.startDate).add(challenge.time, 's').format('DD MMM YYYY')} by staking ${challenge.value} ether at coinpledge.ylv.io.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card-footer-item"
          >
            <span className="icon">
              <i className="fab fa-facebook" />
            </span>
          </a>
        </footer>
      </div>
    );
  }
}
