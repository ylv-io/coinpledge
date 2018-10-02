import React from 'react'
import { addExpense } from '../actions/challenges';
import { connect } from 'react-redux';
import Challenge from './Challenge';

class Challenges extends React.Component {
  constructor(props) {
    super(props);
  }
  getHandleResolve(id, decision) {
    return () => this.resolveChallenge(id, decision);
  }
  resolveChallenge = (id, decision) => {
    // this.state.coin.resolveChallenge(id, decision, {
    //   from: web3.eth.accounts[0]
    // })
    // .then((result) => {
    //   console.log(result);
    // })
    // .catch(function(e) {
    //   console.log(e);
    // });
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
                  handleWin={this.getHandleResolve(o.id, true)} 
                  handleLoss={this.getHandleResolve(o.id, false)} 
                  />
              </div>)}
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    challenges: state.challenges
  }
};

export default connect(mapStateToProps)(Challenges);