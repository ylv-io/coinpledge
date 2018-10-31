import React from 'react';
import { connect } from 'react-redux';

import { getChallenges } from '../selectors/challenges';
import MentorChallenge from './MentorChallenge';
import { resolveChallenge } from '../services/web3/challenge';
import { updateMentorChallenge } from '../actions/mentorChallenges';

class MentorChallenges extends React.Component {
  getHandleResolve = (challenge, decision) => (
    async (e) => {
      const { props } = this;
      e.preventDefault();
      const hash = await resolveChallenge(challenge.id, decision);
      props.dispatch(updateMentorChallenge(challenge.id, { isSubmitting: true }));
    }
  )

  render() {
    const { challenges, history } = this.props;
    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-4">Mentor</h4>
          <hr />
          { !challenges.length && (
            <p className="">
              You don&#39;t have any people to mentor.
              <br />
              <a href="https://t.me/ylv_public">Connect with people.</a>
              <br />
              Make World a Better Place!
            </p>
          )
        }
          <div className="columns is-multiline">
            {
              challenges.map(o => (
                <div className="column is-4" key={o.id}>
                  <MentorChallenge
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
                      <MentorChallenge
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

const mapStateToProps = state => ({
  challenges: getChallenges(state.mentorChallenges, state.users, o => !o.resolved),
  history: getChallenges(state.mentorChallenges, state.users, o => o.resolved),
});

export default connect(mapStateToProps)(MentorChallenges);
