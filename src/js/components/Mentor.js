import React from 'react'
import { connect } from 'react-redux';
import Challenge from './Challenge';
import { resolveChallenge } from '../services/web3/web3';

class Mentor extends React.Component {
  constructor(props) {
    super(props);
  }
  getHandleResolve(id, decision) {
    return () => resolveChallenge(id, decision);
  }

  render() {
    return(
      <section className="section">
        <div className="container">
          <h4 className="title is-4">Mentor</h4>
          <hr/>
          { !this.props.mentor.length && <p className="title is-4">You don't have any cases yet. Help someone!</p>}
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
    mentor: state.mentor.filter(o => !o.resolved),
    history: state.mentor.filter(o => o.resolved)
  }
};

export default connect(mapStateToProps)(Mentor);