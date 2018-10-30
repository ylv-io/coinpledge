import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { getChallenges } from '../selectors/challenges';
import Challenge from './Challenge';
import { shortAddress } from '../utils/web3';
import { getChallengesForMentor, getChallengesForUser } from '../services/web3/challenge';
import { getWeb3js } from '../services/web3/web3';
import { getUsername } from '../services/web3/user';

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userChallenges: [],
      mentorChallenges: [],
      notFound: false,
      username: '',
    };
  }

  componentDidMount() {
    const { match, users } = this.props;
    this.updateStateFromWeb3(users);
  }

  componentDidUpdate(prevProps) {
    const { match, users } = this.props;
    if (match.params.id !== prevProps.match.params.id || users !== prevProps.users) {
      this.updateStateFromWeb3(users);
    }
  }

  async updateStateFromWeb3(users) {
    const web3js = getWeb3js();
    const { match } = this.props;
    const { id } = match.params;

    const isAddress = web3js.isAddress(id);
    if (!isAddress) {
      this.setState(() => ({ notFound: true }));
      return;
    }

    let result = await getChallengesForUser(id);
    this.setState(o => ({ userChallenges: getChallenges(result, users, x => true) }));

    result = await getChallengesForMentor(id);
    this.setState(o => ({ mentorChallenges: getChallenges(result, users, x => true) }));

    result = await getUsername(id);
    this.setState(o => ({ username: result }));
  }

  render() {
    const {
      notFound,
      userChallenges,
      mentorChallenges,
      username,
    } = this.state;
    const { match } = this.props;
    const shortAccount = shortAddress(match.params.id);

    if (notFound) return <Redirect to="/404" />;

    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-3">
            <span>User </span>
            <a target="_blank" rel="noopener noreferrer" href={`https://ropsten.etherscan.io/address/${match.params.id}`}>
              { username ? `${username} (${shortAccount})` : shortAccount }
            </a>
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

const mapStateToProps = state => ({
  users: state.users,
});

export default connect(mapStateToProps)(User);
