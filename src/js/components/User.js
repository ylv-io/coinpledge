import React from 'react';
import { Redirect } from 'react-router-dom';

import Challenge from './Challenge';
import { shortAddress } from '../utils/web3';
import { getChallengesForMentor, getChallengesForUser } from '../services/web3/challenge';
import { getWeb3js } from '../services/web3/web3';

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userChallenges: [],
      mentorChallenges: [],
      notFound: false,
    };
  }

  componentDidMount() {
    this.updateStateFromWeb3();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    if (match.params.id !== prevProps.match.params.id) {
      this.updateStateFromWeb3();
    }
  }

  async updateStateFromWeb3() {
    const web3js = getWeb3js();
    const { match } = this.props;
    const { id } = match.params;
    const isAddress = web3js.isAddress(id);
    if (!isAddress) {
      this.setState(() => ({ notFound: true }));
      return;
    }

    let result = await getChallengesForUser(id);
    this.setState(o => ({ userChallenges: result }));

    result = await getChallengesForMentor(id);
    this.setState(o => ({ mentorChallenges: result }));
  }

  render() {
    const { notFound, userChallenges, mentorChallenges } = this.state;
    const { match } = this.props;

    if (notFound) return <Redirect to="/404" />;

    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-3">
            User
            {' '}
            <a target="_blank" rel="noopener noreferrer" href={`https://ropsten.etherscan.io/address/${match.params.id}`}>{shortAddress(match.params.id)}</a>
          </h4>
          <h4 className="title is-4">Challenges</h4>
          <hr />
          { !userChallenges.length && <p className="title is-4">User do not have any challenges.</p>}
          <div className="columns is-multiline">
            {userChallenges.map(o => (
              <div className="column is-4" key={o.id}>
                <Challenge
                  challenge={o}
                />
              </div>
            ))}
          </div>

          <h4 className="title is-4">Mentor</h4>
          <hr />
          { !mentorChallenges.length && <p className="title is-4">User don&apos;t have any challenges to mentor yet.</p>}
          <div className="columns is-multiline">
            {mentorChallenges.map(o => (
              <div className="column is-4" key={o.id}>
                <Challenge
                  challenge={o}
                />
              </div>
            ))}
          </div>

        </div>
      </section>
    );
  }
}

export default User;
