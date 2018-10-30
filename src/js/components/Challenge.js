import React from 'react';
import moment from 'moment';

import { Link } from 'react-router-dom';

import { shortAddress } from '../utils/web3';
import { fromWei } from '../services/web3/web3';

export default class Challenge extends React.Component {
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
        <div className="card-content">
          <p className="is-size-5">
            <Link to={`/${challenge.user}`}>{challenge.username}</Link>
            <span> pleged to </span>
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
      </div>
    );
  }
}
