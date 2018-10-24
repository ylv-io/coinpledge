import React from 'react';
import { connect } from 'react-redux';
import Challenge from './Challenge';
import { resolveChallenge } from '../services/web3/challenge';
import { updateMentorChallenge } from '../actions/mentorChallenges';

class Mentor extends React.Component {
  getHandleResolve = (challenge, decision) => (
    async (e) => {
      const { props } = this;
      e.preventDefault();
      const hash = await resolveChallenge(challenge.id, decision);
      props.dispatch(updateMentorChallenge(challenge.id, { isSubmitting: true }));
    }
  )

  render() {
    const { mentor, history } = this.props;
    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-4">Mentor</h4>
          <hr />
          { !mentor.length && <p className="title is-4">You don&apos;t have any challenges yet. Help someone!</p>}
          <div className="columns is-multiline">
            {
              mentor.map(o => (
                <div className="column is-4" key={o.id}>
                  <Challenge
                    challenge={o}
                    handleWin={this.getHandleResolve(o.id, true)}
                    handleLoss={this.getHandleResolve(o.id, false)}
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
                      <Challenge
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
  mentor: state.mentorChallenges.filter(o => !o.resolved),
  history: state.mentorChallenges.filter(o => o.resolved),
});

export default connect(mapStateToProps)(Mentor);
