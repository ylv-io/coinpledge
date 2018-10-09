import React from 'react'
import { connect } from 'react-redux';
import Challenge from './Challenge';
import { resolveChallenge } from '../services/web3/challenge';
import { updateChallenge } from '../actions/challenges';

class Challenges extends React.Component {
  constructor(props) {
    super(props);
  }
  getHandleResolve = (challenge, decision) => {
    return async (e) => {
      e.preventDefault();
      const hash = await resolveChallenge(challenge.id, decision);
      this.props.dispatch(updateChallenge(challenge.id, { isSubmitting: true}));
    };
  }

  render() {
    return(
      <section className="section">
        <div className="container">
          <h4 className="title is-4">Your Challenges</h4>
          <hr/>
          { !this.props.challenges.length && <p className="title is-4">You don't have any challenges yet. Create one. You can do it!</p>}
          <div className="columns is-multiline">
            {this.props.challenges.map((o) => 
              <div className="column is-4" key={o.id}>
                <Challenge 
                  challenge={o} 
                  handleWin={this.getHandleResolve(o, true)} 
                  handleLoss={this.getHandleResolve(o, false)} 
                  />
              </div>)}
          </div>

          {!!this.props.history.length && (
            <div>
              <h4 className="title is-4">History</h4>
              <hr/>
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

const mapStateToProps = (state, props) => {
  return {
    challenges: state.challenges.filter(o => !o.resolved),
    history: state.challenges.filter(o => o.resolved)
  }
};

export default connect(mapStateToProps)(Challenges);