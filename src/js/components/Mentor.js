import React from 'react'
import { connect } from 'react-redux';
import Challenge from './Challenge';
import { resolveChallenge } from '../services/web3/challenge';

class Mentor extends React.Component {
  getHandleResolve(id, decision) {
    return () => resolveChallenge(id, decision);
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-4">Mentor</h4>
          <hr />
          { !this.props.mentor.length && <p className="title is-4">You don't have any challenges yet. Help someone!</p>}
          <div className="columns is-multiline">
            {this.props.mentor.map((o) => 
              <div className="column is-4" key={o.id}>
                <Challenge
                challenge={o}
                handleWin={this.getHandleResolve(o.id, true)}
                handleLoss={this.getHandleResolve(o.id, false)} />
              </div>
            )}
          </div>

          {!!this.props.history.length && (
            <div>
              <h4 className="title is-4">History</h4>
              <hr />
              <div className="columns is-multiline">
                {this.props.history.map((o) => 
                  <div className="column is-4" key={o.id}>
                    <Challenge
                      challenge={o}
                      />
                  </div>)}
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
