import React from 'react';
import { connect } from 'react-redux';

import UserChallenge from './UserChallenge';
import { getChallenges } from '../selectors/challenges';
import { resolveChallenge } from '../services/web3/challenge';
import { updateUserChallenge } from '../actions/userChallenges';

class UserChallenges extends React.Component {
  getHandleResolve = (challenge, decision) => (
    async (e) => {
      const { props } = this;
      e.preventDefault();
      const hash = await resolveChallenge(challenge.id, decision);
      props.dispatch(updateUserChallenge(challenge.id, { isSubmitting: true }));
    }
  )

  render() {
    const {
      challenges,
      history,
    } = this.props;

    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-4">Your Challenges</h4>
          <hr />
          { !challenges.length && <p className="title is-4">You don&#39;t have any challenges yet. Create one. Be Better Version of Yourself!</p>}
          <div className="columns is-multiline">
            {
              challenges.map(o => (
                <div className="column is-4" key={o.id}>
                  <UserChallenge
                    challenge={o}
                    handleWin={this.getHandleResolve(o, true)}
                    handleLoss={this.getHandleResolve(o, false)}
                  />
                </div>
              ))
            }
          </div>

          {!!history.length && (
            <div>
              <h4 className="title is-4">History</h4>
              <hr />
              <div className="columns is-multiline">
                {
                  history.map(o => (
                    <div className="column is-4" key={o.id}>
                      <UserChallenge
                        challenge={o}
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          )}

        </div>
      </section>
    );
  }
}

const mapStateToProps = (state, props) => ({
  challenges: getChallenges(state.userChallenges, state.users, o => !o.resolved),
  history: getChallenges(state.userChallenges, state.users, o => o.resolved),
});

export default connect(mapStateToProps)(UserChallenges);
